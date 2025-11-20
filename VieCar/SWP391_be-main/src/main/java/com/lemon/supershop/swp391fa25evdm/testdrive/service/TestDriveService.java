package com.lemon.supershop.swp391fa25evdm.testdrive.service;

import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.model.enums.DealerStatus;
import com.lemon.supershop.swp391fa25evdm.dealer.service.DealerService;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.service.UserService;
import com.lemon.supershop.swp391fa25evdm.email.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveReq;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveRes;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;
import com.lemon.supershop.swp391fa25evdm.testdrive.repository.TestDriveRepository;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;

@Service
public class TestDriveService {

    @Autowired
    private TestDriveRepository testDriveRepository;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private DealerRepo dealerRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private CategoryRepository categoryRepo;
    @Autowired
    private DealerService dealerService;
    @Autowired
    private UserService userService;
    @Autowired
    private EmailService emailService;

    public List<TestDriveRes> getAllTestDrive() {
        List<TestDrive> testDrives = testDriveRepository.findAll();
        return testDrives.stream().map(this::convertToRes).toList();
    }

    public TestDriveRes getTestDriveById(int id) {
        TestDrive testDrive = testDriveRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("TestDrive not found with id: " + id));
        return convertToRes(testDrive);
    }

    public List<TestDriveRes> getTestDriveByUserId(int userId) {
        List<TestDrive> testDrives = testDriveRepository.findByUserId(userId);
        return testDrives.stream().map(this::convertToRes).toList();
    }

    public List<TestDriveRes> getTestDriveByDealerId(int dealerId) {
        List<TestDrive> testDrives = testDriveRepository.findByDealerId(dealerId);
        return testDrives.stream().map(this::convertToRes).toList();
    }

    public TestDriveRes createTestDrive(TestDriveReq req) {
        // 1️⃣ Validate User exists
        if (req.getUserId() <= 0) {
            throw new IllegalArgumentException("ID người dùng không hợp lệ");
        }
        User user = userRepo.findById(req.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + req.getUserId()));
        
        // 2️⃣ Validate Dealer exists and is active
        if (req.getDealerId() <= 0) {
            throw new IllegalArgumentException("ID đại lý không hợp lệ");
        }
        Dealer dealer = dealerRepo.findById(req.getDealerId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đại lý với ID: " + req.getDealerId()));
        
        if (dealer.getStatus() != DealerStatus.ACTIVE) {
            throw new IllegalArgumentException("Đại lý '" + dealer.getName() + "' hiện không hoạt động");
        }
        
        // 3️⃣ Validate Category exists (customer selects category/model)
        if (req.getCategoryId() <= 0) {
            throw new IllegalArgumentException("Vui lòng chọn mẫu xe muốn lái thử");
        }
        Category category = categoryRepo.findById(req.getCategoryId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mẫu xe với ID: " + req.getCategoryId()));
        
        // 4️⃣ Validate schedule date
        if (req.getScheduleDate() == null) {
            throw new IllegalArgumentException("Vui lòng chọn ngày và giờ lái thử");
        }
        
        java.time.LocalDateTime scheduleDateTime = req.getScheduleDate();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        
        if (scheduleDateTime.isBefore(now)) {
            throw new IllegalArgumentException("Không thể đặt lịch lái thử trong quá khứ");
        }
        
        // 5️⃣ Check if user already has an active test drive (status != DONE)
        List<TestDrive> activeTestDrives = testDriveRepository.findByUserId(req.getUserId())
            .stream()
            .filter(td -> !"DONE".equals(td.getStatus()) && !"REJECTED".equals(td.getStatus()) && !"CANCELLED".equals(td.getStatus()))
            .toList();
        
        if (!activeTestDrives.isEmpty()) {
            throw new IllegalArgumentException("Bạn chỉ có thể đặt 1 lịch lái thử tại một thời điểm. Vui lòng hoàn thành hoặc hủy lịch hiện tại trước.");
        }
        
        // 6️⃣ Check if user has already completed test drive for this category
        boolean hasCompletedThisCategory = testDriveRepository.findByUserId(req.getUserId())
            .stream()
            .anyMatch(td -> "DONE".equals(td.getStatus()) && 
                           td.getCategory() != null && 
                           td.getCategory().getId() == req.getCategoryId());
        
        if (hasCompletedThisCategory) {
            throw new IllegalArgumentException("Bạn đã lái thử mẫu xe '" + category.getName() + "' thành công rồi. Vui lòng chọn mẫu xe khác.");
        }
        
        // All validations passed, create test drive (product and escortStaff will be set later by dealer staff)
        TestDrive testDrive = new TestDrive();
        testDrive.setUser(user);
        testDrive.setDealer(dealer);
        testDrive.setCategory(category);
        testDrive.setProductModelName(req.getProductModelName());
        testDrive.setScheduleDate(scheduleDateTime);
        testDrive.setStatus("PENDING");
        testDrive.setNotes(req.getNotes());
        // Product and escortStaff will be null until dealer staff assigns them
        
        TestDrive savedTestDrive = testDriveRepository.save(testDrive);
        
        // Send confirmation email
        try {
            sendConfirmationEmail(savedTestDrive);
        } catch (Exception e) {
            // Log error but don't fail the creation
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
        
        return convertToRes(savedTestDrive);
    }

    public TestDriveRes updateTestDrive(int id, TestDriveReq req) {
        // 1️⃣ Validate test drive exists
        TestDrive existingTestDrive = testDriveRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu lái thử với ID: " + id));
        
        String oldStatus = existingTestDrive.getStatus();
        
        // 2️⃣ Validate status transition
        if (req.getStatus() != null && !req.getStatus().equals(oldStatus)) {
            validateStatusTransition(oldStatus, req.getStatus());
        }
        
        // 3️⃣ If changing schedule date, validate it
        if (req.getScheduleDate() != null && !req.getScheduleDate().equals(existingTestDrive.getScheduleDate())) {
            java.time.LocalDateTime newDateTime = req.getScheduleDate();
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            
            if (newDateTime.isBefore(now)) {
                throw new IllegalArgumentException("Không thể đổi lịch sang thời gian trong quá khứ");
            }
            
            // Check conflicts if changing schedule
            java.time.LocalDateTime startTime = newDateTime.minusHours(2);
            java.time.LocalDateTime endTime = newDateTime.plusHours(2);
            
            List<TestDrive> conflicts = testDriveRepository.findConflictingTestDrives(
                existingTestDrive.getProduct().getId(), startTime, endTime
            );
            
            // Remove self from conflicts
            conflicts = conflicts.stream()
                .filter(td -> td.getId() != id)
                .toList();
            
            if (!conflicts.isEmpty()) {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                String conflictTime = conflicts.get(0).getScheduleDate().format(formatter);
                throw new IllegalArgumentException(
                    "Thời gian mới bị trùng với lịch khác vào lúc " + conflictTime + ". Vui lòng chọn thời gian khác."
                );
            }
            
            existingTestDrive.setScheduleDate(newDateTime);
        }
        
        // 4️⃣ Update other fields
        if (req.getStatus() != null) {
            existingTestDrive.setStatus(req.getStatus());
        }
        
        if (req.getNotes() != null) {
            existingTestDrive.setNotes(req.getNotes());
        }
        
        if (req.getSpecificVIN() != null) {
            existingTestDrive.setSpecificVIN(req.getSpecificVIN());
        }
        
        TestDrive updatedTestDrive = testDriveRepository.save(existingTestDrive);
        
        // Send status update email if status changed
        if (req.getStatus() != null && !req.getStatus().equals(oldStatus)) {
            try {
                sendStatusUpdateEmail(updatedTestDrive, oldStatus);
            } catch (Exception e) {
                System.err.println("Failed to send status update email: " + e.getMessage());
            }
        }
        
        return convertToRes(updatedTestDrive);
    }
    
    // Helper method to validate status transitions
    private void validateStatusTransition(String oldStatus, String newStatus) {
        // Status flow: PENDING → ASSIGNING → APPROVED → IN_PROGRESS → DONE
        // Can also: PENDING → REJECTED, any → CANCELLED
        
        // Terminal states cannot be changed
        if ("REJECTED".equals(oldStatus) || "CANCELLED".equals(oldStatus) || "DONE".equals(oldStatus)) {
            throw new IllegalArgumentException("Không thể thay đổi trạng thái của yêu cầu đã " + 
                getStatusLabel(oldStatus));
        }
        
        // PENDING can transition to: ASSIGNING, REJECTED, CANCELLED
        if ("PENDING".equals(oldStatus)) {
            if (!("ASSIGNING".equals(newStatus) || "REJECTED".equals(newStatus) || "CANCELLED".equals(newStatus))) {
                throw new IllegalArgumentException("Chỉ có thể chuyển từ 'Chờ xác nhận' sang 'Đang chờ phân công', 'Đã từ chối' hoặc 'Đã hủy'");
            }
        }
        
        // ASSIGNING can transition to: APPROVED, CANCELLED
        if ("ASSIGNING".equals(oldStatus)) {
            if (!("APPROVED".equals(newStatus) || "CANCELLED".equals(newStatus))) {
                throw new IllegalArgumentException("Chỉ có thể chuyển từ 'Đang chờ phân công' sang 'Đã phê duyệt' hoặc 'Đã hủy'");
            }
        }
        
        // APPROVED can transition to: IN_PROGRESS, CANCELLED
        if ("APPROVED".equals(oldStatus)) {
            if (!("IN_PROGRESS".equals(newStatus) || "CANCELLED".equals(newStatus))) {
                throw new IllegalArgumentException("Chỉ có thể chuyển từ 'Đã phê duyệt' sang 'Đang thực hiện' hoặc 'Đã hủy'");
            }
        }
        
        // IN_PROGRESS can transition to: DONE, CANCELLED
        if ("IN_PROGRESS".equals(oldStatus)) {
            if (!("DONE".equals(newStatus) || "CANCELLED".equals(newStatus))) {
                throw new IllegalArgumentException("Chỉ có thể chuyển từ 'Đang thực hiện' sang 'Hoàn thành' hoặc 'Đã hủy'");
            }
        }
    }
    
    // Helper method to get Vietnamese status label
    private String getStatusLabel(String status) {
        return switch (status) {
            case "PENDING" -> "Chờ xác nhận";
            case "ASSIGNING" -> "Đang chờ phân công";
            case "APPROVED" -> "Đã phê duyệt";
            case "IN_PROGRESS" -> "Đang thực hiện";
            case "DONE" -> "Hoàn thành";
            case "REJECTED" -> "Đã từ chối";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }
    
    /**
     * Step 2: Dealer staff assigns vehicle to a pending test drive request
     */
    public TestDriveRes assignVehicleAndStaff(int testDriveId, int productId, int escortStaffId) {
        // 1️⃣ Validate test drive exists and is PENDING or ASSIGNING
        TestDrive testDrive = testDriveRepository.findById(testDriveId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu lái thử với ID: " + testDriveId));
        
        if (!"PENDING".equals(testDrive.getStatus()) && !"ASSIGNING".equals(testDrive.getStatus())) {
            throw new IllegalArgumentException("Chỉ có thể phân công xe cho yêu cầu đang ở trạng thái 'Chờ xác nhận' hoặc 'Đang chờ phân công'");
        }
        
        // 2️⃣ Validate Product exists and matches category
        if (productId <= 0) {
            throw new IllegalArgumentException("ID sản phẩm không hợp lệ");
        }
        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy xe với ID: " + productId));
        
        // ❌ REMOVED: No longer check TEST_DRIVE status - allow any vehicle to be assigned
        // if (!"TEST_DRIVE".equals(product.getStatus())) {
        //     throw new IllegalArgumentException("Xe '" + product.getName() + "' hiện không khả dụng cho lái thử. Vui lòng chọn xe khác.");
        // }
        
        // Validate product belongs to the requested category
        if (product.getCategory().getId() != testDrive.getCategory().getId()) {
            throw new IllegalArgumentException("Xe '" + product.getName() + "' không thuộc mẫu xe '" + testDrive.getCategory().getName() + "' mà khách hàng đã chọn");
        }
        
        // 3️⃣ Check for conflicting bookings (same product, same time slot ±2 hours)
        java.time.LocalDateTime scheduleDateTime = testDrive.getScheduleDate();
        java.time.LocalDateTime startTime = scheduleDateTime.minusHours(2);
        java.time.LocalDateTime endTime = scheduleDateTime.plusHours(2);
        
        List<TestDrive> conflicts = testDriveRepository.findConflictingTestDrives(
            productId, startTime, endTime
        );
        
        if (!conflicts.isEmpty()) {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String conflictTime = conflicts.get(0).getScheduleDate().format(formatter);
            throw new IllegalArgumentException(
                "Xe này đã có người đặt lịch trong thời gian này. Vui lòng chọn xe khác hoặc đổi ngày."
            );
        }
        
        // All validations passed, assign vehicle and escort staff
        testDrive.setProduct(product);
        testDrive.setSpecificVIN(product.getVinNum());
        
        // Assign escort staff if provided
        if (escortStaffId > 0) {
            Optional<User> escortStaff = userRepo.findById(escortStaffId);
            if (escortStaff.isPresent()) {
                testDrive.setEscortStaff(escortStaff.get());
            } else {
                throw new IllegalArgumentException("Không tìm thấy nhân viên hộ tống với ID: " + escortStaffId);
            }
        }
        
        testDrive.setStatus("APPROVED"); // Auto-approve when assigned
        
        TestDrive savedTestDrive = testDriveRepository.save(testDrive);
        
        // Send confirmation email about the assignment
        try {
            sendAssignmentEmail(savedTestDrive);
        } catch (Exception e) {
            System.err.println("Failed to send assignment email: " + e.getMessage());
        }
        
        return convertToRes(savedTestDrive);
    }
    
    // Placeholder for sending assignment confirmation email
    private void sendAssignmentEmail(TestDrive testDrive) {
        // TODO: Implement email sending logic
        System.out.println("Sending assignment email for test drive ID: " + testDrive.getId());
    }

    public boolean deleteTestDrive(int id) {
        if (testDriveRepository.findById(id).isPresent()) {
            testDriveRepository.deleteById(id);
            return true;
        }
        return false;
    }

    //method refference: object::method 
    //tham chiếu đến một phương thức của object và sử dụng nó như một biểu thức lambda.
    //không cần thêm logic
    private TestDrive convertToEntity(TestDrive testDrive, TestDriveReq req) {
        if (testDrive != null || req != null) {
            if (req.getScheduleDate() != null) {
                testDrive.setScheduleDate(req.getScheduleDate());
            }
            if (req.getStatus() != null) {
                testDrive.setStatus(req.getStatus());
            }
            if (req.getNotes() != null) {
                testDrive.setNotes(req.getNotes());
            }
            if (req.getSpecificVIN() != null && !req.getSpecificVIN().isEmpty()) {
                testDrive.setSpecificVIN(req.getSpecificVIN());
            }
            if (req.getUserId() > 0){
                Optional<User> user = userRepo.findById(req.getUserId());
                if (user.isPresent()) {
                    testDrive.setUser(user.orElse(null));
                    user.get().getTestDrives().add(testDrive);
                }
            }
            if (req.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
                if (dealer.isPresent()) {
                    testDrive.setDealer(dealer.get());
                    dealer.get().getTestDrives().add(testDrive);
                }
            }
            if (req.getProductId() > 0){
                Optional<Product> product = productRepo.findById(req.getProductId());
                if (product.isPresent()) {
                    if (product.get().getStatus().equals(ProductStatus.TEST_DRIVE)){
                        testDrive.setProduct(product.get());
                    }
                }
            }
            return testDrive;
        }
        return null;
    }

    //lambda expression: (parameters) -> expression
    //cần thêm logic VD: user.getId()
    private TestDriveRes convertToRes(TestDrive testDrive) {
        TestDriveRes res = new TestDriveRes();
        if (testDrive != null) {
            res.setId(testDrive.getId());
            if (testDrive.getScheduleDate() != null) {
                res.setScheduleDate(testDrive.getScheduleDate());
            }
            if (testDrive.getStatus() != null) {
                res.setStatus(testDrive.getStatus());
            }
            if (testDrive.getNotes() != null) {
                res.setNotes(testDrive.getNotes());
            }
            if (testDrive.getSpecificVIN() != null) {
                res.setSpecificVIN(testDrive.getSpecificVIN());
            }
            if (testDrive.getProductModelName() != null) {
                res.setProductModelName(testDrive.getProductModelName());
            }
            if (testDrive.getUser() != null) {
                Optional<User> user = userRepo.findById(testDrive.getUser().getId());
                if (user.isPresent()){
                    UserRes userRes = userService.converttoRes(user.get());
                    res.setUser(userRes);
                }
            }
            if (testDrive.getDealer() != null) {
                Optional<Dealer> dealer = dealerRepo.findById(testDrive.getDealer().getId());
                if (dealer.isPresent()){
                    DealerRes dealerRes = dealerService.converttoRes(dealer.get());
                    res.setDealer(dealerRes);
                    res.setLocation(dealerRes.getAddress());
                }
            }
            if (testDrive.getCategory() != null) {
                res.setCategoryName(testDrive.getCategory().getName());
            }
            if (testDrive.getProduct() != null) {
                Optional<Product> product = productRepo.findById(testDrive.getProduct().getId());
                if (product.isPresent()){
                    res.setProductName(product.get().getName());
                }
            }
            if (testDrive.getEscortStaff() != null) {
                Optional<User> staff = userRepo.findById(testDrive.getEscortStaff().getId());
                if (staff.isPresent()){
                    UserRes staffRes = userService.convertUsertoUserRes(staff.get());
                    res.setEscortStaff(staffRes);
                }
            }
            return res;
        }
        return null;
    }

    // Check availability for a specific time
    public com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailabilityCheckRes checkAvailability(
            int productId, java.time.LocalDateTime scheduleDate, int durationHours) {
        
        java.time.LocalDateTime startTime = scheduleDate.minusHours(durationHours);
        java.time.LocalDateTime endTime = scheduleDate.plusHours(durationHours);
        
        List<TestDrive> conflicts = testDriveRepository.findConflictingTestDrives(
            productId, startTime, endTime
        );
        
        com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailabilityCheckRes response = 
            new com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailabilityCheckRes();
        
        if (conflicts.isEmpty()) {
            response.setAvailable(true);
            response.setMessage("Xe khả dụng cho thời gian này");
        } else {
            response.setAvailable(false);
            response.setMessage("Xe đã được đặt trong khung giờ này");
            
            List<com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailabilityCheckRes.ConflictingBooking> bookings = 
                conflicts.stream().map(td -> {
                    String customerName = td.getUser() != null ? td.getUser().getUsername() : "Unknown";
                    return new com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailabilityCheckRes.ConflictingBooking(
                        td.getId(),
                        td.getScheduleDate().toString(),
                        customerName
                    );
                }).toList();
            
            response.setConflictingBookings(bookings);
        }
        
        return response;
    }

    // Get available time slots for a specific date
    public com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailableSlotsRes getAvailableSlots(
            int productId, String dateStr) {
        
        try {
            java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
            java.time.LocalDateTime dateTime = date.atStartOfDay();
            
            // Get all test drives for this product on this date
            List<TestDrive> bookedSlots = testDriveRepository.findByProductAndDate(productId, dateTime);
            
            // Define time slots (8AM - 6PM, 2 hour slots)
            List<com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailableSlotsRes.TimeSlot> slots = new java.util.ArrayList<>();
            
            for (int hour = 8; hour < 18; hour += 2) {
                java.time.LocalDateTime slotStart = date.atTime(hour, 0);
                java.time.LocalDateTime slotEnd = slotStart.plusHours(2);
                
                // Check if this slot is booked
                boolean isBooked = bookedSlots.stream().anyMatch(td -> {
                    java.time.LocalDateTime tdTime = td.getScheduleDate();
                    return !tdTime.isBefore(slotStart) && tdTime.isBefore(slotEnd);
                });
                
                String label = String.format("%02d:00 - %02d:00", hour, hour + 2);
                slots.add(new com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailableSlotsRes.TimeSlot(
                    slotStart.toString(),
                    slotEnd.toString(),
                    !isBooked,
                    label
                ));
            }
            
            return new com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailableSlotsRes(dateStr, slots);
            
        } catch (Exception e) {
            return new com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailableSlotsRes(dateStr, new java.util.ArrayList<>());
        }
    }

    // Helper method to send confirmation email
    private void sendConfirmationEmail(TestDrive testDrive) {
        if (testDrive.getUser() == null || testDrive.getUser().getEmail() == null) {
            return;
        }
        
        String customerEmail = testDrive.getUser().getEmail();
        String customerName = testDrive.getUser().getUsername();
        
        // Use category name instead of product name (product is assigned later by staff)
        String vehicleInfo = testDrive.getProduct() != null 
            ? testDrive.getProduct().getName() 
            : (testDrive.getCategory() != null ? testDrive.getCategory().getName() : "Xe điện");
            
        String dealerName = testDrive.getDealer() != null ? testDrive.getDealer().getName() : "Unknown";
        
        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
        
        String scheduleDate = testDrive.getScheduleDate().format(dateFormatter);
        String scheduleTime = testDrive.getScheduleDate().format(timeFormatter);
        
        emailService.sendTestDriveConfirmation(
            customerEmail,
            customerName,
            vehicleInfo,
            dealerName,
            scheduleDate,
            scheduleTime
        );
    }
    
    // Helper method to send status update email
    private void sendStatusUpdateEmail(TestDrive testDrive, String oldStatus) {
        if (testDrive.getUser() == null || testDrive.getUser().getEmail() == null) {
            return;
        }
        
        String customerEmail = testDrive.getUser().getEmail();
        String customerName = testDrive.getUser().getUsername();
        
        // Use category name if product not assigned yet
        String vehicleInfo = testDrive.getProduct() != null 
            ? testDrive.getProduct().getName() 
            : (testDrive.getCategory() != null ? testDrive.getCategory().getName() : "Xe điện");
            
        String status = testDrive.getStatus();
        String notes = testDrive.getNotes();
        
        emailService.sendTestDriveStatusUpdate(
            customerEmail,
            customerName,
            vehicleInfo,
            status,
            notes
        );
    }

    /**
     * Generate ICS (iCalendar) file content for a test drive
     * @param testDriveId The ID of the test drive
     * @return ICS file content as string
     */
    public String generateIcsFile(int testDriveId) {
        TestDrive testDrive = testDriveRepository.findById(testDriveId)
            .orElseThrow(() -> new RuntimeException("TestDrive not found with id: " + testDriveId));
        
        // Use category name if product not assigned yet
        String vehicleName = testDrive.getProduct() != null 
            ? testDrive.getProduct().getName() 
            : (testDrive.getCategory() != null ? testDrive.getCategory().getName() : "Test Drive");
            
        String dealerName = testDrive.getDealer() != null ? testDrive.getDealer().getName() : "";
        String dealerAddress = testDrive.getDealer() != null ? testDrive.getDealer().getAddress() : "";
        String description = testDrive.getNotes() != null ? testDrive.getNotes() : "";
        
        // Format datetime for ICS (yyyyMMdd'T'HHmmss)
        java.time.format.DateTimeFormatter icsFormatter = 
            java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
        
        java.time.LocalDateTime startTime = testDrive.getScheduleDate();
        java.time.LocalDateTime endTime = startTime.plusHours(2); // Default 2 hour duration
        
        String startTimeStr = startTime.format(icsFormatter);
        String endTimeStr = endTime.format(icsFormatter);
        
        // Generate unique ID for the event
        String uid = "testdrive-" + testDriveId + "@evdm.com";
        
        // Current timestamp for DTSTAMP
        String now = java.time.LocalDateTime.now().format(icsFormatter);
        
        // Build ICS content
        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//EVDM//Test Drive Calendar//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:PUBLISH\r\n");
        ics.append("X-WR-CALNAME:EVDM Test Drive\r\n");
        ics.append("X-WR-TIMEZONE:Asia/Ho_Chi_Minh\r\n");
        
        ics.append("BEGIN:VEVENT\r\n");
        ics.append("UID:").append(uid).append("\r\n");
        ics.append("DTSTAMP:").append(now).append("\r\n");
        ics.append("DTSTART:").append(startTimeStr).append("\r\n");
        ics.append("DTEND:").append(endTimeStr).append("\r\n");
        ics.append("SUMMARY:").append(escapeIcsText("Lái thử " + vehicleName)).append("\r\n");
        ics.append("LOCATION:").append(escapeIcsText(dealerName + ", " + dealerAddress)).append("\r\n");
        
        // Build description with details
        StringBuilder desc = new StringBuilder();
        desc.append("Lái thử xe: ").append(vehicleName).append("\\n");
        desc.append("Đại lý: ").append(dealerName).append("\\n");
        desc.append("Địa chỉ: ").append(dealerAddress).append("\\n");
        if (!description.isEmpty()) {
            desc.append("Ghi chú: ").append(description).append("\\n");
        }
        desc.append("\\nTrạng thái: ").append(testDrive.getStatus());
        
        ics.append("DESCRIPTION:").append(escapeIcsText(desc.toString())).append("\r\n");
        ics.append("STATUS:CONFIRMED\r\n");
        ics.append("SEQUENCE:0\r\n");
        
        // Add reminder (30 minutes before)
        ics.append("BEGIN:VALARM\r\n");
        ics.append("TRIGGER:-PT30M\r\n");
        ics.append("ACTION:DISPLAY\r\n");
        ics.append("DESCRIPTION:Nhắc nhở: Lái thử ").append(vehicleName).append(" sau 30 phút nữa\r\n");
        ics.append("END:VALARM\r\n");
        
        ics.append("END:VEVENT\r\n");
        ics.append("END:VCALENDAR\r\n");
        
        return ics.toString();
    }
    
    /**
     * Escape special characters in ICS text fields
     */
    private String escapeIcsText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace(",", "\\,")
                   .replace(";", "\\;")
                   .replace("\n", "\\n")
                   .replace("\r", "");
    }

}
