package com.example.swp.features.event_registration.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterForEventRequest {
    @NotNull
    private Long eventId;
}
