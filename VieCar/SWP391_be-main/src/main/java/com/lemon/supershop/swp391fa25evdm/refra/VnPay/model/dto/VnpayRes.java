package com.lemon.supershop.swp391fa25evdm.refra.VnPay.model.dto;


import java.io.Serializable;

public class VnpayRes implements Serializable {
    private String status;
    private String msg;
    private String url;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
