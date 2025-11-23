package com.lemon.supershop.swp391fa25evdm.configuration;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            // Drop the unique constraint on ProductId if it exists
            String dropConstraintSql =
                    "IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'UK306w8sghgvp5hmjrqo21dscv7' AND object_id = OBJECT_ID('orders')) " +
                            "DROP INDEX UK306w8sghgvp5hmjrqo21dscv7 ON orders";

            jdbcTemplate.execute(dropConstraintSql);
            System.out.println("✅ Successfully dropped unique constraint UK306w8sghgvp5hmjrqo21dscv7 from orders table");
        } catch (Exception e) {
            System.out.println("⚠️ Could not drop constraint (might not exist): " + e.getMessage());
        }
    }
}