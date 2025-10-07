package com.lemon.supershop.swp391fa25evdm.refra.MOMO.dto;


public class CreateMomoReq {
    private String parnerCode;
    private String requestId;
    private long amount;
    private String orderId;
    private String orderInfo;
    private String redirectUrl;
    private String ipnUrl;
    private String reqType;
    private String extraData;
    private String lang;
    private String signature;

    public CreateMomoReq() {
    }

    public CreateMomoReq(String parnerCode, String requestId, long amount, String orderId, String orderInfo, String redirectUrl, String ipnUrl, String reqType, String extraData, String lang, String signature) {
        this.parnerCode = parnerCode;
        this.requestId = requestId;
        this.amount = amount;
        this.orderId = orderId;
        this.orderInfo = orderInfo;
        this.redirectUrl = redirectUrl;
        this.ipnUrl = ipnUrl;
        this.reqType = reqType;
        this.extraData = extraData;
        this.lang = lang;
        this.signature = signature;
    }

    public String getParnerCode() {
        return parnerCode;
    }

    public String getReqType() {
        return reqType;
    }

    public String getIpnUrl() {
        return ipnUrl;
    }

    public String getOrderId() {
        return orderId;
    }

    public long getAmount() {
        return amount;
    }

    public String getRequestId() {
        return requestId;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public String getSignature() {
        return signature;
    }

    public String getExtraData() {
        return extraData;
    }

    public String getLang() {
        return lang;
    }

    public String getOrderInfo() {
        return orderInfo;
    }
}
