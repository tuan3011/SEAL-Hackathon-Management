package com.example.swp.common;


import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

@Data
@Builder
public class PaginationInfo {
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public PaginationInfo() {}
    public PaginationInfo(int page, int size, long totalElements, int totalPages) {
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public static PaginationInfo fromPage(Page<?> page) {
        return PaginationInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
    public static PaginationInfoBuilder builder() { return new PaginationInfoBuilder(); }
    public static class PaginationInfoBuilder {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;

        public PaginationInfoBuilder page(int page) { this.page = page; return this; }
        public PaginationInfoBuilder size(int size) { this.size = size; return this; }
        public PaginationInfoBuilder totalElements(long totalElements) { this.totalElements = totalElements; return this; }
        public PaginationInfoBuilder totalPages(int totalPages) { this.totalPages = totalPages; return this; }

        public PaginationInfo build() {
            return new PaginationInfo(this.page, this.size, this.totalElements, this.totalPages);
        }
    }
}
