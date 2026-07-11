package com.example.swp.features.support_ticket;

import com.example.swp.features.support_ticket.dto.CreateTicketRequest;
import com.example.swp.features.support_ticket.dto.SupportTicketResponse;
import com.example.swp.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support-tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    // Public endpoint for Landing Page
    @PostMapping
    public ResponseEntity<ApiResponse<SupportTicketResponse>> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        SupportTicketResponse response = supportTicketService.createTicket(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<SupportTicketResponse> response = supportTicketService.getAllTickets(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> resolveTicket(@PathVariable Long id) {
        SupportTicketResponse response = supportTicketService.resolveTicket(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> replyTicket(
            @PathVariable Long id,
            @Valid @RequestBody com.example.swp.features.support_ticket.dto.ReplyTicketRequest request) {
        SupportTicketResponse response = supportTicketService.replyTicket(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
