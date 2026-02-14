package com.network.backend.model;

public class Notification {
    private String id;
    private String type;
    private Actor actor;
    private String message;
    private String timestamp;
    private boolean read;
    private String link;

    public Notification() {}

    public Notification(String id, String type, Actor actor, String message, String timestamp, boolean read, String link) {
        this.id = id;
        this.type = type;
        this.actor = actor;
        this.message = message;
        this.timestamp = timestamp;
        this.read = read;
        this.link = link;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Actor getActor() { return actor; }
    public void setActor(Actor actor) { this.actor = actor; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public static class Actor {
        private String name;
        private String avatar;

        public Actor() {}

        public Actor(String name, String avatar) {
            this.name = name;
            this.avatar = avatar;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
    }
}
