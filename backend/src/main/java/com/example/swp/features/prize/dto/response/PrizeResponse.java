package com.example.swp.features.prize.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class PrizeResponse {
    private Long id;
    private String name;
    private String description;
    private Long hackathonEventId;
    private Long trackId;
    private String trackName;
    private Long winningTeamId;
    private String winningTeamName;
    private Integer rank;
    private java.math.BigDecimal cash;
    private Boolean hasCup;
    private Boolean hasCertificate;
    private String cup;
    private String certificate;
    private String currency;

    public String getCurrency() { return currency; }

    public static PrizeResponseBuilder builder() { return new PrizeResponseBuilder(); }
    public static class PrizeResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private Long hackathonEventId;
        private Long trackId;
        private String trackName;
        private Long winningTeamId;
        private String winningTeamName;
        private Integer rank;
        private java.math.BigDecimal cash;
        private Boolean hasCup;
        private Boolean hasCertificate;
        private String cup;
        private String certificate;
        private String currency;

        public PrizeResponseBuilder id(Long id) { this.id = id; return this; }
        public PrizeResponseBuilder name(String name) { this.name = name; return this; }
        public PrizeResponseBuilder description(String description) { this.description = description; return this; }
        public PrizeResponseBuilder hackathonEventId(Long hackathonEventId) { this.hackathonEventId = hackathonEventId; return this; }
        public PrizeResponseBuilder trackId(Long trackId) { this.trackId = trackId; return this; }
        public PrizeResponseBuilder trackName(String trackName) { this.trackName = trackName; return this; }
        public PrizeResponseBuilder winningTeamId(Long winningTeamId) { this.winningTeamId = winningTeamId; return this; }
        public PrizeResponseBuilder winningTeamName(String winningTeamName) { this.winningTeamName = winningTeamName; return this; }
        public PrizeResponseBuilder rank(Integer rank) { this.rank = rank; return this; }
        public PrizeResponseBuilder cash(java.math.BigDecimal cash) { this.cash = cash; return this; }
        public PrizeResponseBuilder hasCup(Boolean hasCup) { this.hasCup = hasCup; return this; }
        public PrizeResponseBuilder hasCertificate(Boolean hasCertificate) { this.hasCertificate = hasCertificate; return this; }
        public PrizeResponseBuilder cup(String cup) { this.cup = cup; return this; }
        public PrizeResponseBuilder certificate(String certificate) { this.certificate = certificate; return this; }
        public PrizeResponseBuilder currency(String currency) { this.currency = currency; return this; }

        public PrizeResponse build() {
            PrizeResponse p = new PrizeResponse();
            p.id = this.id; p.name = this.name; p.description = this.description;
            p.hackathonEventId = this.hackathonEventId; p.trackId = this.trackId; p.trackName = this.trackName;
            p.winningTeamId = this.winningTeamId; p.winningTeamName = this.winningTeamName;
            p.rank = this.rank; p.cash = this.cash; p.hasCup = this.hasCup; p.hasCertificate = this.hasCertificate;
            p.cup = this.cup; p.certificate = this.certificate;
            p.currency = this.currency;
            return p;
        }
    }
}


