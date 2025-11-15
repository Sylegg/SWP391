package com.lemon.supershop.swp391fa25evdm.testdrive.model.entity;

import java.util.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "testdrive_feedback")
public class TestDriveFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "rating", columnDefinition = "INT", nullable = false)
    private int rating; // 1-5 stars

    @Column(name = "comment", columnDefinition = "NVARCHAR(MAX)")
    private String comment;

    @Column(insertable = false, updatable = false, name = "Create_at", columnDefinition = "DATETIME2 DEFAULT GETDATE()")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createAt;

    @PrePersist
    protected void onCreate() {
        this.createAt = new Date();
    }

    // ===== Relation =====

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TestDriveId", nullable = false)
    private TestDrive testDrive;

    // ===== Constructors =====

    public TestDriveFeedback() {
    }

    // ===== Getters and Setters =====

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Date getCreateAt() {
        return createAt;
    }

    public void setCreateAt(Date createAt) {
        this.createAt = createAt;
    }

    public TestDrive getTestDrive() {
        return testDrive;
    }

    public void setTestDrive(TestDrive testDrive) {
        this.testDrive = testDrive;
    }
}
