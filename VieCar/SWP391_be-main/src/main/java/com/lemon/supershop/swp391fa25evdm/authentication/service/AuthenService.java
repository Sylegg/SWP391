package com.lemon.supershop.swp391fa25evdm.authentication.service;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.*;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.otp.service.OtpService;
import com.lemon.supershop.swp391fa25evdm.refra.JwtUtil;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.model.enums.UserStatus;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private OtpService otpService;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", Pattern.CASE_INSENSITIVE);

    // Hợp lệ cho VN: 10-digit bắt đầu 03|05|07|08|09 OR old 11-digit 01(2|6|8|9)
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(?:(?:03|05|07|08|09)\\d{8}|01(?:2|6|8|9)\\d{8})$");


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
        
        // Kiểm tra mật khẩu trước
        if (!user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        // Kiểm tra email đã được xác thực chưa
        if (!user.isEmailVerified()) {
            // Tự động gửi lại OTP
            otpService.generateAndSendOtp(user.getEmail(), "REGISTER");
            throw new RuntimeException("EMAIL_NOT_VERIFIED:" + user.getEmail());
        }
        
        // Kiểm tra trạng thái tài khoản sau khi verify (có thể bị admin disable)
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new RuntimeException("Account has been disabled by administrator");
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

    /**
     * GOOGLE LOGIN METHOD
     * Xử lý login/register user từ Google OAuth2.
     * 
     * Method này được gọi bởi CustomOAuth2UserService sau khi nhận user info từ Google.
     * Không cần password vì user đã được Google xác thực.
     * 
     * @Transactional annotation đảm bảo:
     * - Tất cả DB operations trong method này nằm trong 1 transaction
     * - Hibernate session vẫn mở khi access lazy-loaded entities (như user.getRole())
     * - Nếu có exception, tất cả thay đổi sẽ bị rollback
     * 
     * Flow:
     * 1. Lấy email và name từ Google OAuth2User
     * 2. Tìm user trong DB theo email
     * 3a. Nếu đã có: kiểm tra status và dùng user đó
     * 3b. Nếu chưa có: tạo user mới với role Customer, password/phone/address empty
     * 4. Generate JWT access token và refresh token
     * 5. Trả về LoginRes với tokens và user info
     * 
     * @param oauthUser - OAuth2User object từ Google chứa user info (email, name, etc.)
     * @return LoginRes - Response object chứa JWT tokens, username, role, userId, dealerId
     * @throws RuntimeException nếu email invalid hoặc account inactive
     */
    @Transactional  // Giữ Hibernate session mở để tránh LazyInitializationException khi access user.getRole().getName()
    public LoginRes loginWithGoogle(OAuth2User oauthUser) {

        // Lấy email và name từ Google OAuth2 user attributes
        // Google trả về các attributes này trong OAuth2 UserInfo endpoint response
        String email = oauthUser.getAttribute("email");  // Email từ Google account
        String name = oauthUser.getAttribute("name");    // Display name từ Google profile

        System.out.println("========== GOOGLE LOGIN DEBUG ==========");
        System.out.println("Email from Google: " + email);
        System.out.println("Name from Google: " + name);

        // Validate email: phải có và đúng format
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new RuntimeException("Phải cung cấp email đúng form");
        }

        // Tìm user trong database theo email
        Optional<User> userOpt = userRepo.findByEmail(email);
        System.out.println("User found in DB: " + userOpt.isPresent());

        User user;
        boolean isNewUser = false;  // Flag để phân biệt user mới

        if (userOpt.isPresent()) {
            // User đã tồn tại trong hệ thống (đã đăng ký trước đó)
            user = userOpt.get();
            System.out.println("Existing user found - ID: " + user.getId() + ", Username: " + user.getUsername());
            System.out.println("User status: " + user.getStatus());
            
            // Kiểm tra status: nếu account bị vô hiệu hóa thì không cho login
            if (user.getStatus() == UserStatus.INACTIVE) {
                throw new RuntimeException("Account inactive");
            }
            
            // User cũ - đã có đầy đủ thông tin
            isNewUser = false;
            System.out.println("Using existing user - isNewUser: false");
        } else {
            // User chưa có trong hệ thống -> Tạo user mới (auto-registration)
            System.out.println("User NOT found in DB - Creating new user");
            user = new User();
            user.setEmail(email);
            user.setUsername(name);     // Dùng Google name làm username
            user.setPassword("");       // Google user không có password (xác thực qua Google)
            user.setPhone("");          // Google OAuth không trả về phone number - cần điền sau
            user.setAddress("");        // Google OAuth không trả về address - cần điền sau
            user.setStatus(UserStatus.ACTIVE);  // User mới tự động active
            user.setEmailVerified(true); // Email đã được Google xác thực

            // Gán role mặc định là "Customer" cho user mới
            // Tìm role "Customer" trong database (phải tồn tại sẵn)
            Role defaultRole = roleRepo.findByNameContainingIgnoreCase("Customer")
                    .orElseThrow(() -> new RuntimeException("Default role Customer not found"));
            user.setRole(defaultRole);

            // Lưu user mới vào database
            user = userRepo.save(user);
            System.out.println("New user created - ID: " + user.getId());
            
            // Đánh dấu là user mới - cần điền thông tin bổ sung
            isNewUser = true;
            System.out.println("Creating new user - isNewUser: true");
        }

        // Generate JWT access token và refresh token cho user
        // Token được sign bằng secret key và có expiration time
        String token = jwtUtil.generateToken(user.getUsername());           // Access token (JWT) - short-lived (vd: 1 giờ)
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername()); // Refresh token - long-lived (vd: 7 ngày)

        // Tạo LoginRes object chứa tokens và user info
        // @Transactional đảm bảo user.getRole() có thể access được (không bị LazyInitializationException)
        LoginRes res = new LoginRes(token, refreshToken, user.getUsername(), user.getRole().getName());
        res.setUserId(user.getId());  // Set user ID để frontend có thể dùng
        res.setIsNewUser(isNewUser);  // Set flag để frontend biết cần điền thông tin hay không

        // Nếu user có dealer (Dealer Manager/Staff), thêm dealer info vào response
        if (user.getDealer() != null) {
            res.setDealerId(user.getDealer().getId());
            res.setDealerName(user.getDealer().getName());
            res.setDealerAddress(user.getDealer().getAddress());
        }

        return res;
    }

    public void register(RegisterReq dto) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("EMAIL_DUPLICATE");
        }
        
        User user = new User();
        user.setId(0); // Ensure ID is 0 for new entity (JPA will generate new ID)
        User newUser = converttoEntity(user, dto);
        if (newUser != null) {
            // Đặt trạng thái là INACTIVE cho đến khi xác thực email
            newUser.setStatus(UserStatus.INACTIVE);
            newUser.setEmailVerified(false);
            userRepo.save(newUser);
            
            // Gửi OTP qua email
            otpService.generateAndSendOtp(dto.getEmail(), "REGISTER");
        }
    }
    
    public void verifyRegistrationOtp(VerifyOtpReq dto) {
        // Xác thực OTP
        boolean isValid = otpService.verifyOtp(dto.getEmail(), dto.getOtp(), "REGISTER");
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        // Kích hoạt tài khoản
        Optional<User> userOpt = userRepo.findByEmail(dto.getEmail());
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        userRepo.save(user);
    }
    
    public void resendOtp(String email, String type) {
        // Kiểm tra user tồn tại
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Email not found");
        }
        
        // Gửi lại OTP
        otpService.generateAndSendOtp(email, type);
    }
    
    public void forgotPassword(ForgotPasswordReq dto) {
        // Kiểm tra email tồn tại
        Optional<User> userOpt = userRepo.findByEmail(dto.getEmail());
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Email not found");
        }
        
        // Gửi OTP qua email
        otpService.generateAndSendOtp(dto.getEmail(), "FORGOT_PASSWORD");
    }
    
    public void resetPassword(ResetPasswordReq dto) {
        // Xác thực OTP
        boolean isValid = otpService.verifyOtp(dto.getEmail(), dto.getOtp(), "FORGOT_PASSWORD");
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        // Kiểm tra mật khẩu mới
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }
        
        // Cập nhật mật khẩu
        Optional<User> userOpt = userRepo.findByEmail(dto.getEmail());
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setPassword(dto.getNewPassword());
        userRepo.save(user);
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
                user.setEmail(dto.getEmail());
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
            // Status sẽ được set trong register method
            return user;
        }
        return null;
    }
}
