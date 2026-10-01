package com.vehicle.service.controller;

import net.sourceforge.tess4j.Tesseract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.vehicle.service.repository.VehicleRepository;
import com.vehicle.service.model.Vehicle;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alpr")
public class AlprController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @PostMapping("/scan")
    public ResponseEntity<?> scanLicensePlate(@RequestBody Map<String, String> payload) {
        String base64Image = payload.get("imageBase64").split(",")[1];
        
        try {
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes);
            BufferedImage image = ImageIO.read(bis);
            
            Tesseract tesseract = new Tesseract();
            // Pointing to your local Windows Tesseract installation
            tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata"); 
            tesseract.setLanguage("eng");

            String rawText = tesseract.doOCR(image);
            String cleanPlate = rawText.replaceAll("[^A-Z0-9]", "").trim();

            Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(cleanPlate);
            
            if(vehicleOpt.isPresent()) {
                Vehicle v = vehicleOpt.get();
                return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "licensePlate", v.getLicensePlate(),
                    "ownerName", v.getOwner() != null ? v.getOwner().getFullName() : "Unknown Operator",
                    "ticketId", "AUTO-" + System.currentTimeMillis()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Plate recognized as [" + cleanPlate + "] but not found in registry."));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "OCR Engine Failure: " + e.getMessage()));
        }
    }
}
