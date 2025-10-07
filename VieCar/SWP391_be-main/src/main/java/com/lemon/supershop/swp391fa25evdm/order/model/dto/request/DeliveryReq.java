package com.lemon.supershop.swp391fa25evdm.order.model.dto.request;

import java.util.Date;

public class DeliveryReq {
    private String ship_address;
    private String ship_status;
    private Date ship_date;

    public String getShip_address() {
        return ship_address;
    }

    public String getShip_status() {
        return ship_status;
    }

    public Date getShip_date() {
        return ship_date;
    }
}
