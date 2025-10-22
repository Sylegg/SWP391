package com.lemon.supershop.swp391fa25evdm.preorder.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lemon.supershop.swp391fa25evdm.preorder.model.dto.PreOrderRes;
import com.lemon.supershop.swp391fa25evdm.preorder.service.PreOrderService;

@RestController
@RequestMapping("/api/preorders")
@CrossOrigin("*")
public class PreOrderController {
    
    @Autowired
    private PreOrderService preOrderService;

    @GetMapping ("/listPreOrders")
    public ResponseEntity<List<PreOrderRes>> getAllPreOrders() {
        List<PreOrderRes> preOrders = preOrderService.getAllPreOrders();
        return ResponseEntity.ok(preOrders);
    }

    @GetMapping ("/listPreOrdersByUserId")
    public ResponseEntity<List<PreOrderRes>> getPreOrdersByUserId(@RequestParam int userId) {
        List<PreOrderRes> preOrders = preOrderService.getPreOrdersByUserId(userId);
        return ResponseEntity.ok(preOrders);
    }

    @GetMapping ("/listPreOrdersByStatus")
    public ResponseEntity<List<PreOrderRes>> getPreOrdersByStatus(@RequestParam String status) {
        List<PreOrderRes> preOrders = preOrderService.getPreOrdersByStatus(status);
        return ResponseEntity.ok(preOrders);
    }

    @GetMapping ("/listPreOrdersByProductId")
    public ResponseEntity<List<PreOrderRes>> getPreOrdersByProductId(@RequestParam int productId) {
        List<PreOrderRes> preOrders = preOrderService.getPreOrdersByProductId(productId);
        return ResponseEntity.ok(preOrders);
    }

    @PostMapping ("/createPreOrder")
    public ResponseEntity<PreOrderRes> createPreOrder (@RequestBody PreOrderRes dto) {
        PreOrderRes preOrderRes = preOrderService.createPreOrder(dto);
        if (preOrderRes != null) {
            return ResponseEntity.ok(preOrderRes);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping ("/updatePreOrder/{id}")
    public ResponseEntity<PreOrderRes> updatePreOrder (@PathVariable int id, @RequestBody PreOrderRes dto) {
        PreOrderRes preOrder = preOrderService.updatePreOrder(id, dto);
        if (preOrder != null) {
            return ResponseEntity.ok(preOrder);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping ("/deletePreOrder/{id}")
    public ResponseEntity<String> deletePreOrder (@PathVariable int id) {
        if (preOrderService.deletePreOrder(id)){
            return ResponseEntity.ok("PreOrder deleted successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

}
