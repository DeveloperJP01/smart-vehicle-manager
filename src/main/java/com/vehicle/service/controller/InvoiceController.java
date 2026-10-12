package com.vehicle.service.controller;

import com.vehicle.service.model.ServiceTicket;
import com.vehicle.service.repository.ServiceTicketRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private ServiceTicketRepository ticketRepository;
    @Autowired
    private com.vehicle.service.repository.GarageRepository garageRepository;

    @GetMapping("/{ticketId}")
    public ResponseEntity<byte[]> generateInvoice(@PathVariable Long ticketId) {
        try {
            ServiceTicket ticket = ticketRepository.findById(ticketId).orElse(null);
            if (ticket == null) {
                return ResponseEntity.notFound().build();
            }

            com.vehicle.service.model.Garage garage = garageRepository.findAll().stream().findFirst().orElse(null);
            String garageName = garage != null && garage.getName() != null ? garage.getName() : "PREMIUM AUTO SERVICES";
            String garageAddr = garage != null && garage.getAddress() != null ? garage.getAddress() : "123 Industrial Estate, Block 4";
            String garagePhone = garage != null && garage.getPhone() != null ? garage.getPhone() : "+1 (555) 019-2837";
            String garageGstin = garage != null && garage.getGstin() != null ? garage.getGstin() : "N/A";

            // Create PDF Document using PDFBox 3.x
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            // Title
            contentStream.beginText();
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 20);
            contentStream.setNonStrokingColor(0.5f, 0.0f, 0.0f); // Maroon
            contentStream.newLineAtOffset(50, 730);
            contentStream.showText(garageName.toUpperCase() + " - INVOICE");
            contentStream.endText();

            // Garage details
            contentStream.beginText();
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
            contentStream.setNonStrokingColor(0.2f, 0.2f, 0.2f);
            contentStream.newLineAtOffset(50, 710);
            contentStream.showText(garageAddr + " | Tel: " + garagePhone + " | GSTIN: " + garageGstin);
            contentStream.endText();

            // Details
            contentStream.beginText();
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
            contentStream.setNonStrokingColor(0, 0, 0); // Black
            contentStream.newLineAtOffset(50, 660);
            contentStream.showText("Invoice / Ticket ID: #" + ticket.getId());
            contentStream.newLineAtOffset(0, -22);
            contentStream.showText("Vehicle: " + (ticket.getVehicle() != null ? ticket.getVehicle().getLicensePlate() + " (" + ticket.getVehicle().getMakeAndModel() + ")" : "N/A"));
            contentStream.newLineAtOffset(0, -22);
            contentStream.showText("Owner: " + (ticket.getVehicle() != null ? ticket.getVehicle().getOwnerName() : "Walk-in Customer"));
            contentStream.newLineAtOffset(0, -22);
            contentStream.showText("Service Name: " + (ticket.getServiceType() != null ? ticket.getServiceType() : "General Service"));
            contentStream.newLineAtOffset(0, -22);
            double sCost = ticket.getServiceCost() != null ? ticket.getServiceCost() : (ticket.getEstimatedCost() != null ? ticket.getEstimatedCost() : 0.0);
            contentStream.showText("Service / Labor Cost: Rs. " + String.format("%.2f", sCost));
            contentStream.newLineAtOffset(0, -22);
            double pCost = ticket.getPartsCost() != null ? ticket.getPartsCost() : 0.0;
            contentStream.showText("Parts & Consumables Cost: Rs. " + String.format("%.2f", pCost));
            if (ticket.getPartsUsedDescription() != null && !ticket.getPartsUsedDescription().trim().isEmpty()) {
                contentStream.newLineAtOffset(0, -20);
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 10);
                contentStream.showText("Parts: " + ticket.getPartsUsedDescription().replace("\n", ", "));
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
            }
            contentStream.newLineAtOffset(0, -25);
            double total = ticket.getEstimatedCost() != null ? ticket.getEstimatedCost() : (sCost + pCost);
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 13);
            contentStream.showText("Total Amount: Rs. " + String.format("%.2f", total));
            contentStream.newLineAtOffset(0, -22);
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
            contentStream.showText("Status: " + ticket.getStatus() + " | Appointment: " + ticket.getAppointmentDate());
            contentStream.endText();

            contentStream.close();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            document.close();

            byte[] pdfBytes = baos.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Invoice_" + ticketId + ".pdf");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}