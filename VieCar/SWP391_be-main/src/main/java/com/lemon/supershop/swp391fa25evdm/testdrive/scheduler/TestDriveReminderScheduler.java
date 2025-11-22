package com.lemon.supershop.swp391fa25evdm.testdrive.scheduler;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lemon.supershop.swp391fa25evdm.email.service.EmailService;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;
import com.lemon.supershop.swp391fa25evdm.testdrive.repository.TestDriveRepository;

// ❌ DISABLED: Scheduler không hoạt động vì status không khớp
// Frontend sử dụng: PENDING, APPROVED, IN_PROGRESS, DONE
// Scheduler tìm kiếm: CONFIRMED (không tồn tại)
// @Service - COMMENTED OUT
public class TestDriveReminderScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(TestDriveReminderScheduler.class);
    
    @Autowired
    private TestDriveRepository testDriveRepository;
    
    @Autowired
    private EmailService emailService;
    
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
    
    /**
     * Chạy mỗi giờ để kiểm tra và gửi reminder
     * Cron: "0 0 * * * *" = giây 0, phút 0, mọi giờ, mọi ngày, mọi tháng, mọi năm
     * 
     * ❌ DISABLED: Status không khớp với frontend
     */
    // @Scheduled(cron = "0 0 * * * *")
    // @Transactional
    public void sendTestDriveReminders() {
        /* DISABLED - Status mismatch
        logger.info("Starting test drive reminder job at {}", LocalDateTime.now());
        
        try {
            // Gửi reminder 24 giờ trước
            send24HourReminders();
            
            // Gửi reminder 1 giờ trước
            send1HourReminders();
            
            logger.info("Test drive reminder job completed successfully");
        } catch (Exception e) {
            logger.error("Error in test drive reminder job: {}", e.getMessage(), e);
        }
        */
    }
    
    /**
     * Gửi reminder cho test drives diễn ra sau 24 giờ (23-25 giờ để có buffer)
     * ❌ DISABLED
     */
    /* DISABLED
    private void send24HourReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start24h = now.plusHours(23);
        LocalDateTime end24h = now.plusHours(25);
        
        List<TestDrive> testDrives = testDriveRepository.findTestDrivesNeedingReminder24h(start24h, end24h);
        
        logger.info("Found {} test drives needing 24-hour reminder", testDrives.size());
        
        for (TestDrive testDrive : testDrives) {
            try {
                sendReminder(testDrive, 24);
                testDrive.setReminded24h(true);
                testDriveRepository.save(testDrive);
                logger.info("Sent 24-hour reminder for test drive ID: {}", testDrive.getId());
            } catch (Exception e) {
                logger.error("Failed to send 24-hour reminder for test drive ID: {}", testDrive.getId(), e);
            }
        }
    }
    
    /**
     * Gửi reminder cho test drives diễn ra sau 1 giờ (0.5-1.5 giờ để có buffer)
     * ❌ DISABLED
     */
    /* DISABLED
    private void send1HourReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start1h = now.plusMinutes(30);
        LocalDateTime end1h = now.plusMinutes(90);
        
        List<TestDrive> testDrives = testDriveRepository.findTestDrivesNeedingReminder1h(start1h, end1h);
        
        logger.info("Found {} test drives needing 1-hour reminder", testDrives.size());
        
        for (TestDrive testDrive : testDrives) {
            try {
                sendReminder(testDrive, 1);
                testDrive.setReminded1h(true);
                testDriveRepository.save(testDrive);
                logger.info("Sent 1-hour reminder for test drive ID: {}", testDrive.getId());
            } catch (Exception e) {
                logger.error("Failed to send 1-hour reminder for test drive ID: {}", testDrive.getId(), e);
            }
        }
    }
    
    /**
     * Gửi email reminder cho test drive
     * @param testDrive Test drive cần nhắc nhở
     * @param hoursUntil Số giờ còn lại (24 hoặc 1)
     * ❌ DISABLED
     */
    /* DISABLED
    private void sendReminder(TestDrive testDrive, int hoursUntil) {
        String customerEmail = testDrive.getUser().getEmail();
        String customerName = testDrive.getUser().getUsername();
        String productName = testDrive.getProduct().getName();
        String dealerName = testDrive.getDealer().getName();
        String dealerAddress = testDrive.getDealer().getAddress();
        
        String scheduleDate = testDrive.getScheduleDate().format(dateFormatter);
        String scheduleTime = testDrive.getScheduleDate().format(timeFormatter);
        
        emailService.sendTestDriveReminder(
            customerEmail,
            customerName,
            productName,
            dealerName,
            dealerAddress,
            scheduleDate,
            scheduleTime,
            hoursUntil
        );
    }
    */
    
    /**
     * Job chạy hàng ngày lúc 9 giờ sáng để cleanup reminders cũ
     * Reset reminder flags cho test drives đã qua để tránh database phình to
     * ❌ DISABLED
     */
    // @Scheduled(cron = "0 0 9 * * *")
    // @Transactional
    public void cleanupOldReminders() {
        /* DISABLED
        logger.info("Starting reminder cleanup job at {}", LocalDateTime.now());
        
        try {
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
            
            // Không cần cleanup vì database tự quản lý, nhưng có thể log statistics
            long completedCount = testDriveRepository.findAll().stream()
                .filter(td -> td.getScheduleDate().isBefore(yesterday))
                .filter(td -> "COMPLETED".equals(td.getStatus()) || "CANCELED".equals(td.getStatus()))
                .count();
            
            logger.info("Found {} completed/canceled test drives from yesterday or earlier", completedCount);
            logger.info("Reminder cleanup job completed");
        } catch (Exception e) {
            logger.error("Error in reminder cleanup job: {}", e.getMessage(), e);
        }
        */
    }
}
