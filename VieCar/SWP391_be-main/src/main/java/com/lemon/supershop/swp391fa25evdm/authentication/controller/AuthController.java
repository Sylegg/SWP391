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
    public ResponseEntity<?> login(@RequestBody LoginReq dto) {
        try {
            LoginRes response = authenService.login(dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            // Trả về 401 Unauthorized với message rõ ràng
            if ("User not found".equals(ex.getMessage())) {
                return ResponseEntity.status(401).body(java.util.Map.of(
                    "success", false,
                    "message", "Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới."
                ));
            } else if ("Invalid password".equals(ex.getMessage())) {
                return ResponseEntity.status(401).body(java.util.Map.of(
                    "success", false,
                    "message", "Mật khẩu không chính xác. Vui lòng thử lại."
                ));
            } else if ("Account inactive".equals(ex.getMessage())) {
                return ResponseEntity.status(403).body(java.util.Map.of(
                    "success", false,
                    "message", "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
                ));
            } else {
                return ResponseEntity.status(500).body(java.util.Map.of(
                    "success", false,
                    "message", "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau."
                ));
            }
        }
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
