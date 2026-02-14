package com.network.backend.controller;

import com.network.backend.model.UserSettings;
import com.network.backend.service.SettingsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public Map<String, Object> getSettings() {
        return Map.of("settings", settingsService.getSettings());
    }

    @PutMapping
    public Map<String, Object> updateSettings(@RequestBody UserSettings settings) {
        settingsService.updateSettings(settings);
        return Map.of("success", true, "message", "Settings updated");
    }
}
