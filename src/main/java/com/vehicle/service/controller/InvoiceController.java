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

    @GetMapping("/{ticketId}")
    public ResponseEntity<byte[]> generateInvoice(@PathVariable Long ticketId) {
        try {
            ServiceTicket ticket = ticketRepository.findById(ticketId).orElse(null);
            if (ticket == null) {
                return ResponseEntity.notFound().build();
            }

            // Create PDF Document using PDFBox 3.x
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            // Title
            contentStream.beginText();
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 22);
            contentStream.setNonStrokingColor(0.83f, 0.65f, 0.21f); // Gold color approximation
            contentStream.newLineAtOffset(50, 720);
            contentStream.showText("SMART VEHICLE COMMAND CENTER - INVOICE");
            contentStream.endText();

            // Details
            contentStream.beginText();
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 14);
            contentStream.setNonStrokingColor(0, 0, 0); // Black
            contentStream.newLineAtOffset(50, 670);
            contentStream.showText("Service Ticket ID: " + ticket.getId());
            contentStream.newLineAtOffset(0, -30);
            contentStream.showText("Service Type: " + ticket.getServiceType());
            contentStream.newLineAtOffset(0, -30);
            contentStream.showText("Appointment Date: " + ticket.getAppointmentDate());
            contentStream.newLineAtOffset(0, -30);
            contentStream.showText("Status: COMPLETED & PAID");
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