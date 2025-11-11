package com.lemon.supershop.swp391fa25evdm.dealer.service;

import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerReq;
import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.model.enums.DealerStatus;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class DealerService {

    @Autowired
    private DealerRepo dealerRepo;

    @Autowired
    private UserRepo userRepo;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", Pattern.CASE_INSENSITIVE);

    // Chỉ cho phép 10 chữ số, bắt đầu bằng số 0
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^0\\d{9}$");

    public List<DealerRes> getAllDealers() {
        return dealerRepo.findAll().stream().map(dealer -> {
            return convertDealertoDealerRes(dealer);
        }).collect(Collectors.toList());
    }

    public DealerRes getDealer(int id) {
        Optional<Dealer> dealer = dealerRepo.findById(id);
        if (dealer.isPresent()) {
            return  convertDealertoDealerRes(dealer.get());
        } else {
            return null;
        }
    }

    public List<DealerRes> searchDealerbyName(String name) {
        return dealerRepo.findByNameContainingIgnoreCase(name).stream().map(dealer -> {
            return convertDealertoDealerRes(dealer);
        }).collect(Collectors.toList());
    }

    public List<DealerRes> searchDealerbyAddress(String address) {
        return dealerRepo.findByAddressContainingIgnoreCase(address).stream().map(dealer -> {
            return convertDealertoDealerRes(dealer);
        }).collect(Collectors.toList());
    }

    public DealerRes registerDealer(DealerReq dto) {
        // Kiểm tra trùng email của Dealer
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            if (EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
                if (dealerRepo.existsByEmail(dto.getEmail())) {
                    throw new RuntimeException("Email đại lý đã được sử dụng: " + dto.getEmail());
                }
            }
        }
        
        // Kiểm tra trùng email của Quản lý Đại lý
        if (dto.getUserId() != null && dto.getUserId() > 0) {
            Optional<User> user = userRepo.findById(dto.getUserId());
            if (user.isPresent()) {
                User dealerManager = user.get();
                // Kiểm tra nếu email đã tồn tại và thuộc về user khác
                if (dealerManager.getEmail() != null && !dealerManager.getEmail().isEmpty()) {
                    // Kiểm tra xem có dealer manager nào khác đã dùng email này chưa
                    Optional<User> existingUser = userRepo.findByEmail(dealerManager.getEmail());
                    if (existingUser.isPresent() && existingUser.get().getId() != dealerManager.getId()) {
                        throw new RuntimeException("Email của Quản lý Đại lý đã được sử dụng: " + dealerManager.getEmail());
                    }
                }
                
                // Kiểm tra nếu user đã được gán cho dealer khác
                if (dealerManager.getDealer() != null) {
                    throw new RuntimeException("Quản lý Đại lý này đã được gán cho đại lý khác");
                }
            } else {
                throw new RuntimeException("Không tìm thấy Quản lý Đại lý với ID: " + dto.getUserId());
            }
        }
        
        Dealer dealer = new Dealer();
        if (dto.getName() !=  null){
            dealer.setName(dto.getName());
        }
        if (dto.getAddress() !=  null){
            dealer.setAddress(dto.getAddress());
        }
        if (dto.getLatitude() != null){
            dealer.setLatitude(dto.getLatitude());
        }
        if (dto.getLongitude() != null){
            dealer.setLongitude(dto.getLongitude());
        }
        if (dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()) {
            dealer.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null && EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
            dealer.setEmail(dto.getEmail());
        }
        if (dto.getTaxcode() != null){
            dealer.setTaxcode(dto.getTaxcode());
        }
        dealer.setStatus(DealerStatus.ACTIVE);
        dealerRepo.save(dealer);
        
        // Liên kết user với dealer nếu có userId
        if (dto.getUserId() != null && dto.getUserId() > 0) {
            Optional<User> user = userRepo.findById(dto.getUserId());
            if (user.isPresent()) {
                User dealerManager = user.get();
                dealerManager.setDealer(dealer);
                userRepo.save(dealerManager);
            }
        }
        
        return  convertDealertoDealerRes(dealer);
    }

    public DealerRes updateDealer(int id, DealerReq dto) {
        Dealer dealer = dealerRepo.findById(id).get();
        if (dealer != null) {
            // Kiểm tra trùng email khi update (nếu email thay đổi)
            if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
                if (EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
                    // Chỉ kiểm tra nếu email khác với email hiện tại
                    if (!dto.getEmail().equals(dealer.getEmail())) {
                        Optional<Dealer> existingDealer = dealerRepo.findByEmail(dto.getEmail());
                        if (existingDealer.isPresent() && existingDealer.get().getId() != id) {
                            throw new RuntimeException("Email đại lý đã được sử dụng: " + dto.getEmail());
                        }
                    }
                    dealer.setEmail(dto.getEmail());
                }
            }
            
            if (dto.getName() !=  null){
                dealer.setName(dto.getName());
            }
            if (dto.getAddress() !=  null){
                dealer.setAddress(dto.getAddress());
            }
            if (dto.getLatitude() != null){
                dealer.setLatitude(dto.getLatitude());
            }
            if (dto.getLongitude() != null){
                dealer.setLongitude(dto.getLongitude());
            }
            if (dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()) {
                dealer.setPhone(dto.getPhone());
            }

            dealerRepo.save(dealer);
            return  convertDealertoDealerRes(dealer);
        }
        return null;
    }
    @Transactional
    public boolean removeDealer(int id) {
        Optional<Dealer> dealer = dealerRepo.findById(id);
        if (dealer.isPresent()) {
            dealerRepo.clearDealerFromUsers(dealer.get().getId());
            dealerRepo.delete(dealer.get());
            return true;
        }
        return false;
    }

    public DealerRes convertDealertoDealerRes(Dealer dealer){
        DealerRes dto = new DealerRes();
        if (dealer != null) {
            dto.setId(dealer.getId());
            if (dealer.getName() != null) {
                dto.setName(dealer.getName());
            }
            if (dealer.getAddress() != null) {
                dto.setAddress(dealer.getAddress());
            }
            if (dealer.getLatitude() != null) {
                dto.setLatitude(dealer.getLatitude());
            }
            if (dealer.getLongitude() != null) {
                dto.setLongitude(dealer.getLongitude());
            }
            if (dealer.getPhone() != null) {
                dto.setPhone(dealer.getPhone());
            }
            if (dealer.getEmail() != null) {
                dto.setEmail(dealer.getEmail());
            }
            if (dealer.getTaxcode() != null) {
                dto.setTaxcode(dealer.getTaxcode());
            }
            if (dealer.getStatus() != null) {
                dto.setStatus(dealer.getStatus());
            }
            if (dealer.getCreateAt() != null) {
                dto.setCreationDate(dealer.getCreateAt());
            }
        }
        return dto;
    }
}
