package com.lemon.supershop.swp391fa25evdm.chatai.controller;

import com.lemon.supershop.swp391fa25evdm.chatai.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin("*")
public class ChatController {

    @Autowired
    private ChatService chatService;

//    @PostMapping("/chat")
//    public ResponseEntity<ChatRes> chat (@RequestBody ChatReq request) {
//        ChatRes response = chatService.chat(request);
//        return ResponseEntity.ok(response);
//    }
}
