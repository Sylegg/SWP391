package com.lemon.supershop.swp391fa25evdm.testdrive.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveFeedbackReq;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveFeedbackRes;
import com.lemon.supershop.swp391fa25evdm.testdrive.service.TestDriveFeedbackService;

@RestController
@RequestMapping("/api/testdrive-feedback")
@CrossOrigin(origins = "*")
public class TestDriveFeedbackController {
    
    @Autowired
    private TestDriveFeedbackService feedbackService;
    
    /**
     * Create feedback for a test drive
     * POST /api/testdrive-feedback/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createFeedback(@RequestBody TestDriveFeedbackReq req) {
        try {
            TestDriveFeedbackRes feedback = feedbackService.createFeedback(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(feedback);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating feedback: " + e.getMessage());
        }
    }
    
    /**
     * Get feedback by test drive ID
     * GET /api/testdrive-feedback/test-drive/{testDriveId}
     */
    @GetMapping("/test-drive/{testDriveId}")
    public ResponseEntity<List<TestDriveFeedbackRes>> getFeedbackByTestDriveId(
            @PathVariable int testDriveId) {
        List<TestDriveFeedbackRes> feedbacks = feedbackService.getFeedbackByTestDriveId(testDriveId);
        return ResponseEntity.ok(feedbacks);
    }
    
    /**
     * Get all feedback for a product
     * GET /api/testdrive-feedback/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<TestDriveFeedbackRes>> getFeedbackByProductId(
            @PathVariable int productId) {
        List<TestDriveFeedbackRes> feedbacks = feedbackService.getFeedbackByProductId(productId);
        return ResponseEntity.ok(feedbacks);
    }
    
    /**
     * Get average rating for a product
     * GET /api/testdrive-feedback/product/{productId}/average
     */
    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable int productId) {
        Double avgRating = feedbackService.getAverageRatingByProductId(productId);
        return ResponseEntity.ok(avgRating);
    }
    
    /**
     * Get all feedback by a user
     * GET /api/testdrive-feedback/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TestDriveFeedbackRes>> getFeedbackByUserId(
            @PathVariable int userId) {
        List<TestDriveFeedbackRes> feedbacks = feedbackService.getFeedbackByUserId(userId);
        return ResponseEntity.ok(feedbacks);
    }
}
