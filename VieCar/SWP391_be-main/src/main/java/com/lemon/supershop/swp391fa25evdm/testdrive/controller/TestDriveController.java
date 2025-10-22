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
}
