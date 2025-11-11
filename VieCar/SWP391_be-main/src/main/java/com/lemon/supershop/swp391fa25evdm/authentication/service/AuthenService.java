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

    // Chỉ cho phép 10 chữ số, bắt đầu bằng số 0
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^0\\d{9}$");


    public LoginRes login(LoginReq dto) {
        Optional<User> userOpt = Optional.empty();
        if (dto.getIdentifier() != null){
            if (EMAIL_PATTERN.matcher(dto.getIdentifier()).matches()){
                userOpt = userRepo.findByEmail(dto.getIdentifier());
            } else {
                userOpt = userRepo.findByUsername(dto.getIdentifier());
            }
        }

        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        if (!user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        LoginRes response = new LoginRes(token, refreshToken, user.getUsername(), user.getRole().getName());
        
        // Thêm thông tin user và dealer nếu có
        response.setUserId(user.getId());
        if (user.getDealer() != null) {
            response.setDealerId(user.getDealer().getId());
            response.setDealerName(user.getDealer().getName());
            response.setDealerAddress(user.getDealer().getAddress());
        }

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
        Optional<User> userOpt = userRepo.findById(id);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        String oldPass = dto.getOldPass();
        String newPass = dto.getNewPass();
        String confirmPass = dto.getConfirmPass();

        if (oldPass == null || newPass == null || confirmPass == null) {
            throw new RuntimeException("Password fields must not be null");
        }

        if (!oldPass.equals(user.getPassword())) {
            throw new RuntimeException("Old password does not match");
        }

        if (newPass.equals(user.getPassword())) {
            throw new RuntimeException("New password must be different from old password");
        }

        if (!newPass.equals(confirmPass)) {
            throw new RuntimeException("Confirm password does not match new password");
        }

        user.setPassword(newPass);
        userRepo.save(user);
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
