package com.lemon.supershop.swp391fa25evdm.authentication.controller;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.LoginReq;
import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.LoginRes;
import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.RegisterReq;
import com.lemon.supershop.swp391fa25evdm.authentication.service.AuthenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenService authenService;

    @PostMapping("/login")
    public ResponseEntity<LoginRes> login(@RequestBody LoginReq dto) {
        return ResponseEntity.ok(authenService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterReq dto) {
        authenService.register(dto);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/registerAdmin")
    public ResponseEntity<String> registerAdmin(@RequestBody RegisterReq dto) {
        authenService.registerAmin(dto);
        return ResponseEntity.ok("Admin registered successfully");
    }
}
