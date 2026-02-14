package com.network.backend.model;

public class Author {
    private String id;
    private String name;
    private String headline;
    private String avatar;

    public Author() {}

    public Author(String id, String name, String headline, String avatar) {
        this.id = id;
        this.name = name;
        this.headline = headline;
        this.avatar = avatar;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
