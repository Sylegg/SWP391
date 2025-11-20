package com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.response;

import java.util.List;

public class AvailableSlotsRes {
    private String date;
    private List<TimeSlot> slots;

    public AvailableSlotsRes() {
    }

    public AvailableSlotsRes(String date, List<TimeSlot> slots) {
        this.date = date;
        this.slots = slots;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<TimeSlot> getSlots() {
        return slots;
    }

    public void setSlots(List<TimeSlot> slots) {
        this.slots = slots;
    }

    public static class TimeSlot {
        private String startTime;
        private String endTime;
        private boolean available;
        private String label;

        public TimeSlot() {
        }

        public TimeSlot(String startTime, String endTime, boolean available, String label) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.available = available;
            this.label = label;
        }

        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getEndTime() {
            return endTime;
        }

        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }

        public boolean isAvailable() {
            return available;
        }

        public void setAvailable(boolean available) {
            this.available = available;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }
    }
}
