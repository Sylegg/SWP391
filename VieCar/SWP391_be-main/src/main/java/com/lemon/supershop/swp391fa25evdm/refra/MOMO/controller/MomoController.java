package com.lemon.supershop.swp391fa25evdm.refra.MOMO.controller;

import com.lemon.supershop.swp391fa25evdm.refra.MOMO.dto.CreateMomoRes;
import com.lemon.supershop.swp391fa25evdm.refra.MOMO.service.MomoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/momo")
public class MomoController {

    @Autowired
    private MomoService momoService;

    @PostMapping("/createQR/{orderId}")
    public ResponseEntity<CreateMomoRes> createMomo(@PathVariable int orderId) {
        CreateMomoRes newQR = momoService.CreateQr(orderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(newQR);
    }
}
