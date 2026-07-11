package com.example.swp.features.support_ticket;

import com.example.swp.features.support_ticket.dto.CreateTicketRequest;
import com.example.swp.features.support_ticket.dto.SupportTicketResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SupportTicketService {
    SupportTicketResponse createTicket(CreateTicketRequest request);
    Page<SupportTicketResponse> getAllTickets(Pageable pageable);
    SupportTicketResponse resolveTicket(Long id);
    SupportTicketResponse replyTicket(Long id, com.example.swp.features.support_ticket.dto.ReplyTicketRequest request);
}
