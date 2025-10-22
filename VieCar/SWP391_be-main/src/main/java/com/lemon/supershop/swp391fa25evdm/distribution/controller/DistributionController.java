package com.lemon.supershop.swp391fa25evdm.distribution.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.distribution.model.dto.DistributionReq;
import com.lemon.supershop.swp391fa25evdm.distribution.model.dto.DistributionRes;
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

    @GetMapping("/search/category/{categoryId}")
    public ResponseEntity<List<DistributionRes>> getDistributionsByCategory(@PathVariable int categoryId) {
        List<DistributionRes> distributions = distributionService.getDistributionsByCategoryId(categoryId);
        return ResponseEntity.ok(distributions);
    }

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
}
