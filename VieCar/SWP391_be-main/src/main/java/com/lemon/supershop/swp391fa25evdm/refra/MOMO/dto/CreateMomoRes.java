package com.lemon.supershop.swp391fa25evdm.refra.MOMO.dto;

public class CreateMomoRes {
    private String parnerCode;
    private String requestId;
    private String orderId;
    private long amount;
    private long responseTime;
    private String msg;
    private int resultCode;
    private String payUrl;
    private String deeplink;
    private String qrcodeUrl;

    public CreateMomoRes() {
    }

    public CreateMomoRes(String parnerCode, String requestId, String orderId, long amount, long responseTime, String msg, int resultCode, String payUrl, String deeplink, String qrcodeUrl) {
        this.parnerCode = parnerCode;
        this.orderId = orderId;
        this.requestId = requestId;
        this.amount = amount;
        this.responseTime = responseTime;
        this.msg = msg;
        this.resultCode = resultCode;
        this.payUrl = payUrl;
        this.deeplink = deeplink;
        this.qrcodeUrl = qrcodeUrl;
    }

    public String getParnerCode() {
        return parnerCode;
    }

    public void setParnerCode(String parnerCode) {
        this.parnerCode = parnerCode;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public long getAmount() {
        return amount;
    }

    public void setAmount(long amount) {
        this.amount = amount;
    }

    public long getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(long responseTime) {
        this.responseTime = responseTime;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public int getResultCode() {
        return resultCode;
    }

    public void setResultCode(int resultCode) {
        this.resultCode = resultCode;
    }

    public String getPayUrl() {
        return payUrl;
    }

    public void setPayUrl(String payUrl) {
        this.payUrl = payUrl;
    }

    public String getDeeplink() {
        return deeplink;
    }

    public void setDeeplink(String deeplink) {
        this.deeplink = deeplink;
    }

    public String getQrcodeUrl() {
        return qrcodeUrl;
    }

    public void setQrcodeUrl(String qrcodeUrl) {
        this.qrcodeUrl = qrcodeUrl;
    }
}
