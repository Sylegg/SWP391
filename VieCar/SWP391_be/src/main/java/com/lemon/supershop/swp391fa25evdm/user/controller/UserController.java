package com.lemon.supershop.swp391fa25evdm.user.controller;

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

    /**
     * Get user profile by exact username match
     * Used for loading user after OAuth login
     */
    @GetMapping("/profile/by-username/{username}")
    public ResponseEntity<UserRes> getUserByExactUsername(@PathVariable("username") String username) {
        UserRes user = userService.findByExactUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
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

    @GetMapping("/dealer/{dealerId}/staff")
    public ResponseEntity<List<UserRes>> getDealerStaff(@PathVariable("dealerId") int dealerId) {
        List<UserRes> users = userService.findDealerStaffByDealerId(dealerId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/available-dealer-managers")
    public ResponseEntity<List<UserRes>> getAvailableDealerManagers() {
        List<UserRes> users = userService.findDealerManagersWithoutDealer();
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

    /**
     * Update preferred dealer for customer
     * @param userId Customer's user ID
     * @param dealerId Dealer ID (null to remove preferred dealer)
     * @return Updated user profile
     */
    @PutMapping("/{userId}/preferred-dealer")
    public ResponseEntity<UserRes> updatePreferredDealer(
            @PathVariable("userId") int userId,
            @RequestParam(value = "dealerId", required = false) Integer dealerId
    ) {
        try {
            System.out.println("📍 Update preferred dealer: userId=" + userId + ", dealerId=" + dealerId);
            UserRes updatedUser = userService.updatePreferredDealer(userId, dealerId);
            System.out.println("✅ Preferred dealer updated successfully");
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            System.err.println("❌ Error updating preferred dealer: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") int id) {
        if (userService.removeUser(id)){
            return ResponseEntity.ok("User Removed successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
