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

    private int calculateLevenshteinDistance(CharSequence lhs, CharSequence rhs) {
        int[][] distance = new int[lhs.length() + 1][rhs.length() + 1];
        for (int i = 0; i <= lhs.length(); i++) distance[i][0] = i;
        for (int j = 1; j <= rhs.length(); j++) distance[0][j] = j;
        for (int i = 1; i <= lhs.length(); i++) {
            for (int j = 1; j <= rhs.length(); j++) {
                int cost = (lhs.charAt(i - 1) == rhs.charAt(j - 1)) ? 0 : 1;
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
            rawPlate = payload.get("manualPlate");
        } 
        // 2. Send Webcam Frame to Python AI Sidecar
        else if (imageBase64 != null && !imageBase64.isEmpty() && !imageBase64.equals("MANUAL")) {
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
        }

        // 3. Strict Validation: Stop fake guesses. If AI can't read it, throw an error.
        if (rawPlate == null || rawPlate.length() < 3) {
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

        String finalDetectedPlate = initialDetectedPlate;

        if (!vehicleOpt.isPresent() && !payload.containsKey("manualPlate")) {
            // Fuzzy Matching Fallback (Levenshtein Distance)
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
            // If the OCR is only 1 or 2 characters off from a registered vehicle, auto-correct it!
            if (bestMatch != null && minDistance <= 2) {
                System.out.println("FUZZY MATCH ACTIVATED! Auto-correcting AI misread '" + initialDetectedPlate + "' to '" + bestMatch.getLicensePlate() + "' (Distance: " + minDistance + ")");
                vehicleOpt = Optional.of(bestMatch);
                finalDetectedPlate = bestMatch.getLicensePlate().replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
            }
        }

        String ownerName = "Unregistered Visitor";
        String status = "VISITOR (Unregistered)";
        if (vehicleOpt.isPresent()) {
            ownerName = vehicleOpt.get().getOwnerName() != null ? vehicleOpt.get().getOwnerName() : "Registered Owner";
            status = "AUTHORIZED";
        }

        String scanTime = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm:ss a"));

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