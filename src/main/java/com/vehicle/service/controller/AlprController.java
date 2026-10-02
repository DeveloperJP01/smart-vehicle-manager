package com.vehicle.service.controller;

import com.vehicle.service.model.GateScanLog;
import com.vehicle.service.model.Vehicle;
import com.vehicle.service.repository.GateScanLogRepository;
import com.vehicle.service.repository.VehicleRepository;
import net.sourceforge.tess4j.Tesseract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
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

    private static final Tesseract tesseract = new Tesseract();
    static {
        try {
            tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata");
            tesseract.setOcrEngineMode(1);
            tesseract.setPageSegMode(7);
            tesseract.setVariable("tessedit_char_whitelist", "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
        } catch (Exception e) {
            System.err.println("Tesseract Init Warning: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public List<GateScanLog> getScanHistory() {
        return scanLogRepository.findAllByOrderByIdDesc();
    }

    @PostMapping("/scan")
    public ResponseEntity<?> scanPlate(@RequestBody Map<String, String> payload) {
        String imageBase64 = payload.get("imageBase64");
        String rawPlate = "";

        // 1. PRIORITIZE MANUAL INPUT: If you typed a plate in the box, use it immediately
        if (payload.containsKey("manualPlate") && payload.get("manualPlate") != null && !payload.get("manualPlate").trim().isEmpty()) {
            rawPlate = payload.get("manualPlate");
        } 
        // 2. OTHERWISE, ATTEMPT WEBCAM OCR
        else if (imageBase64 != null && !imageBase64.isEmpty() && !imageBase64.equals("MANUAL")) {
            try {
                if (imageBase64.contains(",")) {
                    imageBase64 = imageBase64.split(",")[1];
                }
                byte[] imageBytes = Base64.getDecoder().decode(imageBase64);
                ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes);
                BufferedImage originalImage = ImageIO.read(bis);

                if (originalImage != null) {
                    int newWidth = originalImage.getWidth() * 2;
                    int newHeight = originalImage.getHeight() * 2;
                    BufferedImage scaledImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_BYTE_GRAY);
                    Graphics2D g2d = scaledImage.createGraphics();
                    g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
                    g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
                    g2d.dispose();

                    synchronized (tesseract) {
                        String ocrText = tesseract.doOCR(scaledImage);
                        if (ocrText != null) {
                            rawPlate = ocrText.replaceAll("[^a-zA-Z0-9]", "").toUpperCase().trim();
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // 3. SAFE FALLBACK ONLY IF COMPLETELY EMPTY
        if (rawPlate == null || rawPlate.length() < 3) {
            rawPlate = "UNKNOWN-9999";
        }

        final String detectedPlate = rawPlate.replaceAll("[^a-zA-Z0-9]", "").toUpperCase().trim();

        // 4. Check if vehicle is in the registered directory or is an unregistered visitor
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

        // 5. Save scan log into database history
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