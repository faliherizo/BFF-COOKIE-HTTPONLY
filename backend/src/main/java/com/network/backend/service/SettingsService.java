package com.network.backend.service;

import com.network.backend.model.UserSettings;
import org.springframework.stereotype.Service;

@Service
public class SettingsService {

    private UserSettings.Full currentSettings = new UserSettings.Full(
            new UserSettings.Notifications(true, true, false),
            new UserSettings.Privacy("public", false, false),
            "fr",
            "light"
    );

    public UserSettings getSettings() {
        return new UserSettings(
                currentSettings.getNotifications().isEmail(),
                currentSettings.getNotifications().isPush(),
                currentSettings.getPrivacy().getProfileVisibility(),
                currentSettings.getLanguage(),
                currentSettings.getTheme()
        );
    }

    public void updateSettings(UserSettings settings) {
        if (settings.getLanguage() != null) {
            currentSettings.setLanguage(settings.getLanguage());
        }
        if (settings.getTheme() != null) {
            currentSettings.setTheme(settings.getTheme());
        }
        if (settings.getProfileVisibility() != null) {
            currentSettings.getPrivacy().setProfileVisibility(settings.getProfileVisibility());
        }
        currentSettings.getNotifications().setEmail(settings.isEmailNotifications());
        currentSettings.getNotifications().setPush(settings.isPushNotifications());
    }
}
