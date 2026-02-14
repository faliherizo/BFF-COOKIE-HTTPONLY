package com.network.backend.model;

public class UserSettings {
    private boolean emailNotifications;
    private boolean pushNotifications;
    private String profileVisibility;
    private String language;
    private String theme;

    public UserSettings() {}

    public UserSettings(boolean emailNotifications, boolean pushNotifications, String profileVisibility, String language, String theme) {
        this.emailNotifications = emailNotifications;
        this.pushNotifications = pushNotifications;
        this.profileVisibility = profileVisibility;
        this.language = language;
        this.theme = theme;
    }

    public boolean isEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(boolean emailNotifications) { this.emailNotifications = emailNotifications; }
    public boolean isPushNotifications() { return pushNotifications; }
    public void setPushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; }
    public String getProfileVisibility() { return profileVisibility; }
    public void setProfileVisibility(String profileVisibility) { this.profileVisibility = profileVisibility; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public static class Full {
        private Notifications notifications;
        private Privacy privacy;
        private String language;
        private String theme;

        public Full() {}

        public Full(Notifications notifications, Privacy privacy, String language, String theme) {
            this.notifications = notifications;
            this.privacy = privacy;
            this.language = language;
            this.theme = theme;
        }

        public Notifications getNotifications() { return notifications; }
        public void setNotifications(Notifications notifications) { this.notifications = notifications; }
        public Privacy getPrivacy() { return privacy; }
        public void setPrivacy(Privacy privacy) { this.privacy = privacy; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
    }

    public static class Notifications {
        private boolean email;
        private boolean push;
        private boolean sms;

        public Notifications() {}

        public Notifications(boolean email, boolean push, boolean sms) {
            this.email = email;
            this.push = push;
            this.sms = sms;
        }

        public boolean isEmail() { return email; }
        public void setEmail(boolean email) { this.email = email; }
        public boolean isPush() { return push; }
        public void setPush(boolean push) { this.push = push; }
        public boolean isSms() { return sms; }
        public void setSms(boolean sms) { this.sms = sms; }
    }

    public static class Privacy {
        private String profileVisibility;
        private boolean showEmail;
        private boolean showPhone;

        public Privacy() {}

        public Privacy(String profileVisibility, boolean showEmail, boolean showPhone) {
            this.profileVisibility = profileVisibility;
            this.showEmail = showEmail;
            this.showPhone = showPhone;
        }

        public String getProfileVisibility() { return profileVisibility; }
        public void setProfileVisibility(String profileVisibility) { this.profileVisibility = profileVisibility; }
        public boolean isShowEmail() { return showEmail; }
        public void setShowEmail(boolean showEmail) { this.showEmail = showEmail; }
        public boolean isShowPhone() { return showPhone; }
        public void setShowPhone(boolean showPhone) { this.showPhone = showPhone; }
    }
}
