package com.network.backend.controller;

import com.network.backend.service.LegacyService;
import com.network.backend.service.ProfileService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profileService;
    private final LegacyService legacyService;

    public ProfileController(ProfileService profileService, LegacyService legacyService) {
        this.profileService = profileService;
        this.legacyService = legacyService;
    }

    @GetMapping("/profile/extended")
    public Map<String, Object> getExtendedProfile() {
        return Map.of("profile", profileService.getExtendedProfile());
    }

    @GetMapping("/user-details")
    public Map<String, Object> getUserDetails() {
        Map<String, Object> result = new HashMap<>();
        var details = profileService.getUserDetails();
        result.put("address", details.getAddress());
        result.put("phone", details.getPhone());
        result.put("company", details.getCompany());
        result.put("recentLogin", details.getRecentLogin());
        return result;
    }

    @GetMapping("/profile/extensions")
    public Map<String, Object> getProfileExtensions() {
        return profileService.getProfileExtensions();
    }

    @GetMapping("/transactions")
    public Map<String, Object> getTransactions() {
        return Map.of("transactions", legacyService.getTransactions(5));
    }

    @GetMapping("/products")
    public Map<String, Object> getProducts() {
        return Map.of("products", legacyService.getProducts(6));
    }
}
