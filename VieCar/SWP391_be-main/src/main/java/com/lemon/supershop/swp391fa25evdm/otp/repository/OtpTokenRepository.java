package com.lemon.supershop.swp391fa25evdm.otp.repository;

import com.lemon.supershop.swp391fa25evdm.otp.model.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    
    Optional<OtpToken> findByEmailAndOtpAndTypeAndIsUsedFalse(String email, String otp, String type);
    
    List<OtpToken> findByEmailAndType(String email, String type);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    
    Optional<OtpToken> findFirstByEmailAndTypeAndIsUsedFalseOrderByCreatedAtDesc(String email, String type);
}
