package com.lemon.supershop.swp391fa25evdm.user.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserReq;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import com.lemon.supershop.swp391fa25evdm.user.service.UserService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
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

    @GetMapping("/listActiceUser")
    public ResponseEntity<List<UserRes>> getAllActiceUsers() {
        List<UserRes> users = userService.getAllActiveUsers();
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

    @GetMapping("/dealer/{DealerId}")
    public ResponseEntity<List<UserRes>> searchDealerEmployee(@PathVariable("DealerId") int dealerId) {
        List<UserRes> users = userService.findByDealer(dealerId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/available-dealer-managers")
    public ResponseEntity<List<UserRes>> getAvailableDealerManagers() {
        List<UserRes> users = userService.findDealerManagersWithoutDealer();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/dealer/{dealerId}/staff")
    public ResponseEntity<List<UserRes>> getDealerStaff(@PathVariable("dealerId") int dealerId) {
        List<UserRes> users = userService.findDealerStaffByDealerId(dealerId);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/addBlackList/{id}")
    public ResponseEntity<String> addBlackList(@PathVariable("id") int id) {
        userService.blackList(id);
        return ResponseEntity.ok("User added into black list successfully");
    }

    @PutMapping("profile/{id}")
    public ResponseEntity<UserRes> updateProfile(@PathVariable("id") int id, @RequestBody UserReq dto) throws Exception {
        UserRes user = userService.updateProfile(id, dto);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") int id) {
        if (userService.removeUser(id)){
            return ResponseEntity.ok("User Removed successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // API để customer cập nhật dealer đang quan tâm
    @PutMapping("/{userId}/preferred-dealer")
    public ResponseEntity<UserRes> updatePreferredDealer(
            @PathVariable("userId") int userId,
            @RequestParam(value = "dealerId", required = false) Integer dealerId) {
        try {
            UserRes user = userService.updatePreferredDealer(userId, dealerId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
