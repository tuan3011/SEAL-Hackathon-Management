package com.example.swp.features.prize.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdatePrizeRequest {
    private String name;
    private String description;
    @jakarta.validation.constraints.NotNull(message = "Hackathon event ID cannot be null")
    private Long hackathonEventId;
    private Long trackId;
    @Min(value = 1, message = "Rank must be at least 1")
    private Integer rank;
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
