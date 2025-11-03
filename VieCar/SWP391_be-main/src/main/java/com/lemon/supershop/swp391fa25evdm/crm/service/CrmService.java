package com.lemon.supershop.swp391fa25evdm.crm.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.crm.model.dto.*;
import com.lemon.supershop.swp391fa25evdm.crm.model.entity.CustomerNote;
import com.lemon.supershop.swp391fa25evdm.crm.model.entity.CustomerTag;
import com.lemon.supershop.swp391fa25evdm.crm.repository.CustomerNoteRepository;
import com.lemon.supershop.swp391fa25evdm.crm.repository.CustomerTagRepository;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveRes;
import com.lemon.supershop.swp391fa25evdm.testdrive.service.TestDriveService;
import com.lemon.supershop.swp391fa25evdm.testdrive.repository.TestDriveFeedbackRepository;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import com.lemon.supershop.swp391fa25evdm.user.service.UserService;

@Service
public class CrmService {
    
    @Autowired
    private CustomerNoteRepository noteRepository;
    
    @Autowired
    private CustomerTagRepository tagRepository;
    
    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private DealerRepo dealerRepo;
    
    @Autowired
    private TestDriveFeedbackRepository feedbackRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private TestDriveService testDriveService;
    
    // ===== Customer Profile =====
    
    public CustomerProfileRes getCustomerProfile(int userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        CustomerProfileRes profile = new CustomerProfileRes();
        
        // Set user info
        UserRes userRes = userService.convertUsertoUserRes(user);
        profile.setUser(userRes);
        
        // Get test drives
        List<TestDriveRes> testDrives = testDriveService.getTestDriveByUserId(userId);
        profile.setTestDrives(testDrives);
        
        // Get notes
        List<CustomerNote> notes = noteRepository.findByUserId(userId);
        profile.setNotes(notes.stream().map(this::convertNoteToRes).collect(Collectors.toList()));
        
        // Get tags
        List<CustomerTag> tags = tagRepository.findByUserId(userId);
        profile.setTags(tags.stream().map(this::convertTagToRes).collect(Collectors.toList()));
        
        // Calculate statistics
        CustomerProfileRes.CustomerStats stats = calculateStats(userId, testDrives);
        profile.setStats(stats);
        
        return profile;
    }
    
    private CustomerProfileRes.CustomerStats calculateStats(int userId, List<TestDriveRes> testDrives) {
        CustomerProfileRes.CustomerStats stats = new CustomerProfileRes.CustomerStats();
        
        stats.setTotalTestDrives(testDrives.size());
        stats.setCompletedTestDrives((int) testDrives.stream()
            .filter(td -> "COMPLETED".equals(td.getStatus())).count());
        stats.setCanceledTestDrives((int) testDrives.stream()
            .filter(td -> "CANCELED".equals(td.getStatus())).count());
        stats.setPendingTestDrives((int) testDrives.stream()
            .filter(td -> "PENDING".equals(td.getStatus()) || "CONFIRMED".equals(td.getStatus())).count());
        
        // Calculate average rating from feedbacks
        Double avgRating = feedbackRepository.getAverageRatingByUserId(userId);
        stats.setAverageRating(avgRating != null ? avgRating : 0.0);
        
        // For now, set conversions to 0 (will be updated in Task 16)
        stats.setTotalConversions(0);
        
        // Calculate lead score (0-100)
        int leadScore = calculateLeadScore(stats);
        stats.setLeadScore(leadScore);
        
        return stats;
    }
    
    private int calculateLeadScore(CustomerProfileRes.CustomerStats stats) {
        int score = 0;
        
        // Base score from test drives
        score += Math.min(stats.getTotalTestDrives() * 15, 40); // Max 40 points
        
        // Bonus for completed test drives
        score += Math.min(stats.getCompletedTestDrives() * 10, 30); // Max 30 points
        
        // Bonus for high ratings
        if (stats.getAverageRating() >= 4.5) {
            score += 20;
        } else if (stats.getAverageRating() >= 4.0) {
            score += 15;
        } else if (stats.getAverageRating() >= 3.5) {
            score += 10;
        }
        
        // Penalty for cancellations
        score -= Math.min(stats.getCanceledTestDrives() * 5, 20);
        
        // Ensure score is between 0 and 100
        return Math.max(0, Math.min(100, score));
    }
    
