package com.lemon.supershop.swp391fa25evdm.refra.MOMO.service;

import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.order.repository.OrderRepo;
import com.lemon.supershop.swp391fa25evdm.refra.MOMO.client.MomoApi;
import com.lemon.supershop.swp391fa25evdm.refra.MOMO.dto.CreateMomoReq;
import com.lemon.supershop.swp391fa25evdm.refra.MOMO.dto.CreateMomoRes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class MomoService {

    @Value(value = "${momo.partner-code}")
    private String PARTNER_CODE;
    @Value(value = "${momo.access-key}")
    private String ACCESS_KEY;
    @Value(value = "${momo.secret-key}")
    private String SECRET_KEY;
    @Value(value = "${momo.return-url}")
    private String REDIRECT_URL;
    @Value(value = "${momo.ipn-url}")
    private String IPN_URL;
    @Value(value = "${momo.request-type}")
    private String REQUEST_TYPE;

    @Autowired
    private OrderRepo orderRepo;

    private final MomoApi momoApi;

    public MomoService(MomoApi momoApi) {
        this.momoApi = momoApi;
    }

    public CreateMomoRes CreateQr(int orderId){
        Order order = orderRepo.findById(Integer.valueOf(orderId)).get();
        if (order != null) {
            String strOrderId = String.valueOf(order.getId());
            String reqId = UUID.randomUUID().toString();
            String orderInfo = order.getUser().getUsername() + order.getProduct().getName() + order.getTotal();
            String rawSignature = String.format(
                    "accessKey=$accessKey&amount=$amount&orderId=$orderId\n" +
                            "&partnerCode=$partnerCode&payUrl=&payUrl&requestId=\n" +
                            "$requestId&responseTime=$responseTime&resultCode=$resultCode",
                    ACCESS_KEY, Math.round(order.getTotal()), strOrderId, PARTNER_CODE, IPN_URL, reqId, REDIRECT_URL, REQUEST_TYPE
            );

            String prettySignature = "";
            try {
                prettySignature = signHmacSHA256(rawSignature, SECRET_KEY);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            String extra = "hoá đơn đã kèm thuê và các chính sách giảm giá";

            CreateMomoReq req = null;
            if (!prettySignature.isBlank()) {
                req = new CreateMomoReq(PARTNER_CODE, reqId, Math.round(order.getTotal()), strOrderId, orderInfo, REDIRECT_URL, IPN_URL, REQUEST_TYPE, extra, "vi", prettySignature);
            }
            return momoApi.create(req);
        } else {
            return null;
        }
    }

    private String signHmacSHA256(String data, String key) throws Exception {
        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSHA256.init(secretKey);

        byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();

        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }

        return hexString.toString();
    }
}
