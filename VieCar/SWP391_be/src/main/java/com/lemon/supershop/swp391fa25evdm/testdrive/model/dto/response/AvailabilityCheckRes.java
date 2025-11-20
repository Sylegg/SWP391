package com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.response;

import java.util.List;

public class AvailabilityCheckRes {
    private boolean available;
    private String message;
    private List<ConflictingBooking> conflictingBookings;

    public AvailabilityCheckRes() {
    }

    public AvailabilityCheckRes(boolean available, String message) {
        this.available = available;
        this.message = message;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ConflictingBooking> getConflictingBookings() {
        return conflictingBookings;
    }

    public void setConflictingBookings(List<ConflictingBooking> conflictingBookings) {
        this.conflictingBookings = conflictingBookings;
    }

    public static class ConflictingBooking {
        private int testDriveId;
        private String scheduleDate;
        private String customerName;

        public ConflictingBooking() {
        }

        public ConflictingBooking(int testDriveId, String scheduleDate, String customerName) {
            this.testDriveId = testDriveId;
            this.scheduleDate = scheduleDate;
            this.customerName = customerName;
        }

        public int getTestDriveId() {
            return testDriveId;
        }

        public void setTestDriveId(int testDriveId) {
            this.testDriveId = testDriveId;
        }

        public String getScheduleDate() {
            return scheduleDate;
        }

        public void setScheduleDate(String scheduleDate) {
            this.scheduleDate = scheduleDate;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }
    }
}
