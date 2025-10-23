package com.lemon.supershop.swp391fa25evdm.distribution.controller;

import java.util.List;

import com.lemon.supershop.swp391fa25evdm.distribution.model.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.distribution.service.DistributionService;

@RestController
@RequestMapping("/api/distributions")
@CrossOrigin("*")
public class DistributionController {
    
    @Autowired
    private DistributionService distributionService;

    @GetMapping("/listDistributions")
    public ResponseEntity<List<DistributionRes>> getAllDistributions() {
        List<DistributionRes> distributions = distributionService.getAllDistributions();
        return ResponseEntity.ok(distributions);
    }

    // ❌ Xóa endpoint không dùng
    // @GetMapping("/search/category/{categoryId}")
    // public ResponseEntity<List<DistributionRes>> getDistributionsByCategory(@PathVariable int categoryId) {
    //     List<DistributionRes> distributions = distributionService.getDistributionsByCategoryId(categoryId);
    //     return ResponseEntity.ok(distributions);
    // }

    @GetMapping("/search/dealer/{dealerId}")
    public ResponseEntity<List<DistributionRes>> getDistributionsByDealer(@PathVariable int dealerId) {
        List<DistributionRes> distributions = distributionService.getDistributionsByDealerId(dealerId);
        return ResponseEntity.ok(distributions);
    }

//    @GetMapping("/search/contract/{contractId}")
//    public ResponseEntity<List<DistributionRes>> getDistributionsByContract(@PathVariable int contractId) {
//        List<DistributionRes> distributions = distributionService.getDistributionsByContractId(contractId);
//        return ResponseEntity.ok(distributions);
//    }

    @PostMapping("/createDistribution")
    public ResponseEntity<DistributionRes> createDistribution(@RequestBody DistributionReq distributionReq) {
        DistributionRes distributionRes = distributionService.createDistribution(distributionReq);
        if (distributionRes != null) {
            return ResponseEntity.ok(distributionRes);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/updateDistribution/{id}")
    public ResponseEntity<DistributionRes> updateDistribution(@PathVariable int id, @RequestBody DistributionReq distributionReq) {
        DistributionRes distributionRes = distributionService.updateDistribution(id, distributionReq);
        if (distributionRes != null) {
            return ResponseEntity.ok(distributionRes);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/deleteDistribution/{id}")
    public ResponseEntity<String> deleteDistribution(@PathVariable int id) {
        if (distributionService.deleteDistribution(id)){
            return ResponseEntity.ok("Distribution deleted successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // ===== WORKFLOW ENDPOINTS =====

    // Step 1: EVM Staff gửi lời mời phân phối
    @PostMapping("/invite")
    public ResponseEntity<DistributionRes> sendInvitation(@RequestBody DistributionInvitationReq request) {
        try {
            DistributionRes response = distributionService.sendInvitation(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Step 2: Dealer Manager phản hồi lời mời
    @PutMapping("/{id}/respond")
    public ResponseEntity<DistributionRes> respondToInvitation(
            @PathVariable int id,
            @RequestBody DistributionResponseReq request) {
        try {
            DistributionRes response = distributionService.respondToInvitation(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Step 3: Dealer Manager tạo đơn hàng
    @PutMapping("/{id}/submit-order")
    public ResponseEntity<DistributionRes> submitOrder(
            @PathVariable int id,
            @RequestBody DistributionOrderReq request) {
        try {
            DistributionRes response = distributionService.submitOrder(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Step 4: EVM Staff duyệt đơn
    @PutMapping("/{id}/approve")
    public ResponseEntity<DistributionRes> approveOrder(
            @PathVariable int id,
            @RequestBody DistributionApprovalReq request) {
        try {
            DistributionRes response = distributionService.approveOrder(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Step 5: EVM Staff lên kế hoạch giao hàng
    @PutMapping("/{id}/plan")
    public ResponseEntity<DistributionRes> planDelivery(
            @PathVariable int id,
            @RequestBody DistributionPlanningReq request) {
        try {
            DistributionRes response = distributionService.planDelivery(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Step 6: Dealer Manager xác nhận nhận hàng
    @PutMapping("/{id}/complete")
    public ResponseEntity<DistributionRes> confirmReceived(
            @PathVariable int id,
            @RequestBody DistributionCompletionReq request) {
        try {
            DistributionRes response = distributionService.confirmReceived(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
