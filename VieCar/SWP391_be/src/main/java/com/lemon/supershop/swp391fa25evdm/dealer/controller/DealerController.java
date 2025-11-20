package com.lemon.supershop.swp391fa25evdm.dealer.controller;

import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerReq;
import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.dealer.service.DealerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dealer")
@CrossOrigin("*")
public class DealerController {

    @Autowired
    DealerService dealerService;

    @GetMapping("/listDealer")
    public ResponseEntity<List<DealerRes>> getAllDealers() {
        List<DealerRes> dealers = dealerService.getAllDealers();
        return ResponseEntity.ok(dealers);
    }

    @GetMapping("dealerHome/{id}")
    public ResponseEntity<DealerRes> getDealer(@PathVariable("id") int id) {
        DealerRes dealer = dealerService.getDealer(id);
        return ResponseEntity.ok(dealer);
    }

    @GetMapping("byName/{DealerName}")
    public ResponseEntity<List<DealerRes>> searchDealer(@PathVariable("DealerName") String dealerName) {
        List<DealerRes> dealers = dealerService.searchDealerbyName(dealerName);
        return ResponseEntity.ok(dealers);
    }

    @GetMapping("byAddress/{Address}")
    public ResponseEntity<List<DealerRes>> searchAddress(@PathVariable("Address") String address) {
        List<DealerRes> dealers = dealerService.searchDealerbyAddress(address);
        return ResponseEntity.ok(dealers);
    }

    @PostMapping("/registerDealer")
    public ResponseEntity<DealerRes> registerDealer(@RequestBody DealerReq dto) {
        DealerRes dealer = dealerService.registerDealer(dto);
        if (dealer != null) {
            return ResponseEntity.ok(dealer);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("dealerHome/{id}")
    public ResponseEntity<DealerRes> updateDealer(@PathVariable("id") int id, @RequestBody DealerReq dto) throws Exception {
        DealerRes dealer = dealerService.updateDealer(id, dto);
        if (dealer != null) {
            return ResponseEntity.ok(dealer);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDealer(@PathVariable("id") int id) {
        if (dealerService.removeDealer(id)){
            return ResponseEntity.ok("Dealer Removed successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
