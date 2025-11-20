package com.lemon.supershop.swp391fa25evdm.authentication.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.LoginRes;

/**
 * CUSTOM OAUTH2 USER SERVICE
 * Service này xử lý thông tin user từ Google OAuth2 và tạo JWT tokens.
 * 
 * Spring Security gọi service này sau khi nhận được user info từ Google.
 * Service này có nhiệm vụ:
 * 1. Lấy user info từ Google (email, name, etc.)
 * 2. Tạo hoặc cập nhật user trong database
 * 3. Generate JWT tokens (access token + refresh token)
 * 4. Thêm tokens vào OAuth2User attributes để AuthController có thể lấy
 * 
 * Flow:
 * Google -> Spring Security -> CustomOAuth2UserService -> AuthenService -> AuthController
 */
@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Autowired
    private AuthenService authenService;

    /**
     * Override method loadUser từ OAuth2UserService interface.
     * Method này được Spring Security tự động gọi sau khi nhận user info từ Google.
     * 
     * @param userRequest - Request chứa thông tin OAuth2 (access token, client registration, etc.)
     * @return OAuth2User - User object với thông tin từ Google + JWT tokens
     * @throws OAuth2AuthenticationException nếu có lỗi trong quá trình authentication
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Sử dụng DefaultOAuth2UserService để lấy user info từ Google
        // Service này gọi Google UserInfo endpoint với access token
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        OAuth2User oauthUser = delegate.loadUser(userRequest);

        // Gọi AuthenService để xử lý Google login:
        // - Tìm user trong DB theo email
        // - Nếu chưa có thì tạo user mới (username = Google name, password = empty)
        // - Generate JWT access token và refresh token
        LoginRes loginResult = authenService.loginWithGoogle(oauthUser);
        
        // OAuth2User attributes mặc định là UnmodifiableMap (không thể sửa)
        // Phải tạo HashMap mới để có thể thêm custom attributes (JWT tokens)
        Map<String, Object> attributes = new HashMap<>(oauthUser.getAttributes());
        
        // Thêm JWT tokens và user info vào attributes
        // AuthController sẽ lấy các giá trị này để redirect về frontend
        attributes.put("jwt", loginResult.getToken());              // Access token (JWT) - dùng để authenticate API calls
        attributes.put("refreshToken", loginResult.getRefreshToken()); // Refresh token - dùng để renew JWT khi hết hạn
        attributes.put("role", loginResult.getRole());              // Role của user (Customer, Admin, etc.)
        attributes.put("userId", loginResult.getUserId());          // User ID trong database
        
        // Nếu user có dealer (cho Dealer Manager/Staff), thêm dealer info
        if (loginResult.getDealerId() != null) {
            attributes.put("dealerId", loginResult.getDealerId());
            attributes.put("dealerName", loginResult.getDealerName());
            attributes.put("dealerAddress", loginResult.getDealerAddress());
        }

        // Tạo OAuth2User mới với attributes đã được enriched (thêm JWT tokens)
        // Spring Security sẽ pass object này cho AuthController
        return new DefaultOAuth2User(
                oauthUser.getAuthorities(),  // Giữ nguyên authorities từ Google
                attributes,                   // Attributes mới với JWT tokens
                "sub"                         // Name attribute key - Google sử dụng "sub" (subject) làm unique identifier
        );
    }
}
