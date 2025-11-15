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
            return convertUsertoUserRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> getAllActiveUsers() {
        return userRepo.findByStatus(UserStatus.ACTIVE).stream().map(user -> {
            return convertUsertoUserRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> getBlackList() {
        return userRepo.findByIsBlackTrue().stream().map(user -> {
            return convertUsertoUserRes(user);
        }).collect(Collectors.toList());
    }

    public UserRes findByUserId(int id) {
        Optional<User> user = userRepo.findById(id);
        if (user.isPresent()) {
            return convertUsertoUserRes(user.get());
        } else {
            return null;
        }
    }

    public List<UserRes> findByUsername(String name) {
        return userRepo.findByUsernameContainingIgnoreCase(name).stream().map(user -> {
            return convertUsertoUserRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> findByDealer(int dealerid) {
        return userRepo.findUsersByDealer_Id(dealerid).stream().map(user -> {
            return convertUsertoUserRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> findDealerManagersWithoutDealer() {
        return userRepo.findByRole_NameAndDealerIsNull("dealer manager").stream().map(user -> {
            return convertUsertoUserRes(user);
        }).collect(Collectors.toList());
    }

    public List<UserRes> findDealerStaffByDealerId(int dealerId) {
        return userRepo.findByRole_NameAndDealer_Id("Dealer Staff", dealerId).stream().map(user -> {
            return convertUsertoUserRes(user);
        }).collect(Collectors.toList());
    }

    public UserRes updateProfile(int id, UserReq dto){
        Optional<User> user = userRepo.findById(id);
        if(user.isPresent()){
            // Update username
            if(dto.getUsername() != null && !dto.getUsername().isEmpty()){
                user.get().setUsername(dto.getUsername());
            }
            
            // Update phone - chỉ validate nếu không rỗng
            if(dto.getPhone() != null){
                if(dto.getPhone().isEmpty()){
                    user.get().setPhone(null); // Cho phép xóa phone
                } else if(PHONE_PATTERN.matcher(dto.getPhone()).matches()){
                    user.get().setPhone(dto.getPhone());
                }
            }
            
            // Update email - chỉ validate nếu không rỗng
            if (dto.getEmail() != null){
                if(dto.getEmail().isEmpty()){
                    user.get().setEmail(null); // Cho phép xóa email
                } else if(EMAIL_PATTERN.matcher(dto.getEmail()).matches()){
                    user.get().setEmail(dto.getEmail());
                }
            }
            
            // Update address
            if(dto.getAddress() != null){
                user.get().setAddress(dto.getAddress().isEmpty() ? null : dto.getAddress());
            }
            
            // Update password - chỉ khi có giá trị mới
            if(dto.getPassword() != null && !dto.getPassword().isEmpty()){
                user.get().setPassword(dto.getPassword());
            }
            
            // Update role
            if (dto.getRoleName() != null && !dto.getRoleName().isEmpty()){
                Optional<Role> role = roleRepo.findByNameContainingIgnoreCase(dto.getRoleName());
                if(role.isPresent()){
                    user.get().setRole(role.get());
                }
            }
            
            // Update dealer
            if(dto.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(dto.getDealerId());
                if(dealer.isPresent()){
                    user.get().setDealer(dealer.get());
                }
            }
            
            // Update status
            if(dto.getStatus() != null){
                user.get().setStatus(dto.getStatus());
            }
            
            userRepo.save(user.get());
            return convertUsertoUserRes(user.get());
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
            return convertUsertoUserRes(user);
        } else {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }

    public UserRes convertUsertoUserRes(User user){
        UserRes dto = new UserRes();
        if(user != null){
            dto.setId(user.getId());
            if(user.getUsername() != null){
                dto.setName(user.getUsername());
                dto.setUsername(user.getUsername());  // Set both name and username for compatibility
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
            if(user.getRole() != null){
                dto.setRole(user.getRole().getName());
            }
            if (user.getStatus() != null){
                dto.setStatus(user.getStatus());
            }
            // Thêm thông tin dealer (dùng cho cả staff và customer)
            if(user.getDealer() != null){
                dto.setDealerId(user.getDealer().getId());
                dto.setDealerName(user.getDealer().getName());
                dto.setDealerAddress(user.getDealer().getAddress());
            }
        }
        return dto;
    }
}