    // ===== Notes Management =====
    
    public CustomerNoteRes createNote(CustomerNoteReq req) {
        User user = userRepo.findById(req.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Dealer dealer = dealerRepo.findById(req.getDealerId())
            .orElseThrow(() -> new RuntimeException("Dealer not found"));
        
        CustomerNote note = new CustomerNote(user, dealer, req.getContent(), req.getCreatedBy());
        CustomerNote saved = noteRepository.save(note);
        
        return convertNoteToRes(saved);
    }
    
    public List<CustomerNoteRes> getNotesByUserId(int userId) {
        List<CustomerNote> notes = noteRepository.findByUserId(userId);
        return notes.stream().map(this::convertNoteToRes).collect(Collectors.toList());
    }
    
    public List<CustomerNoteRes> getNotesByUserIdAndDealerId(int userId, int dealerId) {
        List<CustomerNote> notes = noteRepository.findByUserIdAndDealerId(userId, dealerId);
        return notes.stream().map(this::convertNoteToRes).collect(Collectors.toList());
    }
    
    public boolean deleteNote(int noteId) {
        if (noteRepository.existsById(noteId)) {
            noteRepository.deleteById(noteId);
            return true;
        }
        return false;
    }
    
    private CustomerNoteRes convertNoteToRes(CustomerNote note) {
        CustomerNoteRes res = new CustomerNoteRes();
        res.setId(note.getId());
        res.setUserId(note.getUser().getId());
        res.setUserName(note.getUser().getUsername());
        res.setDealerId(note.getDealer().getId());
        res.setDealerName(note.getDealer().getName());
        res.setContent(note.getContent());
        res.setCreatedBy(note.getCreatedBy());
        res.setCreatedAt(note.getCreatedAt());
        return res;
    }
    
    // ===== Tags Management =====
    
    public CustomerTagRes createTag(CustomerTagReq req) {
        // Check if tag already exists
        if (tagRepository.existsByUserIdAndDealerIdAndTag(req.getUserId(), req.getDealerId(), req.getTag())) {
            throw new RuntimeException("Tag already exists for this customer");
        }
        
        User user = userRepo.findById(req.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Dealer dealer = dealerRepo.findById(req.getDealerId())
            .orElseThrow(() -> new RuntimeException("Dealer not found"));
        
        CustomerTag tag = new CustomerTag(user, dealer, req.getTag(), req.getColor());
        CustomerTag saved = tagRepository.save(tag);
        
        return convertTagToRes(saved);
    }
    
    public List<CustomerTagRes> getTagsByUserId(int userId) {
        List<CustomerTag> tags = tagRepository.findByUserId(userId);
        return tags.stream().map(this::convertTagToRes).collect(Collectors.toList());
    }
    
    public List<CustomerTagRes> getTagsByUserIdAndDealerId(int userId, int dealerId) {
        List<CustomerTag> tags = tagRepository.findByUserIdAndDealerId(userId, dealerId);
        return tags.stream().map(this::convertTagToRes).collect(Collectors.toList());
    }
    
    public boolean deleteTag(int tagId) {
        if (tagRepository.existsById(tagId)) {
            tagRepository.deleteById(tagId);
            return true;
        }
        return false;
    }
    
    private CustomerTagRes convertTagToRes(CustomerTag tag) {
        CustomerTagRes res = new CustomerTagRes();
        res.setId(tag.getId());
        res.setUserId(tag.getUser().getId());
        res.setUserName(tag.getUser().getUsername());
        res.setDealerId(tag.getDealer().getId());
        res.setDealerName(tag.getDealer().getName());
        res.setTag(tag.getTag());
        res.setColor(tag.getColor());
        res.setCreatedAt(tag.getCreatedAt());
        return res;
    }
}
