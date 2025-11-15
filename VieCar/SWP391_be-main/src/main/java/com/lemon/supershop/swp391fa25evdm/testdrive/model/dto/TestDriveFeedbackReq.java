package com.lemon.supershop.swp391fa25evdm.testdrive.model.dto;

public class TestDriveFeedbackReq {
    
    private int testDriveId;
    private int rating; // 1-5
    private String comment;

    public TestDriveFeedbackReq() {
    }

    public int getTestDriveId() {
        return testDriveId;
    }

    public void setTestDriveId(int testDriveId) {
        this.testDriveId = testDriveId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
