package com.lemon.supershop.swp391fa25evdm.otp.service;

import com.lemon.supershop.swp391fa25evdm.otp.model.entity.OtpToken;
import com.lemon.supershop.swp391fa25evdm.otp.repository.OtpTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {
    
    @Autowired
    private OtpTokenRepository otpTokenRepository;
    
    @Autowired
    private OtpEmailService otpEmailService;
    
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 10;
    private static final SecureRandom random = new SecureRandom();
    
    /**
     * Tạo và gửi OTP mới
     */
    @Transactional
    public void generateAndSendOtp(String email, String type) {
        // Xóa các OTP cũ chưa sử dụng của email này
        invalidateOldOtps(email, type);
        
        // Tạo mã OTP ngẫu nhiên 6 chữ số
        String otp = generateOtpCode();
        
        // Tạo token với thời gian hết hạn
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);
        OtpToken otpToken = new OtpToken(email, otp, type, expiresAt);
        
        // Lưu vào database
        otpTokenRepository.save(otpToken);
        
        // Gửi email
        otpEmailService.sendOtpEmail(email, otp, type);
    }
    
    /**
     * Xác thực OTP
     */
    @Transactional
    public boolean verifyOtp(String email, String otp, String type) {
        Optional<OtpToken> otpTokenOpt = otpTokenRepository
                .findByEmailAndOtpAndTypeAndIsUsedFalse(email, otp, type);
        
        if (!otpTokenOpt.isPresent()) {
            return false;
        }
        
        OtpToken otpToken = otpTokenOpt.get();
        
        // Kiểm tra xem OTP đã hết hạn chưa
        if (otpToken.isExpired()) {
            return false;
        }
        
        // Đánh dấu OTP đã được sử dụng
        otpToken.setUsed(true);
        otpToken.setVerifiedAt(LocalDateTime.now());
        otpTokenRepository.save(otpToken);
        
        return true;
    }
    
    /**
     * Vô hiệu hóa các OTP cũ
     */
    @Transactional
    public void invalidateOldOtps(String email, String type) {
        var oldOtps = otpTokenRepository.findByEmailAndType(email, type);
        for (OtpToken oldOtp : oldOtps) {
            if (!oldOtp.isUsed()) {
                oldOtp.setUsed(true);
                otpTokenRepository.save(oldOtp);
            }
        }
    }
    
    /**
     * Tạo mã OTP ngẫu nhiên 6 chữ số
     */
    private String generateOtpCode() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
    
    /**
     * Xóa các OTP đã hết hạn (dùng cho scheduled task)
     */
    @Transactional
    public void cleanupExpiredOtps() {
        otpTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
