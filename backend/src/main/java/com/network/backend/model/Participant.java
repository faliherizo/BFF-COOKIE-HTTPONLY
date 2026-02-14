package com.network.backend.model;

public class Participant {
    private String id;
    private String name;
    private String avatar;
    private String headline;
    private boolean online;

    public Participant() {}

    public Participant(String id, String name, String avatar, String headline, boolean online) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.headline = headline;
        this.online = online;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }
}
