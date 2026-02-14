package com.network.backend.controller;

import com.network.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public Map<String, Object> getNotifications() {
        return Map.of("notifications", notificationService.getNotifications(10));
    }

    @PutMapping("/{id}/read")
    public Map<String, Object> markAsRead(@PathVariable String id) {
        return Map.of("success", true, "id", id);
    }
}
