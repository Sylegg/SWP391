package com.lemon.supershop.swp391fa25evdm.refra.otp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OtpEmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.email.from:noreply@evdm.com}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp, String type) {
        // Log OTP to console for development/testing
        System.out.println("=====================================");
        System.out.println("📧 SENDING OTP EMAIL");
        System.out.println("To: " + toEmail);
        System.out.println("OTP: " + otp);
        System.out.println("Type: " + type);
        System.out.println("=====================================");

        // Try to send actual email in background, but don't block/fail if email has issues
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);

            if ("REGISTER".equals(type)) {
                message.setSubject("Xác thực tài khoản - Mã OTP");
                message.setText("Xin chào,\n\n" +
                        "Cảm ơn bạn đã đăng ký tài khoản tại hệ thống của chúng tôi.\n\n" +
                        "Mã OTP của bạn là: " + otp + "\n\n" +
                        "Mã này sẽ hết hiệu lực sau 10 phút.\n\n" +
                        "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\n" +
                        "Trân trọng,\n" +
                        "Đội ngũ hỗ trợ");
            } else if ("FORGOT_PASSWORD".equals(type)) {
                message.setSubject("Khôi phục mật khẩu - Mã OTP");
                message.setText("Xin chào,\n\n" +
                        "Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu của bạn.\n\n" +
                        "Mã OTP của bạn là: " + otp + "\n\n" +
                        "Mã này sẽ hết hiệu lực sau 10 phút.\n\n" +
                        "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và đảm bảo tài khoản của bạn được bảo mật.\n\n" +
                        "Trân trọng,\n" +
                        "Đội ngũ hỗ trợ");
            }

            mailSender.send(message);
            System.out.println("✅ Email sent successfully!");
        } catch (Exception emailEx) {
            // Log error but don't fail - OTP is logged to console for testing
            System.err.println("⚠️ Could not send email: " + emailEx.getMessage());
            System.out.println("⚠️ OTP is displayed in console above for testing purposes");
            // Don't throw exception - allow registration/login to continue
        }
    }
}
