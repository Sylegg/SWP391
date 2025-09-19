package com.lemon.supershop.swp391fa25evdm.user.controller;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.RegisterReq;
import com.lemon.supershop.swp391fa25evdm.authentication.service.AuthenService;
import com.lemon.supershop.swp391fa25evdm.role.model.dto.RoleDto;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.AddUserReq;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserReq;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import com.lemon.supershop.swp391fa25evdm.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/listUser")
    public ResponseEntity<List<UserRes>> getAllUsers() {
        List<UserRes> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/blackListUser")
    public ResponseEntity<List<UserRes>> getBlackListUsers() {
        List<UserRes> users = userService.getBlackList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/Profile/{id}")
    public ResponseEntity<UserRes> getUserProfile(@PathVariable("id") int id) {
        UserRes user = userService.findByUserId(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{UserName}")
    public ResponseEntity<List<UserRes>> searchUser(@PathVariable("UserName") String userName) {
        List<UserRes> users = userService.findByUsername(userName);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/addUser")
    public ResponseEntity<String> addUser(@RequestBody AddUserReq dto) {
        userService.addUser(dto);
        return ResponseEntity.ok("User registered successfully");
    }

    @PutMapping("profile/{id}")
    public ResponseEntity<String> updateProfile(@PathVariable("id") int id, @RequestBody UserReq dto) throws Exception {
        userService.updateProfile(id, dto);
        return ResponseEntity.ok("User Updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") int id) {
        userService.removeUser(id);
        return ResponseEntity.ok("User Removed successfully");
    }
}
