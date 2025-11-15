package com.lemon.supershop.swp391fa25evdm.crm.model.dto;

import java.util.List;

import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveRes;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;

public class CustomerProfileRes {
    
    // Basic user info
    private UserRes user;
    
    // Test drives history
    private List<TestDriveRes> testDrives;
    
    // Notes and tags
    private List<CustomerNoteRes> notes;
    private List<CustomerTagRes> tags;
    
    // Aggregated statistics
    private CustomerStats stats;
    
    public CustomerProfileRes() {
    }
    
    // ===== Getters and Setters =====
    
    public UserRes getUser() {
        return user;
    }
    
    public void setUser(UserRes user) {
        this.user = user;
    }
    
    public List<TestDriveRes> getTestDrives() {
        return testDrives;
    }
    
    public void setTestDrives(List<TestDriveRes> testDrives) {
        this.testDrives = testDrives;
    }
    
    public List<CustomerNoteRes> getNotes() {
        return notes;
    }
    
    public void setNotes(List<CustomerNoteRes> notes) {
        this.notes = notes;
    }
    
    public List<CustomerTagRes> getTags() {
        return tags;
    }
    
    public void setTags(List<CustomerTagRes> tags) {
        this.tags = tags;
    }
    
    public CustomerStats getStats() {
        return stats;
    }
    
    public void setStats(CustomerStats stats) {
        this.stats = stats;
    }
    
    // ===== Inner class for statistics =====
    
    public static class CustomerStats {
        private int totalTestDrives;
        private int completedTestDrives;
        private int canceledTestDrives;
        private int pendingTestDrives;
        private double averageRating;
        private int totalConversions;
        private int leadScore; // 0-100 calculated based on engagement
        
        public CustomerStats() {
        }
        
        public int getTotalTestDrives() {
            return totalTestDrives;
        }
        
        public void setTotalTestDrives(int totalTestDrives) {
            this.totalTestDrives = totalTestDrives;
        }
        
        public int getCompletedTestDrives() {
            return completedTestDrives;
        }
        
        public void setCompletedTestDrives(int completedTestDrives) {
            this.completedTestDrives = completedTestDrives;
        }
        
        public int getCanceledTestDrives() {
            return canceledTestDrives;
        }
        
        public void setCanceledTestDrives(int canceledTestDrives) {
            this.canceledTestDrives = canceledTestDrives;
        }
        
        public int getPendingTestDrives() {
            return pendingTestDrives;
        }
        
        public void setPendingTestDrives(int pendingTestDrives) {
            this.pendingTestDrives = pendingTestDrives;
        }
        
        public double getAverageRating() {
            return averageRating;
        }
        
        public void setAverageRating(double averageRating) {
            this.averageRating = averageRating;
        }
        
        public int getTotalConversions() {
            return totalConversions;
        }
        
        public void setTotalConversions(int totalConversions) {
            this.totalConversions = totalConversions;
        }
        
        public int getLeadScore() {
            return leadScore;
        }
        
        public void setLeadScore(int leadScore) {
            this.leadScore = leadScore;
        }
    }
}
