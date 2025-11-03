package com.lemon.supershop.swp391fa25evdm.authentication.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.ChangePassReq;
import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.LoginReq;
import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.LoginRes;
import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.RegisterReq;
import com.lemon.supershop.swp391fa25evdm.authentication.service.AuthenService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {
    @Autowired
    AuthenService authenService;

    @PostMapping("/login")
    public ResponseEntity<LoginRes> login(@RequestBody LoginReq dto) {
        return ResponseEntity.ok(authenService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterReq dto) {
        try {
            authenService.register(dto);
            return ResponseEntity.ok("User registered successfully");
        } catch (RuntimeException ex) {
            if ("EMAIL_DUPLICATE".equals(ex.getMessage())) {
                return ResponseEntity.status(409).body("Email đã tồn tại");
            }
            // Return 400 for other validation errors
            return ResponseEntity.status(400).body(ex.getMessage());
        }
    }

    @PutMapping("/changePassword/{id}")
    public ResponseEntity<String> changePassword(@PathVariable("id") int id, ChangePassReq dto){
        authenService.changePassword(id, dto);
        return ResponseEntity.ok("Password changed successfully");
    }
}
