package com.lemon.supershop.swp391fa25evdm.policies.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.policies.model.dto.PoliciesReq;
import com.lemon.supershop.swp391fa25evdm.policies.model.dto.PoliciesRes;
import com.lemon.supershop.swp391fa25evdm.policies.service.PoliciesService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/policies")
@CrossOrigin("*")
public class PoliciesController {
    
    @Autowired
    private PoliciesService policiesService;

    @GetMapping ("/listPolicies")
    public ResponseEntity<List<PoliciesRes>> getAllPolicies() {
        List<PoliciesRes> policies = policiesService.getAllPolicies();
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/search/category/{categoryId}")
    public ResponseEntity<List<PoliciesRes>> getPoliciesByCategoryId(@PathVariable int categoryId) {
        List<PoliciesRes> policies = policiesService.getPoliciesByCategoryId(categoryId);
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/search/dealer/{dealerId}")
    public ResponseEntity<List<PoliciesRes>> getPoliciesByDealerId(@PathVariable int dealerId) {
        List<PoliciesRes> policies = policiesService.getPoliciesByDealerId(dealerId);
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/search/id/{id}")
    public ResponseEntity<PoliciesRes> getPolicyById(@PathVariable int id) {
        PoliciesRes policy = policiesService.getPolicyById(id);
        return ResponseEntity.ok(policy);
    }

    @PostMapping ("/create")
    public ResponseEntity<PoliciesRes> createPolicy(@Valid @RequestBody PoliciesReq dto) {
        PoliciesRes policiesRes = policiesService.createPolicy(dto);
        if (policiesRes != null) {
            return ResponseEntity.ok(policiesRes);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PoliciesRes> updatePolicy(@PathVariable int id, @Valid @RequestBody PoliciesReq policiesReq) {
        PoliciesRes policiesRes = policiesService.updatePolicy(id, policiesReq);
        if (policiesRes != null) {
            return ResponseEntity.ok(policiesRes);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePolicy(@PathVariable int id) {
        if (policiesService.deletePolicy(id)){
            return ResponseEntity.ok("Policy deleted successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
