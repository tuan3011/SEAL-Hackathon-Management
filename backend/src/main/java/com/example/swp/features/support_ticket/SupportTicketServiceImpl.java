package com.example.swp.features.support_ticket;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.support_ticket.dto.CreateTicketRequest;
import com.example.swp.features.support_ticket.dto.ReplyTicketRequest;
import com.example.swp.features.support_ticket.dto.SupportTicketResponse;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.user.Role;
import com.example.swp.util.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public SupportTicketResponse createTicket(CreateTicketRequest request) {
        SupportTicket ticket = SupportTicket.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .message(request.getMessage())
                .status(TicketStatus.PENDING)
                .build();
        
        SupportTicket savedTicket = supportTicketRepository.save(ticket);
        log.info("New support ticket created by: {}", savedTicket.getEmail());
        
        // Notify all admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin,
                    "New Support Ticket",
                    request.getFullName() + " needs help: " + request.getMessage(),
                    "SUPPORT_TICKET_CREATED",
                    "SupportTicket",
                    savedTicket.getId()
            );
        }
        
        return mapToResponse(savedTicket);
    }

    @Override
    public Page<SupportTicketResponse> getAllTickets(Pageable pageable) {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public SupportTicketResponse resolveTicket(Long id) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + id));
        
        ticket.setStatus(TicketStatus.RESOLVED);
        SupportTicket savedTicket = supportTicketRepository.save(ticket);
        
        log.info("Support ticket {} resolved", id);
        
        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional
    public SupportTicketResponse replyTicket(Long id, ReplyTicketRequest request) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + id));
        
        ticket.setStatus(TicketStatus.RESOLVED);
        SupportTicket savedTicket = supportTicketRepository.save(ticket);
        
        // Send email to the user
        String emailBody = "Dear " + ticket.getFullName() + ",\n\n"
                + "Regarding your message:\n"
                + "\"" + ticket.getMessage() + "\"\n\n"
                + "Our response:\n"
                + request.getReplyMessage() + "\n\n"
                + "Best regards,\n"
                + "SEAL Hackathon Support Team";
        
        emailService.sendSimpleMessage(ticket.getEmail(), "Response to your Support Request", emailBody);
        
        log.info("Support ticket {} replied and resolved", id);
        
        return mapToResponse(savedTicket);
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .fullName(ticket.getFullName())
                .email(ticket.getEmail())
                .message(ticket.getMessage())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}
