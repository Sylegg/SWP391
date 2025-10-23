package com.lemon.supershop.swp391fa25evdm.preorder.model.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PreOrderReq {

    private int userId;
    private int productId;
    private Date orderDate;
    private String status;
    private double deposit;
}
