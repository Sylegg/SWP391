package com.lemon.supershop.swp391fa25evdm.testdrive.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;

@Repository
public interface TestDriveRepository extends JpaRepository<TestDrive, Integer> {

    // JPA sẽ tự động implement các methods này
    List<TestDrive> findByUserId(int userId);
    List<TestDrive> findByDealerId(int dealerId);
    List<TestDrive> findByUserIdAndStatus(int userId, String status);
    List<TestDrive> findByUserIdAndProductIdAndStatus(int userId, int productId, String status);
    
    // Tìm test drives conflict với thời gian đặt - chỉ check đơn đang active
    @Query("SELECT td FROM TestDrive td WHERE td.product.id = :productId " +
           "AND td.status IN ('PENDING', 'APPROVED', 'IN_PROGRESS') " +
           "AND td.scheduleDate BETWEEN :startTime AND :endTime")
    List<TestDrive> findConflictingTestDrives(
        @Param("productId") int productId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    // Tìm test drives theo product và ngày (để tính available slots)
    @Query("SELECT td FROM TestDrive td WHERE td.product.id = :productId " +
           "AND td.status != 'CANCELED' " +
           "AND DATE(td.scheduleDate) = DATE(:date)")
    List<TestDrive> findByProductAndDate(
        @Param("productId") int productId,
        @Param("date") LocalDateTime date
    );
    
    // ❌ REMINDER QUERIES REMOVED - Status 'CONFIRMED' không tồn tại trong hệ thống
    // Frontend sử dụng: PENDING, APPROVED, IN_PROGRESS, DONE, REJECTED, CANCELLED
    
    // Tìm các xe đang được sử dụng (đã phân công và chưa hoàn thành)
    @Query("SELECT DISTINCT td.product.id FROM TestDrive td " +
           "WHERE td.product.id IS NOT NULL " +
           "AND (td.status = 'APPROVED' OR td.status = 'IN_PROGRESS') ")
    List<Integer> findProductIdsInUse();
    
    // Kiểm tra xe có đang được sử dụng không
    @Query("SELECT COUNT(td) > 0 FROM TestDrive td " +
           "WHERE td.product.id = :productId " +
           "AND (td.status = 'APPROVED' OR td.status = 'IN_PROGRESS') ")
    boolean isProductInUse(@Param("productId") int productId);
    
    // Tìm các nhân viên đang bận (đang đi test drive với khách - status IN_PROGRESS)
    @Query("SELECT DISTINCT td.escortStaff.id FROM TestDrive td " +
           "WHERE td.escortStaff.id IS NOT NULL " +
           "AND td.status = 'IN_PROGRESS'")
    List<Integer> findEscortStaffIdsInProgress();
    
    // Kiểm tra nhân viên có đang bận không
    @Query("SELECT COUNT(td) > 0 FROM TestDrive td " +
           "WHERE td.escortStaff.id = :staffId " +
           "AND td.status = 'IN_PROGRESS'")
    boolean isStaffBusy(@Param("staffId") int staffId);
}
