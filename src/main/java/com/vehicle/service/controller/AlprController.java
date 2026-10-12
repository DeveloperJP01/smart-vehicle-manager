package com.vehicle.service.controller;

import com.vehicle.service.model.GateScanLog;
import com.vehicle.service.model.Vehicle;
import com.vehicle.service.repository.GateScanLogRepository;
import com.vehicle.service.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alpr")
public class AlprController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private GateScanLogRepository scanLogRepository;

    // This allows Java to talk to your Python FastAPI Microservice
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PYTHON_AI_URL = "http://127.0.0.1:8000/process-plate";

    @GetMapping("/history")
    public List<GateScanLog> getScanHistory() {
        return scanLogRepository.findAllByOrderByIdDesc();
    }

    @DeleteMapping("/history/last")
    public ResponseEntity<?> clearLastScan() {
        List<GateScanLog> logs = scanLogRepository.findAllByOrderByIdDesc();
        if (logs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No scans available to delete."));
        }
        GateScanLog lastScan = logs.get(0);
        scanLogRepository.delete(lastScan);
        return ResponseEntity.ok(Map.of(
            "message", "Last scan deleted successfully.",
            "deletedScan", lastScan
        ));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteScan(@PathVariable Long id) {
        scanLogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Scan record deleted."));
    }

    private boolean areEquivalentChars(char a, char b) {
        if (a == b) return true;
        // Common Optical OCR confusion pairs on vehicle plates
        if ((a == 'O' && b == 'Q') || (a == 'Q' && b == 'O')) return true;
        if ((a == '0' && b == 'O') || (a == 'O' && b == '0')) return true;
        if ((a == '0' && b == 'Q') || (a == 'Q' && b == '0')) return true;
        if ((a == '1' && b == 'I') || (a == 'I' && b == '1')) return true;
        if ((a == '8' && b == 'B') || (a == 'B' && b == '8')) return true;
        if ((a == '5' && b == 'S') || (a == 'S' && b == '5')) return true;
        if ((a == '2' && b == 'Z') || (a == 'Z' && b == '2')) return true;
        return false;
    }

    private int calculateLevenshteinDistance(CharSequence lhs, CharSequence rhs) {
        int[][] distance = new int[lhs.length() + 1][rhs.length() + 1];
        for (int i = 0; i <= lhs.length(); i++) distance[i][0] = i;
        for (int j = 1; j <= rhs.length(); j++) distance[0][j] = j;
        for (int i = 1; i <= lhs.length(); i++) {
            for (int j = 1; j <= rhs.length(); j++) {
                int cost = areEquivalentChars(lhs.charAt(i - 1), rhs.charAt(j - 1)) ? 0 : 1;
                distance[i][j] = Math.min(Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1), distance[i - 1][j - 1] + cost);
            }
        }
        return distance[lhs.length()][rhs.length()];
    }

    @PostMapping("/scan")
    public ResponseEntity<?> scanPlate(@RequestBody Map<String, String> payload) {
        String imageBase64 = payload.get("imageBase64");
        String rawPlate = "";

        // 1. Manual Input Override
        if (payload.containsKey("manualPlate") && payload.get("manualPlate") != null && !payload.get("manualPlate").trim().isEmpty()) {
            rawPlate = payload.get("manualPlate").trim();
        } 
        // 2. Send Webcam Frame to Python AI Sidecar
        else if (imageBase64 != null && !imageBase64.trim().isEmpty() && !imageBase64.equals("MANUAL")) {
            try {
                if (imageBase64.contains(",")) {
                    imageBase64 = imageBase64.split(",")[1];
                }
                byte[] imageBytes = Base64.getDecoder().decode(imageBase64);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add("file", new org.springframework.core.io.ByteArrayResource(imageBytes) {
                    @Override
                    public String getFilename() {
                        return "frame.jpg";
                    }
                });

                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
                
                System.out.println("--- Sending Webcam Frame to Python AI ---");
                ResponseEntity<Map> aiResponse = restTemplate.postForEntity(PYTHON_AI_URL, requestEntity, Map.class);

                if (aiResponse.getStatusCode().is2xxSuccessful() && aiResponse.getBody() != null) {
                    Map<String, Object> responseBody = aiResponse.getBody();
                    if (responseBody.containsKey("licensePlate")) {
                        rawPlate = (String) responseBody.get("licensePlate");
                        System.out.println("AI Successfully Detected: " + rawPlate);
                    } else if (responseBody.containsKey("error")) {
                        System.err.println("AI Could not read plate: " + responseBody.get("error"));
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to connect to Python AI on port 8000: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "error", "ALPR Engine is offline. Please start the Python ALPR engine."
                ));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "No camera image or file received. Please ensure camera access is allowed or upload an image."
            ));
        }

        // 3. Validation: If AI could not detect any plate
        if (rawPlate == null || rawPlate.trim().length() < 3) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Computer Vision failed to detect a clear plate. Please adjust camera angle or type it manually."
            ));
        }

        final String initialDetectedPlate = rawPlate.replaceAll("[^a-zA-Z0-9]", "").toUpperCase().trim();

        // 4. Check Database with Exact and Fuzzy Matching
        List<Vehicle> allVehicles = vehicleRepository.findAll();
        Optional<Vehicle> vehicleOpt = allVehicles.stream()
                .filter(v -> v.getLicensePlate() != null && v.getLicensePlate().replaceAll("[^a-zA-Z0-9]", "").toUpperCase().equals(initialDetectedPlate))
                .findFirst();

        String finalDetectedPlate;

        if (vehicleOpt.isPresent()) {
            finalDetectedPlate = vehicleOpt.get().getLicensePlate();
        } else {
            // Fuzzy Matching Fallback (Weighted Optical Levenshtein Distance)
            Vehicle bestMatch = null;
            int minDistance = 999;
            for (Vehicle v : allVehicles) {
                if (v.getLicensePlate() == null) continue;
                String dbPlate = v.getLicensePlate().replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
                int dist = calculateLevenshteinDistance(initialDetectedPlate, dbPlate);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestMatch = v;
                }
            }
            int allowedDistance = payload.containsKey("manualPlate") ? 1 : 2;
            if (bestMatch != null && minDistance <= allowedDistance) {
                System.out.println("FUZZY MATCH ACTIVATED! Auto-correcting optical misread '" + initialDetectedPlate + "' to '" + bestMatch.getLicensePlate() + "' (Distance: " + minDistance + ")");
                vehicleOpt = Optional.of(bestMatch);
                finalDetectedPlate = bestMatch.getLicensePlate();
            } else {
                // Apply statutory RTO rule: convert O to Q in series letter position
                char[] plateChars = initialDetectedPlate.toCharArray();
                if (plateChars.length >= 8) {
                    int tailDigits = Math.min(4, plateChars.length - 4);
                    for (int i = 4; i < plateChars.length - tailDigits; i++) {
                        if (plateChars[i] == 'O') plateChars[i] = 'Q';
                    }
                }
                String rectified = new String(plateChars);

                if (rectified.length() == 10) {
                    finalDetectedPlate = rectified.substring(0, 2) + "-" + rectified.substring(2, 4) + "-" + rectified.substring(4, 6) + "-" + rectified.substring(6);
                } else if (rectified.length() == 9) {
                    if (Character.isDigit(rectified.charAt(3))) {
                        finalDetectedPlate = rectified.substring(0, 2) + "-" + rectified.substring(2, 4) + "-" + rectified.substring(4, 5) + "-" + rectified.substring(5);
                    } else {
                        finalDetectedPlate = rectified.substring(0, 2) + "-" + rectified.substring(2, 3) + "-" + rectified.substring(3, 5) + "-" + rectified.substring(5);
                    }
                } else {
                    finalDetectedPlate = rectified;
                }
            }
        }

        String ownerName = "Unregistered Visitor";
        String status = "UNAUTHORIZED";
        if (vehicleOpt.isPresent()) {
            ownerName = vehicleOpt.get().getOwnerName() != null ? vehicleOpt.get().getOwnerName() : "Registered Owner";
            status = "AUTHORIZED";
        }

        String scanTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss a"));

        GateScanLog log = new GateScanLog();
        log.setLicensePlate(finalDetectedPlate);
        log.setOwnerName(ownerName);
        log.setScanTime(scanTime);
        log.setStatus(status);
        scanLogRepository.save(log);

        return ResponseEntity.ok(Map.of(
            "licensePlate", finalDetectedPlate,
            "ownerName", ownerName,
            "status", status,
            "ticketId", "TICK-" + System.currentTimeMillis() % 100000,
            "scanTime", scanTime
        ));
    }
}