package com.lemon.supershop.swp391fa25evdm.testdrive.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveReq;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveRes;
import com.lemon.supershop.swp391fa25evdm.testdrive.service.TestDriveService;

@RestController
@RequestMapping("/api/testdrives")
@CrossOrigin("*")
public class TestDriveController {

    @Autowired
    private TestDriveService testDriveService;
    
    @GetMapping("/listTestDrives")
    public ResponseEntity<List<TestDriveRes>> getAllTestDrives() {
        List<TestDriveRes> testDrives = testDriveService.getAllTestDrive();
        return ResponseEntity.ok(testDrives);
    }

    @GetMapping("/search/id/{id}")
    public ResponseEntity<TestDriveRes> getTestDriveById(@PathVariable int id) {
        TestDriveRes testDrive = testDriveService.getTestDriveById(id);
        return ResponseEntity.ok(testDrive);
    }

    @GetMapping("/search/user/{userId}")
    public ResponseEntity<List<TestDriveRes>> getTestDriveByUserId(@PathVariable int userId) {
        List<TestDriveRes> testDrives = testDriveService.getTestDriveByUserId(userId);
        return ResponseEntity.ok(testDrives);
    }

    @GetMapping("/search/dealer/{dealerId}")
    public ResponseEntity<List<TestDriveRes>> getTestDriveByDealerId(@PathVariable int dealerId) {
        List<TestDriveRes> testDrives = testDriveService.getTestDriveByDealerId(dealerId);
        return ResponseEntity.ok(testDrives);
    }

    @PostMapping("/createTestDrive")
    public ResponseEntity<TestDriveRes> createTestDrive (@RequestBody TestDriveReq testDriveReq) {
        TestDriveRes testDriveRes = testDriveService.createTestDrive(testDriveReq);
        if (testDriveRes != null) {
            return ResponseEntity.ok(testDriveRes);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/updateTestDrive/{id}")
    public ResponseEntity<TestDriveRes> updateTestDrive (@PathVariable int id, @RequestBody TestDriveReq dto) {
        TestDriveRes testDriveRes = testDriveService.updateTestDrive(id, dto);
        if (testDriveRes != null) {
            return ResponseEntity.ok(testDriveRes);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @DeleteMapping("/deleteTestDrive/{id}")
    public ResponseEntity<String> deleteTestDrive (@PathVariable int id) {
        if (testDriveService.deleteTestDrive(id)){
            return ResponseEntity.ok("Test drive deleted successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam int productId,
            @RequestParam String scheduleDate,
            @RequestParam(defaultValue = "2") int durationHours) {
        try {
            java.time.LocalDateTime dateTime = java.time.LocalDateTime.parse(scheduleDate);
            var result = testDriveService.checkAvailability(productId, dateTime, durationHours);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use ISO format: yyyy-MM-ddTHH:mm:ss");
        }
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam int productId,
            @RequestParam String date) {
        try {
            var result = testDriveService.getAvailableSlots(productId, date);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use format: yyyy-MM-dd");
        }
    }

    @GetMapping("/{id}/calendar.ics")
    public ResponseEntity<String> exportToCalendar(@PathVariable int id) {
        try {
            String icsContent = testDriveService.generateIcsFile(id);
            return ResponseEntity.ok()
                .header("Content-Type", "text/calendar; charset=utf-8")
                .header("Content-Disposition", "attachment; filename=test-drive-" + id + ".ics")
                .body(icsContent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to generate calendar file: " + e.getMessage());
        }
    }

    // ============ Status Management APIs ============

    /**
     * Confirm test drive request (PENDING -> ASSIGNING)
     * Staff confirms they received the request and will assign vehicle soon
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<TestDriveRes> confirmTestDrive(@PathVariable int id) {
        TestDriveReq req = new TestDriveReq();
        req.setStatus("ASSIGNING");
        TestDriveRes result = testDriveService.updateTestDrive(id, req);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TestDriveRes> approveTestDrive(@PathVariable int id) {
        TestDriveReq req = new TestDriveReq();
        req.setStatus("APPROVED");
        TestDriveRes result = testDriveService.updateTestDrive(id, req);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/start")
    public ResponseEntity<TestDriveRes> startTestDrive(@PathVariable int id) {
        TestDriveReq req = new TestDriveReq();
        req.setStatus("IN_PROGRESS");
        TestDriveRes result = testDriveService.updateTestDrive(id, req);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TestDriveRes> rejectTestDrive(
            @PathVariable int id,
            @RequestBody(required = false) TestDriveReq req) {
        if (req == null) {
            req = new TestDriveReq();
        }
        req.setStatus("REJECTED");
        TestDriveRes result = testDriveService.updateTestDrive(id, req);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<TestDriveRes> cancelTestDrive(
            @PathVariable int id,
            @RequestBody(required = false) TestDriveReq req) {
        if (req == null) {
            req = new TestDriveReq();
        }
        req.setStatus("CANCELLED");
        TestDriveRes result = testDriveService.updateTestDrive(id, req);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<TestDriveRes> completeTestDrive(@PathVariable int id) {
        TestDriveReq req = new TestDriveReq();
        req.setStatus("DONE");
        TestDriveRes result = testDriveService.updateTestDrive(id, req);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // ============ Staff Assignment API ============
    
    /**
     * Dealer staff assigns vehicle and escort staff to a pending test drive request
     * POST /api/testdrives/{id}/assign
     * Body: { "productId": 123, "escortStaffId": 456 }
     */
    @PostMapping("/{id}/assign")
    public ResponseEntity<TestDriveRes> assignVehicleAndStaff(
            @PathVariable int id,
            @RequestBody TestDriveReq req) {
        if (req.getProductId() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        // escortStaffId is optional, default to 0 if not provided
        int escortStaffId = req.getEscortStaffId() > 0 ? req.getEscortStaffId() : 0;
        
        TestDriveRes result = testDriveService.assignVehicleAndStaff(id, req.getProductId(), escortStaffId);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}