#!/bin/bash

# 1. Install React Webcam for the frontend
echo "Installing React Webcam..."
cd frontend
npm install react-webcam --silent
cd ..

# 2. Generate the Spring Boot ALPR Controller
echo "Creating AlprController..."
cat << 'EOF' > src/main/java/com/vehicle/service/controller/AlprController.java
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
EOF

# 3. Update the Database Repository
echo "Updating VehicleRepository..."
cat << 'EOF' > src/main/java/com/vehicle/service/repository/VehicleRepository.java
package com.vehicle.service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.vehicle.service.model.Vehicle;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByLicensePlate(String licensePlate);
}
EOF

# 4. Inject the React Scanner UI Component
echo "Injecting GateScanner component..."
sed -i '1i import Webcam from "react-webcam";' frontend/src/Pages.js

cat << 'EOF' >> frontend/src/Pages.js

export const GateScanner = ({ token }) => {
  const webcamRef = React.useRef(null);
  const [scanResult, setScanResult] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isScanning, setIsScanning] = React.useState(false);

  const captureAndScan = async () => {
    setIsScanning(true); setError(null); setScanResult(null);
    const imageSrc = webcamRef.current.getScreenshot();
    
    try {
      const response = await fetch('/api/alpr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: imageSrc })
      });
      
      const data = await response.json();
      if (response.ok) { setScanResult(data); } 
      else { setError(data.error); }
    } catch (err) {
      setError("Network or server connection failed.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div>
      <div className="page-header"><h1>👁 Automated Gate Scanner</h1><div className="live-indicator"><div className="live-dot"></div> ALPR Active</div></div>
      <div className="data-card" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', display: 'block' }} />
          <div style={{ position: 'absolute', top: '25%', left: '15%', width: '70%', height: '50%', border: '2px solid #38bdf8', boxShadow: '0 0 15px #38bdf8', background: isScanning ? 'rgba(56, 189, 248, 0.2)' : 'transparent', transition: 'background 0.3s' }} />
        </div>
        
        <button onClick={captureAndScan} className="primary" style={{ width: '100%', marginTop: '20px', padding: '16px', fontSize: '1.1em' }} disabled={isScanning}>
          {isScanning ? 'Processing Optical Telemetry...' : 'Engage Gate Scanner'}
        </button>

        {scanResult && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Vehicle Identified: {scanResult.licensePlate}</h3>
            <p style={{ margin: '4px 0', color: '#e2e8f0' }}>Owner: {scanResult.ownerName}</p>
            <p style={{ margin: '4px 0', color: '#e2e8f0' }}>Triage Ticket: <span style={{fontWeight:'bold'}}>{scanResult.ticketId}</span></p>
            <div style={{marginTop:'12px'}}><span className="badge healthy">Gate Opened</span></div>
          </div>
        )}
        
        {error && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>Scan Failed</h3>
            <p style={{ margin: 0, color: '#e2e8f0' }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
EOF

# 5. Rebuild Frontend
echo "📦 Building Frontend..."
cd frontend
npm run build --silent
cd ..
cp -r frontend/build/* src/main/resources/static/
echo "✅ ALPR Gate Scanner successfully integrated!"