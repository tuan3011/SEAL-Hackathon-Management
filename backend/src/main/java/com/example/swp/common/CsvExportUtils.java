package com.example.swp.common;

public class CsvExportUtils {

    // UTF-8 Byte Order Mark for Excel compatibility
    public static final byte[] UTF8_BOM = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};

    /**
     * Escapes a string for CSV, and protects against CSV Injection.
     */
    public static String escapeCsvField(String field) {
        if (field == null) {
            return "";
        }
        
        String cleanField = field.trim();
        
        // CSV Injection Protection (CWE-1236)
        if (cleanField.startsWith("=") || cleanField.startsWith("+") || 
            cleanField.startsWith("-") || cleanField.startsWith("@")) {
            cleanField = "'" + cleanField;
        }

        // Escape quotes
        cleanField = cleanField.replace("\"", "\"\"");

        // Wrap in quotes if it contains commas, quotes, or newlines
        if (cleanField.contains(",") || cleanField.contains("\"") || cleanField.contains("\n") || cleanField.contains("\r")) {
            cleanField = "\"" + cleanField + "\"";
        }

        return cleanField;
    }
}
