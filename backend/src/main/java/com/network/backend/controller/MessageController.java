package com.network.backend.controller;

import com.network.backend.service.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public Map<String, Object> getConversations() {
        return Map.of("conversations", messageService.getConversations(8));
    }

    @GetMapping("/{conversationId}")
    public Map<String, Object> getMessages(@PathVariable String conversationId) {
        return Map.of("messages", messageService.getMessages(conversationId, 15));
    }

    @PostMapping("/{conversationId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> sendMessage(@PathVariable String conversationId) {
        return Map.of("message", messageService.sendMessage(conversationId));
    }
}
