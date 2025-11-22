package com.lemon.supershop.swp391fa25evdm.testdrive.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveFeedbackReq;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveFeedbackRes;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDriveFeedback;
import com.lemon.supershop.swp391fa25evdm.testdrive.repository.TestDriveFeedbackRepository;
import com.lemon.supershop.swp391fa25evdm.testdrive.repository.TestDriveRepository;

@Service
public class TestDriveFeedbackService {
    
    @Autowired
    private TestDriveFeedbackRepository feedbackRepository;
    
    @Autowired
    private TestDriveRepository testDriveRepository;
    
    /**
     * Create feedback for a test drive
     */
    public TestDriveFeedbackRes createFeedback(TestDriveFeedbackReq req) {
        // Validate test drive exists
        Optional<TestDrive> testDriveOpt = testDriveRepository.findById(req.getTestDriveId());
        if (!testDriveOpt.isPresent()) {
            throw new IllegalArgumentException("Test drive not found with id: " + req.getTestDriveId());
        }
        
        TestDrive testDrive = testDriveOpt.get();
        
        // Check if test drive is completed
        if (!"COMPLETED".equals(testDrive.getStatus())) {
            throw new IllegalStateException("Can only provide feedback for completed test drives");
        }
        
        // Check if feedback already exists
        if (feedbackRepository.existsByTestDriveId(req.getTestDriveId())) {
            throw new IllegalStateException("Feedback already exists for this test drive");
        }
        
        // Create feedback
        TestDriveFeedback feedback = new TestDriveFeedback();
        feedback.setTestDrive(testDrive);
        feedback.setRating(req.getRating());
        feedback.setComment(req.getComment());
        
        TestDriveFeedback saved = feedbackRepository.save(feedback);
        return convertToRes(saved);
    }
    
    /**
     * Get feedback by test drive ID
     */
    public List<TestDriveFeedbackRes> getFeedbackByTestDriveId(int testDriveId) {
        List<TestDriveFeedback> feedbacks = feedbackRepository.findByTestDriveId(testDriveId);
        return feedbacks.stream()
                .map(this::convertToRes)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all feedback for a product
     */
    public List<TestDriveFeedbackRes> getFeedbackByProductId(int productId) {
        List<TestDriveFeedback> feedbacks = feedbackRepository.findByProductId(productId);
        return feedbacks.stream()
                .map(this::convertToRes)
                .collect(Collectors.toList());
    }
    
    /**
     * Get average rating for a product
     */
    public Double getAverageRatingByProductId(int productId) {
        Double avg = feedbackRepository.getAverageRatingByProductId(productId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }
    
    /**
     * Get all feedback by a user
     */
    public List<TestDriveFeedbackRes> getFeedbackByUserId(int userId) {
        List<TestDriveFeedback> feedbacks = feedbackRepository.findByUserId(userId);
        return feedbacks.stream()
                .map(this::convertToRes)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert entity to response DTO
     */
    private TestDriveFeedbackRes convertToRes(TestDriveFeedback feedback) {
        TestDriveFeedbackRes res = new TestDriveFeedbackRes();
        res.setId(feedback.getId());
        res.setTestDriveId(feedback.getTestDrive().getId());
        res.setRating(feedback.getRating());
        res.setComment(feedback.getComment());
        res.setCreateAt(feedback.getCreateAt());
        
        // Add product and customer info
        if (feedback.getTestDrive().getProduct() != null) {
            res.setProductName(feedback.getTestDrive().getProduct().getName());
        }
        if (feedback.getTestDrive().getUser() != null) {
            res.setCustomerName(feedback.getTestDrive().getUser().getUsername());
        }
        
        return res;
    }
}
