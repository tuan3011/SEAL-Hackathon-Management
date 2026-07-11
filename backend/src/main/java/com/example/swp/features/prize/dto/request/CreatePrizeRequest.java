package com.example.swp.features.prize.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePrizeRequest {
    @NotBlank(message = "Prize name cannot be empty")
    private String name;
    private String description;
    
    @NotNull(message = "Hackathon event ID cannot be null")
    private Long hackathonEventId;
    private Long trackId; // Optional
    @jakarta.validation.constraints.Min(value = 1, message = "Rank must be at least 1")
    private Integer rank; // Optional
    private java.math.BigDecimal cash;
    private Boolean hasCup;
    private Boolean hasCertificate;
    private String cup;
    private String certificate;
    private String currency;

    public String getName() { return name; }
    public String getDescription() { return description; }
    public Long getHackathonEventId() { return hackathonEventId; }
    public Long getTrackId() { return trackId; }
    public Integer getRank() { return rank; }
    public java.math.BigDecimal getCash() { return cash; }
    public Boolean getHasCup() { return hasCup; }
    public Boolean getHasCertificate() { return hasCertificate; }
    public String getCup() { return cup; }
    public String getCertificate() { return certificate; }
    public String getCurrency() { return currency; }
}
