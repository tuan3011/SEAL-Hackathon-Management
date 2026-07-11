package com.example.swp.features.export;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/rounds/{roundId}/ranking")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<byte[]> exportRankingCsv(@PathVariable Long roundId) {
        byte[] csvData = exportService.exportRankingCsv(roundId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "ranking_round_" + roundId + ".csv");
        
        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    @GetMapping("/rounds/{roundId}/scoring")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'JUDGE')")
    public ResponseEntity<byte[]> exportScoringCsv(@PathVariable Long roundId) {
        byte[] csvData = exportService.exportAnonymizedScoringCsv(roundId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "scoring_round_" + roundId + ".csv");
        
        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    @GetMapping("/teams/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<byte[]> exportTeamsCsv() {
        byte[] csvData = exportService.exportTeamsCsv();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "all_teams.csv");

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    @GetMapping("/participants/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<byte[]> exportParticipantsCsv() {
        byte[] csvData = exportService.exportParticipantsCsv();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "all_participants.csv");

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }
}
