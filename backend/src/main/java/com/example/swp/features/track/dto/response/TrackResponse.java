package com.example.swp.features.track.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TrackResponse {
    private Long id;
    private String name;
    private String description;
    private Long hackathonEventId;

    public static TrackResponseBuilder builder() { return new TrackResponseBuilder(); }
    public static class TrackResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private Long hackathonEventId;

        public TrackResponseBuilder id(Long id) { this.id = id; return this; }
        public TrackResponseBuilder name(String name) { this.name = name; return this; }
        public TrackResponseBuilder description(String description) { this.description = description; return this; }
        public TrackResponseBuilder hackathonEventId(Long hackathonEventId) { this.hackathonEventId = hackathonEventId; return this; }

        public TrackResponse build() {
            TrackResponse r = new TrackResponse();
            r.id = this.id; r.name = this.name;
            r.description = this.description; r.hackathonEventId = this.hackathonEventId;
            return r;
        }
    }
}


