package com.lemon.supershop.swp391fa25evdm.authentication.controller;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.authentication.service.AuthenService;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {
    @Autowired
    AuthenService authenService;

//    @GetMapping("/google/callback")
//    public void googleCallback(@AuthenticationPrincipal OAuth2User oauthUser, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
//        // Kiểm tra nếu OAuth2 authentication thất bại
//        if (oauthUser == null) {
//            response.sendRedirect("http://localhost:3000/login?error=authentication_failed");
//            return;
//        }
//
//        // Lấy JWT tokens và user info từ OAuth2User attributes
//        // Các attributes này được thêm vào bởi CustomOAuth2UserService.loadUser()
//        String jwt = (String) oauthUser.getAttribute("jwt");                    // Access token (JWT)
//        String refreshToken = (String) oauthUser.getAttribute("refreshToken"); // Refresh token để renew JWT khi hết hạn
//        String role = (String) oauthUser.getAttribute("role");                  // Role của user (Customer, Admin, etc.)
//        String email = (String) oauthUser.getAttribute("email");                // Email từ Google
//        String name = (String) oauthUser.getAttribute("name");                  // Tên từ Google
//
//        // Xác định dashboard path dựa trên role của user
//        // Ví dụ: Customer -> /dashboard/customer, Admin -> /dashboard/admin
//        String dashboardPath = getDashboardPath(role);
//
//        // Tạo redirect URL về frontend với tokens và user info trong query params
//        // Frontend sẽ parse URL params này để lưu tokens vào localStorage
//        String redirectUrl = String.format(
//                "http://localhost:3000%s?google_login=success&token=%s&refreshToken=%s&role=%s&email=%s&name=%s",
//                dashboardPath, jwt, refreshToken, role, email, name
//        );
//
//        // Redirect user về frontend dashboard với authenticated state
//        response.sendRedirect(redirectUrl);
//    }
    /**
     * GOOGLE OAUTH2 CALLBACK ENDPOINT
     * Endpoint này được gọi sau khi user xác thực thành công với Google.
     * Spring Security tự động chuyển hướng về đây sau khi OAuth2 flow hoàn tất.
     *
     * Flow:
     * 1. User click "Sign in with Google" trên frontend
     * 2. Frontend redirect đến /oauth2/authorization/google
     * 3. Google xác thực user và gọi callback về /login/oauth2/code/google
     * 4. CustomOAuth2UserService xử lý user info từ Google
     * 5. Spring Security gọi endpoint này với OAuth2User đã được enriched (có JWT token)
     * 6. Endpoint này redirect user về frontend với token trong URL
     *
     * @param oauthUser - OAuth2User object chứa thông tin từ Google + JWT tokens được thêm vào bởi CustomOAuth2UserService
     * @param response - HttpServletResponse để redirect về frontend
     */
    @GetMapping("/google/callback")
    public void googleCallback(@AuthenticationPrincipal OAuth2User oauthUser, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        // Kiểm tra nếu OAuth2 authentication thất bại
        if (oauthUser == null) {
            response.sendRedirect("http://localhost:3000/login?error=authentication_failed");
            return;
        }

        // Lấy JWT tokens và user info từ OAuth2User attributes
        // Các attributes này được thêm vào bởi CustomOAuth2UserService.loadUser()
        String jwt = (String) oauthUser.getAttribute("jwt");                    // Access token (JWT)
        String refreshToken = (String) oauthUser.getAttribute("refreshToken"); // Refresh token để renew JWT khi hết hạn
        String role = (String) oauthUser.getAttribute("role");                  // Role của user (Customer, Admin, etc.)
        Integer userId = (Integer) oauthUser.getAttribute("userId");            // User ID từ database
        Boolean isNewUser = (Boolean) oauthUser.getAttribute("isNewUser");      // Flag phân biệt user mới
        String email = (String) oauthUser.getAttribute("email");                // Email từ Google
        String name = (String) oauthUser.getAttribute("name");                  // Tên từ Google

        // Xác định redirect path:
        // - User mới (isNewUser = true) -> /complete-profile (cần điền thông tin phone, address)
        // - User cũ (isNewUser = false) -> / (home page)
        String redirectPath;
        if (isNewUser != null && isNewUser) {
            redirectPath = "/complete-profile";  // User mới cần điền thông tin bổ sung
        } else {
            redirectPath = "/";  // User cũ đã có đầy đủ thông tin, về home page
        }

        // URL encode các tham số có thể chứa ký tự đặc biệt (tiếng Việt, space, etc.)
        // Tránh lỗi: "The Unicode character [?] cannot be encoded as it is outside the permitted range of 0 to 255"
        String encodedEmail = URLEncoder.encode(email != null ? email : "", StandardCharsets.UTF_8);
        String encodedName = URLEncoder.encode(name != null ? name : "", StandardCharsets.UTF_8);

        // Tạo redirect URL về frontend với tokens và user info trong query params
        // Frontend sẽ parse URL params này để lưu tokens vào localStorage
        String redirectUrl = String.format(
                "http://localhost:3000%s?google_login=success&token=%s&refreshToken=%s&role=%s&userId=%s&isNewUser=%s&email=%s&name=%s",
                redirectPath, jwt, refreshToken, role, userId, isNewUser, encodedEmail, encodedName
        );

        // Redirect user về frontend với authenticated state
        response.sendRedirect(redirectUrl);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq dto) {
        try {
            LoginRes response = authenService.login(dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            // Trả về 401 Unauthorized với message rõ ràng
            if ("User not found".equals(ex.getMessage())) {
                return ResponseEntity.status(401).body(java.util.Map.of(
                        "success", false,
                        "message", "Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới."
                ));
            } else if ("Invalid password".equals(ex.getMessage())) {
                return ResponseEntity.status(401).body(java.util.Map.of(
                        "success", false,
                        "message", "Mật khẩu không chính xác. Vui lòng thử lại."
                ));
            } else if (ex.getMessage().startsWith("EMAIL_NOT_VERIFIED:")) {
                // Tách email từ message
                String email = ex.getMessage().substring("EMAIL_NOT_VERIFIED:".length());
                return ResponseEntity.status(403).body(java.util.Map.of(
                        "success", false,
                        "requireOtp", true,
                        "email", email,
                        "message", "Tài khoản chưa được xác thực. Vui lòng nhập mã OTP đã được gửi đến email của bạn."
                ));
            } else if ("Account has been disabled by administrator".equals(ex.getMessage())) {
                return ResponseEntity.status(403).body(java.util.Map.of(
                        "success", false,
                        "message", "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
                ));
            } else {
                return ResponseEntity.status(500).body(java.util.Map.of(
                        "success", false,
                        "message", "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau."
                ));
            }
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterReq dto) {
        try {
            authenService.register(dto);
            return ResponseEntity.ok("OTP đã được gửi đến email của bạn. Vui lòng xác thực để hoàn tất đăng ký.");
        } catch (IllegalArgumentException ex) {
            if ("EMAIL_DUPLICATE".equals(ex.getMessage())) {
                return ResponseEntity.status(409).body("Email đã tồn tại");
            }
            // Return 400 for other validation errors
            return ResponseEntity.status(400).body(ex.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpReq dto) {
        try {
            authenService.verifyRegistrationOtp(dto);
            return ResponseEntity.ok("Xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(ex.getMessage());
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestBody ForgotPasswordReq dto) {
        try {
            authenService.resendOtp(dto.getEmail(), "REGISTER");
            return ResponseEntity.ok("OTP mới đã được gửi đến email của bạn.");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(ex.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordReq dto) {
        try {
            authenService.forgotPassword(dto);
            return ResponseEntity.ok("OTP khôi phục mật khẩu đã được gửi đến email của bạn.");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(ex.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordReq dto) {
        try {
            authenService.resetPassword(dto);
            return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(ex.getMessage());
        }
    }

    @PutMapping("/changePassword/{id}")
    public ResponseEntity<String> changePassword(@PathVariable("id") int id, ChangePassReq dto){
        authenService.changePassword(id, dto);
        return ResponseEntity.ok("Password changed successfully");
    }

    /**
     * HELPER METHOD: Xác định dashboard path dựa trên role
     *
     * Map role của user sang đúng dashboard route trên frontend.
     * Mỗi role có dashboard riêng với các chức năng phù hợp.
     *
     * @param role - Role name (Admin, Customer, Dealer-Manager, etc.)
     * @return Dashboard path tương ứng với role
     *
     * Role mapping:
     * - Admin -> /dashboard/admin (quản lý toàn bộ hệ thống)
     * - Dealer-Manager -> /dashboard/dealer-manager (quản lý đại lý)
     * - Dealer-Staff -> /dashboard/dealer-staff (nhân viên đại lý)
     * - EVM-Staff -> /dashboard/evm-staff (nhân viên EVM)
     * - Customer (default) -> /dashboard/customer (khách hàng)
     */
    private String getDashboardPath(String role) {
        // Nếu role null hoặc không xác định, mặc định là customer
        if (role == null) return "/dashboard/customer";

        // Switch case để map role sang dashboard path (case-insensitive)
        switch (role.toLowerCase()) {
            case "admin":
                return "/dashboard/admin";
            case "dealer-manager":
                return "/dashboard/dealer-manager";
            case "dealer-staff":
                return "/dashboard/dealer-staff";
            case "evm-staff":
                return "/dashboard/evm-staff";
            case "customer":
            default:
                // Default case: tất cả role không xác định đều redirect về customer dashboard
                return "/dashboard/customer";
        }
    }
}
