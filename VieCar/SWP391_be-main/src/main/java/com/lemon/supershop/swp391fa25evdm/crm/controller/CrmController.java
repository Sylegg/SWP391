package com.lemon.supershop.swp391fa25evdm.crm.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.crm.model.dto.*;
import com.lemon.supershop.swp391fa25evdm.crm.service.CrmService;

@RestController
@RequestMapping("/api/crm")
@CrossOrigin("*")
public class CrmController {
    
    @Autowired
    private CrmService crmService;
    
    // ===== Customer Profile =====
    
    @GetMapping("/customers/{userId}/profile")
    public ResponseEntity<CustomerProfileRes> getCustomerProfile(@PathVariable int userId) {
        try {
            CustomerProfileRes profile = crmService.getCustomerProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ===== Notes Management =====
    
    @PostMapping("/notes")
    public ResponseEntity<CustomerNoteRes> createNote(@RequestBody CustomerNoteReq req) {
        try {
            CustomerNoteRes note = crmService.createNote(req);
            return ResponseEntity.ok(note);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/notes/user/{userId}")
    public ResponseEntity<List<CustomerNoteRes>> getNotesByUserId(@PathVariable int userId) {
        List<CustomerNoteRes> notes = crmService.getNotesByUserId(userId);
        return ResponseEntity.ok(notes);
    }
    
    @GetMapping("/notes/user/{userId}/dealer/{dealerId}")
    public ResponseEntity<List<CustomerNoteRes>> getNotesByUserIdAndDealerId(
            @PathVariable int userId, 
            @PathVariable int dealerId) {
        List<CustomerNoteRes> notes = crmService.getNotesByUserIdAndDealerId(userId, dealerId);
        return ResponseEntity.ok(notes);
    }
    
    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<String> deleteNote(@PathVariable int noteId) {
        if (crmService.deleteNote(noteId)) {
            return ResponseEntity.ok("Note deleted successfully");
        }
        return ResponseEntity.badRequest().body("Failed to delete note");
    }
    
    // ===== Tags Management =====
    
    @PostMapping("/tags")
    public ResponseEntity<CustomerTagRes> createTag(@RequestBody CustomerTagReq req) {
        try {
            CustomerTagRes tag = crmService.createTag(req);
            return ResponseEntity.ok(tag);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @GetMapping("/tags/user/{userId}")
    public ResponseEntity<List<CustomerTagRes>> getTagsByUserId(@PathVariable int userId) {
        List<CustomerTagRes> tags = crmService.getTagsByUserId(userId);
        return ResponseEntity.ok(tags);
    }
    
    @GetMapping("/tags/user/{userId}/dealer/{dealerId}")
    public ResponseEntity<List<CustomerTagRes>> getTagsByUserIdAndDealerId(
            @PathVariable int userId, 
            @PathVariable int dealerId) {
        List<CustomerTagRes> tags = crmService.getTagsByUserIdAndDealerId(userId, dealerId);
        return ResponseEntity.ok(tags);
    }
    
    @DeleteMapping("/tags/{tagId}")
    public ResponseEntity<String> deleteTag(@PathVariable int tagId) {
        if (crmService.deleteTag(tagId)) {
            return ResponseEntity.ok("Tag deleted successfully");
        }
        return ResponseEntity.badRequest().body("Failed to delete tag");
    }
}
