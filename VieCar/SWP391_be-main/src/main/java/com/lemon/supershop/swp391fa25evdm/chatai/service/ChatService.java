package com.lemon.supershop.swp391fa25evdm.chatai.service;

import com.lemon.supershop.swp391fa25evdm.chatai.model.dto.ChatReq;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final ChatClient chatClient;

    public ChatService(ChatClient.Builder builder) {
        chatClient = builder.build();
    }


    public String chat(ChatReq req){
        SystemMessage systemMessage = new SystemMessage("Bạn là chuyên viên tư vấn xe điện VinFast của hệ thống Electric Vehicle Dealer Management" + "Nếu hỏi ngoài vấn đề data và không thể trả lời hãy Nói Liên Hệ trực tiếp nhân viên hãng xe để được tư vấn chi tiết" + "bạn chỉ trả các câu hỏi của khách hàng dựa trên nội dung được cung cấp, nếu không thể trả lời hoặc thiếu dữ kiện để trả lời thì hãy trả lời hoặc hỏi lại một cách khéo léo và lịch sự." + "Bạn có thể tư vấn các vấn đề về xe, về thủ tục mua xe, lái thử và các vấn đề xoay quanh xe điện VinFast");

        UserMessage userMessage = new UserMessage(req.msg());

        Prompt prompt = new Prompt(systemMessage, userMessage);

        return chatClient.prompt(prompt).call().content();
    }
}
