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
            }
        }

        // 3. Strict Validation: Stop fake guesses. If AI can't read it, throw an error.
        if (rawPlate == null || rawPlate.length() < 3) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Computer Vision failed to detect a clear plate. Please adjust camera angle or type it manually."
            ));
        }

        final String detectedPlate = rawPlate.replaceAll("[^a-zA-Z0-9]", "").toUpperCase().trim();

        // 4. Check Database
        Optional<Vehicle> vehicleOpt = vehicleRepository.findAll().stream()
                .filter(v -> v.getLicensePlate() != null && v.getLicensePlate().replaceAll("[^a-zA-Z0-9]", "").toUpperCase().equals(detectedPlate))
                .findFirst();

        String ownerName = "Unregistered Visitor";
        String status = "VISITOR (Unregistered)";
        if (vehicleOpt.isPresent()) {
            ownerName = vehicleOpt.get().getOwnerName() != null ? vehicleOpt.get().getOwnerName() : "Registered Owner";
            status = "AUTHORIZED";
        }

        String scanTime = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm:ss a"));

        GateScanLog log = new GateScanLog();
        log.setLicensePlate(detectedPlate);
        log.setOwnerName(ownerName);
        log.setScanTime(scanTime);
        log.setStatus(status);
        scanLogRepository.save(log);

        return ResponseEntity.ok(Map.of(
            "licensePlate", detectedPlate,
            "ownerName", ownerName,
            "status", status,
            "ticketId", "TICK-" + System.currentTimeMillis() % 100000,
            "scanTime", scanTime
        ));
    }
}