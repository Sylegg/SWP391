package com.lemon.supershop.swp391fa25evdm.user.service;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.RegisterReq;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.role.model.dto.RoleDto;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.AddUserReq;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserReq;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    UserRepo userRepo;

    @Autowired
    RoleRepo roleRepo;

    @Autowired
    DealerRepo dealerRepo;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", Pattern.CASE_INSENSITIVE);

    // Hợp lệ cho VN: 10-digit bắt đầu 03|05|07|08|09 OR old 11-digit 01(2|6|8|9)
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(?:(?:03|05|07|08|09)\\d{8}|01(?:2|6|8|9)\\d{8})$");

    public List<UserRes> getAllUsers() {
        return userRepo.findByIsBlackFalse().stream().map(user -> {
            UserRes dto = new UserRes(user.getId(), user.getUsername(), user.getEmail(), user.getPhone(), user.getAddress(), new RoleDto(user.getRole().getName(), user.getRole().getDescription()));
            return dto;
        }).collect(Collectors.toList());
    }

    public List<UserRes> getBlackList() {
        return userRepo.findByIsBlackTrue().stream().map(user -> {
            UserRes dto = new UserRes(user.getId(), user.getUsername(), user.getEmail(), user.getPhone(), user.getAddress(), new RoleDto(user.getRole().getName(), user.getRole().getDescription()));
            return dto;
        }).collect(Collectors.toList());
    }

    public UserRes findByUserId(int id) {
        Optional<User> user = userRepo.findById(id);
        if (user.isPresent()) {
            return new UserRes(user.get().getId(), user.get().getUsername(), user.get().getEmail(), user.get().getPhone(), user.get().getAddress(), new RoleDto(user.get().getRole() != null ? user.get().getRole().getName() : null, user.get().getRole() != null ? user.get().getRole().getDescription() : null));
        } else {
            return null;
        }
    }

    public List<UserRes> findByUsername(String name) {
        return userRepo.findByUsernameContainingIgnoreCase(name).stream().map(user -> {
            UserRes dto = new UserRes(user.getId(), user.getUsername(), user.getEmail(), user.getPhone(), user.getAddress(), new RoleDto(user.getRole() != null ? user.getRole().getName() : null, user.getRole() != null ? user.getRole().getDescription() : null));
            return dto;
        }).collect(Collectors.toList());
    }

    public void addUser(AddUserReq dto) {
        User user = new User();
        Role role = roleRepo.findByNameContainingIgnoreCase(dto.getRole());

        user.setRole(role);

        if (dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()){
            user.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null && EMAIL_PATTERN.matcher(dto.getEmail()).matches()){
            user.setEmail(dto.getEmail());
        }

        Optional<Dealer> dealer = dealerRepo.findByNameContainingIgnoreCase(dto.getDealer());
        if (dealer.isPresent()) {
            user.setDealer(dealer.get());
        }
        if (dto.getUsername() != null){
            user.setUsername(dto.getUsername());
        }
        role.addUser(user);
        userRepo.save(user);
    }

    public void updateProfile(int id, UserReq dto){
        Optional<User> user = userRepo.findById(id);
        if(user.isPresent()){

            if(dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()){
                user.get().setPhone(dto.getPhone());
            }
            if (dto.getEmail() != null && EMAIL_PATTERN.matcher(dto.getEmail()).matches()){
                user.get().setEmail(dto.getEmail());
            }
            if(dto.getUsername() != null){
                user.get().setUsername(dto.getUsername());
            }
            if(dto.getAddress() != null){
                user.get().setAddress(dto.getAddress());
            }

            userRepo.save(user.get());
        }
    }

    public void removeUser(int id) {
        Optional<User> user = userRepo.findById(id);
        Role role = roleRepo.findByNameContainingIgnoreCase(user.get().getRole().getName());
        if(user.isPresent() && role != null){
            role.removeUser(user.orElse(null));
            userRepo.delete(user.get());
        }
    }
}
