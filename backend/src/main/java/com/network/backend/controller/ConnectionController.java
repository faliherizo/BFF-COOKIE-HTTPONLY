package com.network.backend.controller;

import com.network.backend.service.ConnectionService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @GetMapping
    public Map<String, Object> getConnections() {
        return Map.of("connections", connectionService.getConnections(12));
    }

    @GetMapping("/suggestions")
    public Map<String, Object> getSuggestions() {
        return Map.of("suggestions", connectionService.getSuggestions(6));
    }

    @PostMapping("/{userId}/connect")
    public Map<String, Object> sendConnectionRequest(@PathVariable String userId) {
        return Map.of("success", true, "userId", userId, "status", "pending");
    }

    @PostMapping("/{userId}/accept")
    public Map<String, Object> acceptConnection(@PathVariable String userId) {
        return Map.of("success", true, "userId", userId, "status", "connected");
    }
}
