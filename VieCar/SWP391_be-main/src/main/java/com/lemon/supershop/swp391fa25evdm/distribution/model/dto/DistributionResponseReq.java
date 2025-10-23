package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

public class DistributionResponseReq {
    private String response; // "ACCEPTED" or "DECLINED"
    private String dealerNotes;

    public DistributionResponseReq() {}

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getDealerNotes() {
        return dealerNotes;
    }

    public void setDealerNotes(String dealerNotes) {
        this.dealerNotes = dealerNotes;
    }
}
