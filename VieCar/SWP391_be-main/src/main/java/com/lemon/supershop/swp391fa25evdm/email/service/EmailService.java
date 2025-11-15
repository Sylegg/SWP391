package com.lemon.supershop.swp391fa25evdm.email.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${app.email.from}")
    private String fromEmail;
    
    @Value("${app.email.from-name}")
    private String fromName;
    
    /**
     * Send simple text email
     */
    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        mailSender.send(message);
    }
    
    /**
     * Send HTML email
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send test drive confirmation email
     */
    public void sendTestDriveConfirmation(
            String to, 
            String customerName,
            String productName,
            String dealerName,
            String scheduleDate,
            String scheduleTime) {
        
        String subject = "Xác nhận đặt lịch lái thử - EVDM";
        String htmlBody = buildTestDriveConfirmationHtml(
            customerName, productName, dealerName, scheduleDate, scheduleTime
        );
        
        sendHtmlEmail(to, subject, htmlBody);
    }
    
    /**
     * Send test drive reminder email
     */
    public void sendTestDriveReminder(
            String to,
            String customerName,
            String productName,
            String dealerName,
            String dealerAddress,
            String scheduleDate,
            String scheduleTime,
            int hoursUntil) {
        
        String subject = String.format("Nhắc nhở: Lịch lái thử của bạn sau %d giờ nữa - EVDM", hoursUntil);
        String htmlBody = buildTestDriveReminderHtml(
            customerName, productName, dealerName, dealerAddress, scheduleDate, scheduleTime, hoursUntil
        );
        
        sendHtmlEmail(to, subject, htmlBody);
    }
    
    /**
     * Send test drive status update email
     */
    public void sendTestDriveStatusUpdate(
            String to,
            String customerName,
            String productName,
            String status,
            String notes) {
        
        String subject = "Cập nhật trạng thái lịch lái thử - EVDM";
        String htmlBody = buildStatusUpdateHtml(customerName, productName, status, notes);
        
        sendHtmlEmail(to, subject, htmlBody);
    }
    
    /**
     * Send vehicle ready notification email (Order ready for pickup)
     */
    public void sendVehicleReadyNotification(
            String to,
            String customerName,
            String productName,
            String dealerName,
            String dealerAddress,
            double totalPrice,
            double depositPaid,
            double remainingAmount,
            String expectedDeliveryDate) {
        
        String subject = "🚗 Xe của bạn đã sẵn sàng - Vui lòng đến nhận xe - EVDM";
        String htmlBody = buildVehicleReadyHtml(
            customerName, productName, dealerName, dealerAddress, 
            totalPrice, depositPaid, remainingAmount, expectedDeliveryDate
        );
        
        sendHtmlEmail(to, subject, htmlBody);
    }
    
    // ===== HTML Template Builders =====
    
    private String buildTestDriveConfirmationHtml(
            String customerName,
            String productName,
            String dealerName,
            String scheduleDate,
            String scheduleTime) {
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4169E1; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4169E1; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4169E1; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚗 Xác nhận đặt lịch lái thử</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Cảm ơn bạn đã đặt lịch lái thử xe điện tại EVDM. Chúng tôi đã nhận được yêu cầu của bạn và sẽ sắp xếp trải nghiệm tốt nhất cho bạn.</p>
                        
                        <div class="info-box">
                            <h3>📋 Thông tin lịch hẹn:</h3>
                            <p><strong>Xe:</strong> %s</p>
                            <p><strong>Đại lý:</strong> %s</p>
                            <p><strong>Ngày:</strong> %s</p>
                            <p><strong>Giờ:</strong> %s</p>
                        </div>
                        
                        <p><strong>Lưu ý quan trọng:</strong></p>
                        <ul>
                            <li>Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân</li>
                            <li>Mang theo bằng lái xe hợp lệ (nếu bạn muốn tự lái)</li>
                            <li>Chúng tôi sẽ gửi email nhắc nhở trước khi đến lịch hẹn</li>
                        </ul>
                        
                        <p>Nếu bạn cần thay đổi hoặc hủy lịch hẹn, vui lòng liên hệ với chúng tôi sớm nhất có thể.</p>
                        
                        <p>Chúc bạn có trải nghiệm tuyệt vời!</p>
                        
                        <p>Trân trọng,<br><strong>EVDM Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2025 EVDM - Electric Vehicle Dealer Management. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            </body>
            </html>
            """, customerName, productName, dealerName, scheduleDate, scheduleTime);
    }
    
    private String buildTestDriveReminderHtml(
            String customerName,
            String productName,
            String dealerName,
            String dealerAddress,
            String scheduleDate,
            String scheduleTime,
            int hoursUntil) {
        
        String timeText = hoursUntil == 24 ? "1 ngày" : hoursUntil + " giờ";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FFA500; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FFA500; }
                    .alert-box { background-color: #fff3cd; padding: 15px; margin: 15px 0; border: 1px solid #ffc107; border-radius: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ Nhắc nhở lịch lái thử</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        
                        <div class="alert-box">
                            <p style="margin: 0; font-size: 16px;">
                                <strong>⚠️ Lịch lái thử của bạn sẽ diễn ra sau %s nữa!</strong>
                            </p>
                        </div>
                        
                        <div class="info-box">
                            <h3>📋 Thông tin lịch hẹn:</h3>
                            <p><strong>Xe:</strong> %s</p>
                            <p><strong>Đại lý:</strong> %s</p>
                            <p><strong>Địa chỉ:</strong> %s</p>
                            <p><strong>Ngày:</strong> %s</p>
                            <p><strong>Giờ:</strong> %s</p>
                        </div>
                        
                        <p><strong>Chuẩn bị:</strong></p>
                        <ul>
                            <li>✅ Giấy tờ tùy thân</li>
                            <li>✅ Bằng lái xe hợp lệ</li>
                            <li>✅ Đến đúng giờ</li>
                        </ul>
                        
                        <p>Chúng tôi rất mong được gặp bạn!</p>
                        
                        <p>Trân trọng,<br><strong>EVDM Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2025 EVDM - Electric Vehicle Dealer Management. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, customerName, timeText, productName, dealerName, dealerAddress, scheduleDate, scheduleTime);
    }
    
    private String buildStatusUpdateHtml(
            String customerName,
            String productName,
            String status,
            String notes) {
        
        String statusText;
        String statusColor;
        
        switch (status) {
            case "CONFIRMED":
                statusText = "Đã xác nhận ✅";
                statusColor = "#32CD32";
                break;
            case "CANCELED":
                statusText = "Đã hủy ❌";
                statusColor = "#DC143C";
                break;
            case "COMPLETED":
                statusText = "Hoàn thành ✓";
                statusColor = "#4169E1";
                break;
            default:
                statusText = status;
                statusColor = "#666";
        }
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: %s; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid %s; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Cập nhật trạng thái</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Lịch lái thử xe <strong>%s</strong> của bạn đã được cập nhật trạng thái.</p>
                        
                        <div class="info-box">
                            <h3>Trạng thái mới: <span style="color: %s;">%s</span></h3>
                            %s
                        </div>
                        
                        <p>Cảm ơn bạn đã sử dụng dịch vụ của EVDM!</p>
                        
                        <p>Trân trọng,<br><strong>EVDM Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2025 EVDM - Electric Vehicle Dealer Management. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, statusColor, statusColor, customerName, productName, statusColor, statusText,
            notes != null && !notes.isEmpty() ? "<p><strong>Ghi chú:</strong> " + notes + "</p>" : "");
    }
    
    private String buildVehicleReadyHtml(
            String customerName,
            String productName,
            String dealerName,
            String dealerAddress,
            double totalPrice,
            double depositPaid,
            double remainingAmount,
            String expectedDeliveryDate) {
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #9333EA; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #9333EA; }
                    .price-box { background-color: #FEF3C7; padding: 15px; margin: 15px 0; border-left: 4px solid #F59E0B; border-radius: 5px; }
                    .date-box { background-color: #D1FAE5; padding: 15px; margin: 15px 0; border-left: 4px solid #10B981; border-radius: 5px; }
                    .highlight { color: #9333EA; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .important { background-color: #DBEAFE; padding: 15px; margin: 15px 0; border-left: 4px solid #3B82F6; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚗 Xe của bạn đã sẵn sàng!</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Chúng tôi vui mừng thông báo rằng chiếc xe <span class="highlight">%s</span> của bạn đã được chuẩn bị xong và sẵn sàng để giao!</p>
                        
                        <div class="date-box">
                            <h3 style="margin: 0 0 10px 0; color: #059669;">📅 Ngày giao dự kiến</h3>
                            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #047857;">%s</p>
                        </div>
                        
                        <div class="info-box">
                            <h3>📋 Thông tin nhận xe:</h3>
                            <p><strong>Sản phẩm:</strong> %s</p>
                            <p><strong>Đại lý:</strong> %s</p>
                            <p><strong>Địa chỉ:</strong> %s</p>
                        </div>
                        
                        <div class="price-box">
                            <h3>💰 Thông tin thanh toán:</h3>
                            <p><strong>Tổng giá trị đơn hàng:</strong> %,.0f VNĐ</p>
                            <p><strong>Đã đặt cọc (30%%):</strong> <span style="color: #059669;">%,.0f VNĐ</span></p>
                            <p style="font-size: 18px; margin-top: 10px;"><strong>Còn phải thanh toán (70%%):</strong> <span style="color: #DC2626; font-size: 20px;">%,.0f VNĐ</span></p>
                        </div>
                        
                        <div class="important">
                            <h3>⚠️ Lưu ý quan trọng:</h3>
                            <ul>
                                <li>Vui lòng đến đại lý để nhận xe và hoàn tất thanh toán</li>
                                <li>Mang theo giấy tờ tùy thân (CMND/CCCD) khi đến nhận xe</li>
                                <li>Số tiền cần thanh toán khi nhận xe: <strong>%,.0f VNĐ (70%% còn lại)</strong></li>
                                <li>Nhân viên sẽ hướng dẫn bàn giao xe và các thủ tục cần thiết</li>
                            </ul>
                        </div>
                        
                        <p style="margin-top: 20px;">Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với đại lý <strong>%s</strong> hoặc hotline của chúng tôi.</p>
                        
                        <p>Cảm ơn bạn đã tin tưởng lựa chọn EVDM!</p>
                        
                        <p>Trân trọng,<br><strong>EVDM Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2025 EVDM - Electric Vehicle Dealer Management. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, customerName, productName, expectedDeliveryDate, productName, dealerName, dealerAddress, 
            totalPrice, depositPaid, remainingAmount, remainingAmount, dealerName);
    }
}
