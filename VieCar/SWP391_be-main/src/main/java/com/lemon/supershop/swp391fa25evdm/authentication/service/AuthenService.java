package com.lemon.supershop.swp391fa25evdm.authentication.service;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.*;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.refra.JwtUtil;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.model.enums.UserStatus;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthenService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private DealerRepo dealerRepo;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", Pattern.CASE_INSENSITIVE);

    // Hợp lệ cho VN: 10-digit bắt đầu 03|05|07|08|09 OR old 11-digit 01(2|6|8|9)
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(?:(?:03|05|07|08|09)\\d{8}|01(?:2|6|8|9)\\d{8})$");


    public LoginRes login(LoginReq dto) {
        Optional<User> user = Optional.empty();
        if (dto.getIdentifier() != null){
            if (EMAIL_PATTERN.matcher(dto.getIdentifier()).matches()){
                user = userRepo.findByEmail(dto.getIdentifier());
            } else {
                user = userRepo.findByUsername(dto.getIdentifier());
            }
        }

        if (!user.isPresent()) {
            throw new RuntimeException("User not found");
        }
<<<<<<< HEAD
        if (!user.get().getPassword().equals(dto.getPassword())) {
=======
        
        User user = userOpt.get();
        
        // Kiểm tra trạng thái tài khoản
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new RuntimeException("Account inactive");
        }
        
        if (!user.getPassword().equals(dto.getPassword())) {
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.get().getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.get().getUsername());

        LoginRes response = new LoginRes(token, refreshToken, user.get().getUsername(), user.get().getRole().getName());

        return response;
    }

    public void register(RegisterReq dto) {
        User user = new User();
        user.setId(0); // Ensure ID is 0 for new entity (JPA will generate new ID)
        User newUser = converttoEntity(user, dto);
        if (newUser != null) {
            userRepo.save(newUser);
        }
    }

    public void changePassword(int id, ChangePassReq dto){
        Optional<User> user = userRepo.findById(id);
        if (user.isPresent()) {
            if (dto.getOldPass().equals(user.get().getPassword())){
                if (!dto.getNewPass().equals(user.get().getPassword())){
                    if (dto.getNewPass().equals(dto.getConfirmPass())){
                        user.get().setPassword(dto.getNewPass());
                        userRepo.save(user.get());
                    }
                }
            }
        }
    }

    public User converttoEntity(User user, RegisterReq dto){
        if (user != null) {
            if (dto.getRoleName() != null){
                Optional<Role> role = roleRepo.findByNameContainingIgnoreCase(dto.getRoleName());
                if (role.isPresent()) {
                    user.setRole(role.get());
                    // ❌ REMOVED: role.get().addUser(user); - Causes Hibernate session conflict
                }
            }
            if (dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()){
                user.setPhone(dto.getPhone());
            }
            if (dto.getEmail() != null && EMAIL_PATTERN.matcher(dto.getEmail()).matches()){
                if (userRepo.existsByEmail(dto.getEmail())){
                    throw new RuntimeException("EMAIL_DUPLICATE");
                } else {
                    user.setEmail(dto.getEmail());
                }
            }
            if (dto.getPassword().equals(dto.getConfirmPassword())){
                user.setPassword(dto.getPassword());
            }
            if (dto.getUsername() != null) {
                user.setUsername(dto.getUsername());
            }
            if (dto.getAddress() != null){
                user.setAddress(dto.getAddress());
            }
            // Set dealer if dealerId is provided
            if (dto.getDealerId() != null && dto.getDealerId() > 0) {
                Optional<Dealer> dealer = dealerRepo.findById(dto.getDealerId());
                if (dealer.isPresent()) {
                    user.setDealer(dealer.get());
                }
            }
            user.setStatus(UserStatus.ACTIVE);
            return user;
        }
        return null;
    }
}
