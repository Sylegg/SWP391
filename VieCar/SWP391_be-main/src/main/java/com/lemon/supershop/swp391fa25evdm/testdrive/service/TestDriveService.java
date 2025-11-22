package com.lemon.supershop.swp391fa25evdm.testdrive.service;

import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.service.DealerService;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.email.service.EmailService;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailabilityCheckRes;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.AvailableSlotsRes;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.service.UserService;
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
    private CategoryRepository categoryRepository;
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
        
        // 2️⃣ Validate Dealer exists
        if (req.getDealerId() <= 0) {
            throw new IllegalArgumentException("ID đại lý không hợp lệ");
        }
        Dealer dealer = dealerRepo.findById(req.getDealerId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đại lý với ID: " + req.getDealerId()));
        
        // 3️⃣ Validate Category exists
        if (req.getCategoryId() <= 0) {
            throw new IllegalArgumentException("Vui lòng chọn mẫu xe muốn lái thử");
        }
        Category category = categoryRepository.findById(req.getCategoryId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mẫu xe với ID: " + req.getCategoryId()));
        
        // 4️⃣ Validate Schedule Date
        if (req.getScheduleDate() == null) {
            throw new IllegalArgumentException("Vui lòng chọn ngày và giờ lái thử");
        }
        java.time.LocalDateTime scheduleDateTime = req.getScheduleDate();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (scheduleDateTime.isBefore(now)) {
            throw new IllegalArgumentException("Không thể đặt lịch lái thử trong quá khứ");
        }
        
        // 5️⃣ Check if user already has an active test drive
        List<TestDrive> activeTestDrives = testDriveRepository.findByUserId(req.getUserId())
            .stream()
            .filter(td -> !"DONE".equals(td.getStatus()) && !"REJECTED".equals(td.getStatus()) && !"CANCELLED".equals(td.getStatus()))
            .toList();
        if (!activeTestDrives.isEmpty()) {
            throw new IllegalArgumentException("Bạn chỉ có thể đặt 1 lịch lái thử tại một thời điểm. Vui lòng hoàn thành hoặc hủy lịch hiện tại trước.");
        }
        
        // 6️⃣ Count completed attempts for this category
        long completedAttempts = testDriveRepository.findByUserId(req.getUserId())
            .stream()
            .filter(td -> "DONE".equals(td.getStatus()) &&
                    td.getCategory() != null &&
                    td.getCategory().getId() == req.getCategoryId())
            .count();
        
        // 7️⃣ Create new TestDrive
        TestDrive testDrive = new TestDrive();
        testDrive.setUser(user);
        testDrive.setDealer(dealer);
        testDrive.setCategory(category);
        testDrive.setScheduleDate(scheduleDateTime);
        testDrive.setStatus("PENDING");
        testDrive.setNotes(req.getNotes());
        testDrive.setProductModelName(req.getProductModelName());
        testDrive.setAttemptNumber((int) completedAttempts + 1);
        
        TestDrive savedTestDrive = testDriveRepository.save(testDrive);
        
<<<<<<< HEAD
        // Không gửi email ngay - chờ staff xác nhận
        // Email sẽ được gửi khi staff confirm (PENDING → ASSIGNING)
=======
        // Send confirmation email
        try {
            sendConfirmationEmail(savedTestDrive);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
        
        return convertToRes(savedTestDrive);
    }

    public TestDriveRes updateTestDrive(int id, TestDriveReq req) {
        Optional<TestDrive> testDrive = testDriveRepository.findById(id);
        if (testDrive.isPresent()) {
            String oldStatus = testDrive.get().getStatus();
            TestDrive testDrive1 = convertToEntity(testDrive.orElse(null), req);
            testDriveRepository.save(testDrive1);

            // Send status update email if status changed
            if (req.getStatus() != null && !req.getStatus().equals(oldStatus)) {
                try {
<<<<<<< HEAD
                    // Gửi email xác nhận khi staff confirm đơn (PENDING → ASSIGNING)
                    if ("ASSIGNING".equals(req.getStatus()) && "PENDING".equals(oldStatus)) {
                        sendConfirmationEmail(testDrive1);
                    } else {
                        sendStatusUpdateEmail(testDrive1, oldStatus);
                    }
=======
                    sendStatusUpdateEmail(testDrive1, oldStatus);
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
                    
                    // Log notification when staff starts test drive (status → IN_PROGRESS)
                    if ("IN_PROGRESS".equals(req.getStatus())) {
                        String staffName = testDrive1.getEscortStaff() != null ? 
                            testDrive1.getEscortStaff().getUsername() : "Nhân viên";
                        String customerName = testDrive1.getUser() != null ? 
                            testDrive1.getUser().getUsername() : "khách hàng";
                        String vehicleName = testDrive1.getProduct() != null ? 
                            testDrive1.getProduct().getName() : "xe";
                        
                        System.out.println("🚗 [TEST DRIVE STARTED] " + 
                            staffName + " đang đi cùng " + customerName + 
                            " lái thử " + vehicleName + 
                            " (Đơn #" + testDrive1.getId() + ")");
                        
                        // TODO: Gửi notification đến dealer manager qua WebSocket/SSE
                        // notificationService.notifyDealerManager(testDrive1.getDealer().getId(), ...);
                    }
                    
                    // Log when test drive completes (status → DONE)
                    if ("DONE".equals(req.getStatus())) {
                        String staffName = testDrive1.getEscortStaff() != null ? 
                            testDrive1.getEscortStaff().getUsername() : "Nhân viên";
                        System.out.println("✅ [TEST DRIVE COMPLETED] " + 
                            staffName + " đã hoàn thành lái thử (Đơn #" + testDrive1.getId() + ")");
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send status update email: " + e.getMessage());
                }
            }
            return convertToRes(testDrive1);
        }
        return null;
    }

    public TestDriveRes assignVehicleAndStaff(int testDriveId, int productId, int escortStaffId) {
        TestDrive testDrive = testDriveRepository.findById(testDriveId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu lái thử với ID: " + testDriveId));

<<<<<<< HEAD
        // Chỉ cho phép assign khi ở trạng thái ASSIGNING (đã được confirm)
        if (!("ASSIGNING".equals(testDrive.getStatus()))) {
            throw new IllegalArgumentException("Chỉ có thể phân công xe cho yêu cầu đang ở trạng thái 'Đang chờ phân công'. Vui lòng xác nhận đơn trước.");
=======
        if (!"PENDING".equals(testDrive.getStatus()) && !"ASSIGNING".equals(testDrive.getStatus())) {
            throw new IllegalArgumentException("Chỉ có thể phân công xe cho yêu cầu đang ở trạng thái 'Chờ xác nhận' hoặc 'Đang chờ phân công'");
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
        }

        // Check for conflicting bookings BEFORE assigning product
        // (same product, same time slot ±1 minute, exclude current test drive)
        if (productId > 0) {
            java.time.LocalDateTime scheduleDateTime = testDrive.getScheduleDate();
            java.time.LocalDateTime startTime = scheduleDateTime.minusMinutes(1);
            java.time.LocalDateTime endTime = scheduleDateTime.plusMinutes(1);

            List<TestDrive> allConflicts = testDriveRepository.findConflictingTestDrives(
                    productId, startTime, endTime
            );
            
            System.out.println("🔍 [CONFLICT CHECK] Product ID: " + productId + 
                    ", Schedule: " + scheduleDateTime + 
                    ", Range: " + startTime + " to " + endTime);
            System.out.println("🔍 [CONFLICT CHECK] Found " + allConflicts.size() + " potential conflicts");
            
            List<TestDrive> conflicts = allConflicts.stream()
                    .filter(td -> td.getId() != testDriveId) // Exclude current test drive
                    .toList();
            
            System.out.println("🔍 [CONFLICT CHECK] After excluding current TD #" + testDriveId + 
                    ": " + conflicts.size() + " conflicts");
            
            if (!conflicts.isEmpty()) {
                TestDrive conflictTD = conflicts.get(0);
                System.out.println("❌ [CONFLICT] Test Drive #" + conflictTD.getId() + 
                        ", Status: " + conflictTD.getStatus() + 
                        ", Schedule: " + conflictTD.getScheduleDate());
                
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                String conflictTime = conflictTD.getScheduleDate().format(formatter);
                throw new IllegalArgumentException(
                        "Xe này đã có người đặt lịch trong thời gian này (Đơn #" + conflictTD.getId() + 
                        " - " + conflictTime + "). Vui lòng chọn xe khác hoặc đổi ngày."
                );
            }
            
            System.out.println("✅ [CONFLICT CHECK] No conflicts found, proceeding with assignment");
            
            // If no conflict, assign the product
            Optional<Product> product = productRepo.findById(productId);
            if (product.isPresent()) {
                // Validate product belongs to the requested category
                if (product.get().getCategory().getId() != testDrive.getCategory().getId()) {
                    throw new IllegalArgumentException("Xe '" + product.get().getName() + "' không thuộc mẫu xe '" + testDrive.getCategory().getName() + "' mà khách hàng đã chọn");
                }
                
                // Validate product status is TEST_DRIVE
                if (!product.get().getStatus().equals(ProductStatus.TEST_DRIVE)){
                    throw new IllegalArgumentException("Xe '" + product.get().getName() + "' không có trạng thái 'Lái thử'. Trạng thái hiện tại: " + product.get().getStatus());
                }
                
                // Assign product
                testDrive.setProduct(product.get());
                testDrive.setSpecificVIN(product.get().getVinNum());
            } else {
                throw new IllegalArgumentException("Không tìm thấy xe với ID: " + productId);
            }
        }

        if (escortStaffId > 0) {
            Optional<User> escortStaff = userRepo.findById(escortStaffId);
            if (escortStaff.isPresent()) {
                // Check if staff is currently busy with another test drive
                List<TestDrive> staffActiveTestDrives = testDriveRepository.findAll().stream()
                    .filter(td -> td.getEscortStaff() != null && 
                                  td.getEscortStaff().getId() == escortStaffId &&
                                  "IN_PROGRESS".equals(td.getStatus()))
                    .toList();
                
                if (!staffActiveTestDrives.isEmpty()) {
                    TestDrive activeTD = staffActiveTestDrives.get(0);
                    String customerName = activeTD.getUser() != null ? activeTD.getUser().getUsername() : "khách hàng";
                    throw new IllegalArgumentException(
                        "Nhân viên " + escortStaff.get().getUsername() + 
                        " đang bận đi cùng " + customerName + 
                        " (đơn #" + activeTD.getId() + "). Vui lòng đợi hoàn thành hoặc chọn nhân viên khác."
                    );
                }
                
                testDrive.setEscortStaff(escortStaff.get());
                testDrive.setStatus("APPROVED"); // Auto-approve when assigned
            } else {
                throw new IllegalArgumentException("Không tìm thấy nhân viên hộ tống với ID: " + escortStaffId);
            }
        }
        TestDrive savedTestDrive = testDriveRepository.save(testDrive);

<<<<<<< HEAD
        // Send assignment email to customer
        try {
            sendAssignmentEmail(savedTestDrive);
        } catch (Exception e) {
            System.err.println("Failed to send assignment email: " + e.getMessage());
        }
=======
//        // Send confirmation email about the assignment
//        try {
//            sendAssignmentEmail(savedTestDrive);
//        } catch (Exception e) {
//            System.err.println("Failed to send assignment email: " + e.getMessage());
//        }
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca

        return convertToRes(savedTestDrive);
    }

    // Check availability for a specific time
    public AvailabilityCheckRes checkAvailability(
            int productId, java.time.LocalDateTime scheduleDate, int durationHours) {

        java.time.LocalDateTime startTime = scheduleDate.minusHours(durationHours);
        java.time.LocalDateTime endTime = scheduleDate.plusHours(durationHours);

        List<TestDrive> conflicts = testDriveRepository.findConflictingTestDrives(
                productId, startTime, endTime
        );

        AvailabilityCheckRes response =
                new AvailabilityCheckRes();

        if (conflicts.isEmpty()) {
            response.setAvailable(true);
            response.setMessage("Xe khả dụng cho thời gian này");
        } else {
            response.setAvailable(false);
            response.setMessage("Xe đã được đặt trong khung giờ này");

            List<AvailabilityCheckRes.ConflictingBooking> bookings =
                    conflicts.stream().map(td -> {
                        String customerName = td.getUser() != null ? td.getUser().getUsername() : "Unknown";
                        return new AvailabilityCheckRes.ConflictingBooking(
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
    public AvailableSlotsRes getAvailableSlots(
            int productId, String dateStr) {

        try {
            java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
            java.time.LocalDateTime dateTime = date.atStartOfDay();

            // Get all test drives for this product on this date
            List<TestDrive> bookedSlots = testDriveRepository.findByProductAndDate(productId, dateTime);

            // Define time slots (8AM - 6PM, 2 hour slots)
            List<AvailableSlotsRes.TimeSlot> slots = new java.util.ArrayList<>();

            for (int hour = 8; hour < 18; hour += 2) {
                java.time.LocalDateTime slotStart = date.atTime(hour, 0);
                java.time.LocalDateTime slotEnd = slotStart.plusHours(2);

                // Check if this slot is booked
                boolean isBooked = bookedSlots.stream().anyMatch(td -> {
                    java.time.LocalDateTime tdTime = td.getScheduleDate();
                    return !tdTime.isBefore(slotStart) && tdTime.isBefore(slotEnd);
                });

                String label = String.format("%02d:00 - %02d:00", hour, hour + 2);
                slots.add(new AvailableSlotsRes.TimeSlot(
                        slotStart.toString(),
                        slotEnd.toString(),
                        !isBooked,
                        label
                ));
            }

            return new AvailableSlotsRes(dateStr, slots);

        } catch (Exception e) {
            return new AvailableSlotsRes(dateStr, new java.util.ArrayList<>());
        }
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
        if (testDrive == null || req == null) {
            return null;
        }

        // Update status (with validation if changing)
        if (req.getStatus() != null) {
            String oldStatus = testDrive.getStatus();
            if (oldStatus != null && !req.getStatus().equals(oldStatus)) {
                validateStatusTransition(oldStatus, req.getStatus());
            }
            testDrive.setStatus(req.getStatus());
        }

        // Update notes if provided
        if (req.getNotes() != null) {
            testDrive.setNotes(req.getNotes());
        }

<<<<<<< HEAD
        // Update user - only if provided (skip if 0 or negative)
=======
        // Update user - only if provided and not already set
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
        if (req.getUserId() > 0) {
            Optional<User> user = userRepo.findById(req.getUserId());
            if (user.isPresent()) {
                testDrive.setUser(user.get());
            } else {
                throw new IllegalArgumentException("ID người dùng không hợp lệ");
            }
        }
<<<<<<< HEAD
        // Don't update if not provided (userId = 0 means skip)

        // Update dealer - only if provided (skip if 0 or negative)
=======

        // Update dealer - only if provided and not already set
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
        if (req.getDealerId() > 0) {
            Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
            if (dealer.isPresent()) {
                testDrive.setDealer(dealer.get());
            } else {
                throw new IllegalArgumentException("ID đại lý không hợp lệ");
            }
        }
<<<<<<< HEAD
        // Don't update if not provided (dealerId = 0 means skip)

        // Update category - only if provided (skip if 0 or negative)
=======

        // Update category - only if provided
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
        if (req.getCategoryId() > 0) {
            Optional<Category> category = categoryRepository.findById(req.getCategoryId());
            if (category.isPresent()) {
                testDrive.setCategory(category.get());
            } else {
                throw new IllegalArgumentException("Vui lòng chọn mẫu xe muốn lái thử");
            }
        }
<<<<<<< HEAD
        // Don't update if not provided (categoryId = 0 means skip)
=======
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca

        // Update schedule date - only if provided
        if (req.getScheduleDate() != null) {
            java.time.LocalDateTime scheduleDateTime = req.getScheduleDate();
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if (scheduleDateTime.isBefore(now)) {
                throw new IllegalArgumentException("Không thể đặt lịch lái thử trong quá khứ");
            }
            testDrive.setScheduleDate(scheduleDateTime);
        }

        // Update product model name if provided
        if (req.getProductModelName() != null) {
            testDrive.setProductModelName(req.getProductModelName());
        }

        // Update product if provided
        if (req.getProductId() > 0) {
            Optional<Product> product = productRepo.findById(req.getProductId());
            if (product.isPresent()) {
                testDrive.setProduct(product.get());
                testDrive.setSpecificVIN(product.get().getVinNum());
            }
        }

        // Update escort staff if provided
        if (req.getEscortStaffId() > 0) {
            Optional<User> escortStaff = userRepo.findById(req.getEscortStaffId());
            if (escortStaff.isPresent()) {
                testDrive.setEscortStaff(escortStaff.get());
            }
        }
        
        return testDrive;
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
            if (testDrive.getUser() != null) {
                Optional<User> user = userRepo.findById(testDrive.getUser().getId());
                if (user.isPresent()){
                    UserRes userRes = userService.convertUsertoUserRes(user.get());
                    res.setUser(userRes);
                }
            }
            if (testDrive.getDealer() != null) {
                Optional<Dealer> dealer = dealerRepo.findById(testDrive.getDealer().getId());
                if (dealer.isPresent()){
                    DealerRes dealerRes = dealerService.convertDealertoDealerRes(dealer.get());
                    res.setDealer(dealerRes);
                    res.setLocation(dealerRes.getAddress());
                }
            }
            if (testDrive.getProduct() != null) {
                Optional<Product> product = productRepo.findById(testDrive.getProduct().getId());
                if (product.isPresent()){
                    res.setProductId(product.get().getId());
                    res.setProductName(product.get().getName());
                }
            }
            if (testDrive.getProductModelName() != null) {
                res.setProductModelName(testDrive.getProductModelName());
            }
            if (testDrive.getCategory() != null){
                res.setCategoryId(testDrive.getCategory().getId());
                res.setCategoryName(testDrive.getCategory().getName());
            }
            if (testDrive.getEscortStaff() != null) {
                Optional<User> escort = userRepo.findById(testDrive.getEscortStaff().getId());
                if (escort.isPresent()){
                    UserRes escortRes = userService.convertUsertoUserRes(escort.get());
                    res.setEscortStaff(escortRes);
                }
            }
            if (testDrive.getSpecificVIN() != null) {
                res.setSpecificVIN(testDrive.getSpecificVIN());
            }
            // Set attempt number (số lần đăng ký)
            res.setAttemptNumber(testDrive.getAttemptNumber());
            return res;
        }
        return null;
    }

<<<<<<< HEAD
    // Helper method to send confirmation email (when staff confirms request)
=======
    // Helper method to send confirmation email
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
    private void sendConfirmationEmail(TestDrive testDrive) {
        if (testDrive.getUser() == null || testDrive.getUser().getEmail() == null) {
            return;
        }

        String customerEmail = testDrive.getUser().getEmail();
        String customerName = testDrive.getUser().getUsername();

<<<<<<< HEAD
        // Use category name (product is assigned later by staff)
        String vehicleInfo = testDrive.getCategory() != null ? testDrive.getCategory().getName() : "Xe điện";
        String dealerName = testDrive.getDealer() != null ? testDrive.getDealer().getName() : "Đại lý";
=======
        // Use category name instead of product name (product is assigned later by staff)
        String vehicleInfo = testDrive.getProduct() != null
                ? testDrive.getProduct().getName()
                : (testDrive.getCategory() != null ? testDrive.getCategory().getName() : "Xe điện");

        String dealerName = testDrive.getDealer() != null ? testDrive.getDealer().getName() : "Unknown";
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca

        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

        String scheduleDate = testDrive.getScheduleDate().format(dateFormatter);
        String scheduleTime = testDrive.getScheduleDate().format(timeFormatter);

<<<<<<< HEAD
        // Build email content for confirmation (PENDING → ASSIGNING)
        String subject = "✅ Đại lý đã xác nhận yêu cầu lái thử của bạn";
        String body = String.format(
                "Kính gửi anh/chị %s,\n\n" +
                "Đại lý %s đã XÁC NHẬN yêu cầu lái thử của bạn và đang chuẩn bị phân công xe.\n\n" +
                "📋 Thông tin yêu cầu:\n" +
                "🚗 Loại xe: %s\n" +
                "📅 Thời gian: %s lúc %s\n" +
                "📍 Địa điểm: %s\n\n" +
                "⏳ Đại lý sẽ phân công xe cụ thể và nhân viên hỗ trợ trong thời gian sớm nhất.\n" +
                "Vui lòng chờ thông báo tiếp theo về thông tin chi tiết xe và nhân viên đi cùng.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ EVDM",
                customerName, dealerName, vehicleInfo, scheduleDate, scheduleTime, dealerName
=======
        emailService.sendTestDriveConfirmation(
                customerEmail,
                customerName,
                vehicleInfo,
                dealerName,
                scheduleDate,
                scheduleTime
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
        );

        emailService.sendSimpleEmail(customerEmail, subject, body);
    }

<<<<<<< HEAD
    // Helper method to send assignment email (when staff assigns vehicle)
    private void sendAssignmentEmail(TestDrive testDrive) {
        if (testDrive.getUser() == null || testDrive.getUser().getEmail() == null) {
            return;
        }

        String customerEmail = testDrive.getUser().getEmail();
        String customerName = testDrive.getUser().getUsername();
        String vehicleName = testDrive.getProduct() != null ? testDrive.getProduct().getName() : "Xe điện";
        String vinNumber = testDrive.getSpecificVIN() != null ? testDrive.getSpecificVIN() : "N/A";
        String dealerName = testDrive.getDealer() != null ? testDrive.getDealer().getName() : "Đại lý";
        String escortStaffName = testDrive.getEscortStaff() != null ? testDrive.getEscortStaff().getUsername() : "Nhân viên";

        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

        String scheduleDate = testDrive.getScheduleDate().format(dateFormatter);
        String scheduleTime = testDrive.getScheduleDate().format(timeFormatter);

        // Build email content in Vietnamese
        String subject = "✅ Đại lý đã xác nhận lịch lái thử của bạn";
        String body = String.format(
                "Kính gửi anh/chị %s,\n\n" +
                "Đại lý %s đã XÁC NHẬN lịch lái thử của bạn với thông tin như sau:\n\n" +
                "📅 Thời gian: %s lúc %s\n" +
                "🚗 Xe: %s (VIN: %s)\n" +
                "👤 Nhân viên hỗ trợ: %s\n" +
                "📍 Địa điểm: %s\n\n" +
                "Vui lòng đến đúng giờ. Nếu có thay đổi, vui lòng liên hệ đại lý trước 24 giờ.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ EVDM",
                customerName, dealerName, scheduleDate, scheduleTime, 
                vehicleName, vinNumber, escortStaffName, dealerName
        );

        emailService.sendSimpleEmail(customerEmail, subject, body);
    }

=======
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
    // Helper method to send status update email
    private void sendStatusUpdateEmail(TestDrive testDrive, String oldStatus) {
        if (testDrive.getUser() == null || testDrive.getUser().getEmail() == null) {
            return;
        }

        String customerEmail = testDrive.getUser().getEmail();
        String customerName = testDrive.getUser().getUsername();
<<<<<<< HEAD
        String vehicleInfo = testDrive.getProduct() != null
                ? testDrive.getProduct().getName()
                : (testDrive.getCategory() != null ? testDrive.getCategory().getName() : "Xe điện");
        String newStatus = testDrive.getStatus();
        String notes = testDrive.getNotes();

        // Build email subject and body in Vietnamese
        String subject = "Cập nhật trạng thái lịch lái thử";
        String body = buildStatusUpdateEmailBody(customerName, vehicleInfo, oldStatus, newStatus, notes);

        emailService.sendSimpleEmail(customerEmail, subject, body);
    }

    // Helper to build status update email body in Vietnamese
    private String buildStatusUpdateEmailBody(String customerName, String vehicleInfo, String oldStatus, String newStatus, String notes) {
        String oldStatusVi = getStatusLabel(oldStatus);
        String newStatusVi = getStatusLabel(newStatus);

        StringBuilder body = new StringBuilder();
        body.append("Kính gửi anh/chị ").append(customerName).append(",\n\n");
        body.append("Lịch lái thử xe ").append(vehicleInfo).append(" của bạn đã được cập nhật:\n\n");
        body.append("📊 Trạng thái: ").append(oldStatusVi).append(" → ").append(newStatusVi).append("\n\n");

        switch (newStatus) {
            case "ASSIGNING":
                body.append("✅ Đại lý đã tiếp nhận yêu cầu và đang chuẩn bị phân công xe cho bạn.\n");
                body.append("Vui lòng chờ thông báo tiếp theo từ đại lý.\n");
                break;
            case "APPROVED":
                body.append("✅ Đại lý đã xác nhận và phân công xe cho bạn.\n");
                body.append("Vui lòng đến đúng giờ đã hẹn.\n");
                break;
            case "IN_PROGRESS":
                body.append("🚗 Bạn đang trong quá trình lái thử.\n");
                body.append("Chúc bạn có trải nghiệm tuyệt vời!\n");
                break;
            case "DONE":
                body.append("🎉 Lịch lái thử đã hoàn thành.\n");
                body.append("Cảm ơn bạn đã tin tưởng và trải nghiệm. Vui lòng để lại đánh giá của bạn!\n");
                break;
            case "REJECTED":
                body.append("❌ Rất tiếc, đại lý không thể chấp nhận lịch lái thử này.\n");
                if (notes != null && !notes.isEmpty()) {
                    body.append("Lý do: ").append(notes).append("\n");
                }
                body.append("Vui lòng liên hệ đại lý hoặc đặt lịch khác.\n");
                break;
            case "CANCELLED":
                body.append("❌ Lịch lái thử đã bị hủy.\n");
                if (notes != null && !notes.isEmpty()) {
                    body.append("Lý do: ").append(notes).append("\n");
                }
                break;
        }

        body.append("\nTrân trọng,\n");
        body.append("Đội ngũ EVDM");

        return body.toString();
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
=======

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
>>>>>>> edd76a10eae4fbb1e026f1f3ee424b6cb7bbc5ca
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
     * Generate ICS (iCalendar) file content for a test drive
     * @param testDriveId The ID of the test drive
     * @return ICS file content as string
     */
    public String generateIcsFile(int testDriveId) {

        if (testDriveId > 0) {
            Optional<TestDrive> testDrive = testDriveRepository.findById(testDriveId);
            if (!testDrive.isPresent()) {
                throw new RuntimeException("TestDrive not found with id: " + testDriveId);
            } else {


                // Use category name if product not assigned yet
                String vehicleName = testDrive.get().getProduct() != null
                        ? testDrive.get().getProduct().getName()
                        : (testDrive.get().getCategory() != null ? testDrive.get().getCategory().getName() : "Test Drive");

                String dealerName = testDrive.get().getDealer() != null ? testDrive.get().getDealer().getName() : "";
                String dealerAddress = testDrive.get().getDealer() != null ? testDrive.get().getDealer().getAddress() : "";
                String description = testDrive.get().getNotes() != null ? testDrive.get().getNotes() : "";

                // Format datetime for ICS (yyyyMMdd'T'HHmmss)
                java.time.format.DateTimeFormatter icsFormatter =
                        java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

                java.time.LocalDateTime startTime = testDrive.get().getScheduleDate();
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
                desc.append("\\nTrạng thái: ").append(testDrive.get().getStatus());

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
        }
        return null;
    }

    private String escapeIcsText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
