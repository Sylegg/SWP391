package com.lemon.supershop.swp391fa25evdm.user.service;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserReq;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.model.enums.UserStatus;
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
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private DealerRepo dealerRepo;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", Pattern.CASE_INSENSITIVE);

    // Hợp lệ cho VN: 10-digit bắt đầu 03|05|07|08|09 OR old 11-digit 01(2|6|8|9)
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(?:(?:03|05|07|08|09)\\d{8}|01(?:2|6|8|9)\\d{8})$");

    public List<UserRes> getAllUsers() {
        return userRepo.findByIsBlackFalse().stream().map(user -> {
            return converttoRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> getAllActiveUsers() {
        return userRepo.findByStatus(UserStatus.ACTIVE).stream().map(user -> {
            return converttoRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> getBlackList() {
        return userRepo.findByIsBlackTrue().stream().map(user -> {
            return converttoRes(user);
        }).collect(Collectors.toList());
    }

    public UserRes findByUserId(int id) {
        Optional<User> user = userRepo.findById(id);
        if (user.isPresent()) {
            return converttoRes(user.get());
        } else {
            return null;
        }
    }

    public List<UserRes> findByUsername(String name) {
        return userRepo.findByUsernameContainingIgnoreCase(name).stream().map(user -> {
            return converttoRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> findByDealer(int dealerid) {
        return userRepo.findUsersByDealer_Id(dealerid).stream().map(user -> {
            return converttoRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> findDealerManagersWithoutDealer() {
        return userRepo.findByRole_NameAndDealerIsNull("dealer manager").stream().map(user -> {
            return converttoRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> findDealerStaffByDealerId(int dealerId) {
        return userRepo.findByRole_NameAndDealer_Id("Dealer Staff", dealerId).stream().map(user -> {
            return converttoRes(user);
        }).collect(Collectors.toList());
    }

    public UserRes updateProfile(int id, UserReq dto){
        Optional<User> user = userRepo.findById(id);
        if(user.isPresent()){

            if(dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()){
                user.get().setPhone(dto.getPhone());
            }
            if (dto.getEmail() != null && EMAIL_PATTERN.matcher(dto.getEmail()).matches()){
                user.get().setEmail(dto.getEmail());

                // GOOGLE USER AUTO PASSWORD: Nếu user chưa có password (Google login),
                // tự động set password = phone number
                if(user.get().getPassword() == null || user.get().getPassword().isEmpty()){
                    user.get().setPassword(dto.getPhone());
                    System.out.println("Auto-set password for Google user: " + id + " to phone number");
                }
            }
            if(dto.getUsername() != null){
                user.get().setUsername(dto.getUsername());
            }
            if(dto.getAddress() != null){
                user.get().setAddress(dto.getAddress());
            }
            if (dto.getRoleName() != null){
                Optional<Role> role = roleRepo.findByNameContainingIgnoreCase(dto.getRoleName());
                if(role.isPresent()){
                    user.get().setRole(role.get());
                }
            }
            if(dto.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(dto.getDealerId());
                if(dealer.isPresent()){
                    user.get().setDealer(dealer.get());
                }
            }
            if(dto.getEmailVerified() != null){
                user.get().setEmailVerified(dto.getEmailVerified());
            }
            User savedUser = userRepo.save(user.get());
            UserRes userRes = converttoRes(savedUser);

            // GOOGLE USER NOTIFICATION: Nếu vừa set password (Google user hoàn tất profile),
            // trả về password tạm để frontend hiển thị thông báo
            if(dto.getPhone() != null && !dto.getPhone().isEmpty() &&
                    savedUser.getPassword() != null && savedUser.getPassword().equals(dto.getPhone())){
                userRes.setTemporaryPassword(savedUser.getPassword());
                System.out.println("Returning temporary password for Google user notification");
            }
            return userRes;
        } else {
            return null;
        }
    }

    public void blackList(int id){
        Optional<User> user = userRepo.findById(id);
        if(user.isPresent()){
            user.get().setBlack(true);
        }
        userRepo.save(user.get());
    }

    public boolean removeUser(int id) {
        Optional<User> user = userRepo.findById(id);
        if(user.isPresent()){
            user.get().setStatus(UserStatus.INACTIVE);
            userRepo.save(user.get());
            return true;
        }
        return false;
    }

    // Cập nhật dealer cho customer (giờ dùng chung field dealer)
    public UserRes updatePreferredDealer(int userId, Integer dealerId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (dealerId == null) {
                // Xóa dealer
                user.setDealer(null);
            } else {
                // Set dealer
                Optional<Dealer> dealerOpt = dealerRepo.findById(dealerId);
                if (dealerOpt.isPresent()) {
                    user.setDealer(dealerOpt.get());
                } else {
                    throw new RuntimeException("Dealer not found with id: " + dealerId);
                }
            }

            userRepo.save(user);
            return converttoRes(user);
        } else {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }

    public UserRes converttoRes(User user){
        UserRes dto = new UserRes();
        if(user != null){
            dto.setId(user.getId());
            if(user.getUsername() != null){
                dto.setName(user.getUsername());
            }
            if(user.getEmail() != null){
                dto.setEmail(user.getEmail());
            }
            if(user.getPhone() != null){
                dto.setPhone(user.getPhone());
            }
            if(user.getAddress() != null){
                dto.setAddress(user.getAddress());
            }
            if(user.getRole() != null && user.getRole().getName() != null){
                dto.setRole(user.getRole().getName());
            }
            if (user.getStatus() != null){
                dto.setStatus(user.getStatus().name());
            }
            dto.setEmailVerified(user.getEmailVerified());
            if(user.getDealer() != null){
                dto.setDealerId(user.getDealer().getId());
                dto.setDealerName(user.getDealer().getName());
                dto.setDealerAddress(user.getDealer().getAddress());
            }
        }
        return dto;
    }
}
