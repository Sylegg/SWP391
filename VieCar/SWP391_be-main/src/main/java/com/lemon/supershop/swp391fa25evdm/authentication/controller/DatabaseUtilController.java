package com.lemon.supershop.swp391fa25evdm.authentication.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Utility controller for fixing database sequence issues
 * DELETE THIS AFTER FIXING THE SEQUENCE ISSUE
 */
@RestController
@RequestMapping("/api/admin/db-utils")
public class DatabaseUtilController {

    @Autowired
    private DataSource dataSource;

    /**
     * Fix IDENTITY seed for users table
     * GET /api/admin/db-utils/fix-user-sequence
     */
    @GetMapping("/fix-user-sequence")
    public ResponseEntity<String> fixUserSequence() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // Get max ID
            ResultSet rs = stmt.executeQuery("SELECT MAX(Id) as MaxId FROM users");
            int maxId = 0;
            if (rs.next()) {
                maxId = rs.getInt("MaxId");
            }
            
            // Reset IDENTITY seed
            String reseedSql = String.format("DBCC CHECKIDENT ('users', RESEED, %d)", maxId);
            stmt.execute(reseedSql);
            
            return ResponseEntity.ok(String.format("✅ User sequence fixed! Max ID: %d, Seed reset to: %d", maxId, maxId));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("❌ Failed to fix sequence: " + e.getMessage());
        }
    }
    
    /**
     * Check current max IDs in all tables
     * GET /api/admin/db-utils/check-sequences
     */
    @GetMapping("/check-sequences")
    public ResponseEntity<String> checkSequences() {
        StringBuilder result = new StringBuilder();
        String[] tables = {"users", "roles", "dealers", "products", "orders", "testdrives"};
        
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            for (String table : tables) {
                try {
                    ResultSet rs = stmt.executeQuery(String.format("SELECT MAX(Id) as MaxId FROM %s", table));
                    if (rs.next()) {
                        int maxId = rs.getInt("MaxId");
                        result.append(String.format("%s: Max ID = %d\n", table, maxId));
                    }
                } catch (Exception e) {
                    result.append(String.format("%s: Error - %s\n", table, e.getMessage()));
                }
            }
            
            return ResponseEntity.ok(result.toString());
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("❌ Failed to check sequences: " + e.getMessage());
        }
    }
}
