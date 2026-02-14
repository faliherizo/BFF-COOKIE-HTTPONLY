package com.network.backend.model;

public class Connection {
    private String id;
    private String name;
    private String headline;
    private String avatar;
    private int mutualConnections;
    private boolean connected;
    private boolean pendingRequest;

    public Connection() {}

    public Connection(String id, String name, String headline, String avatar, int mutualConnections, boolean connected, boolean pendingRequest) {
        this.id = id;
        this.name = name;
        this.headline = headline;
        this.avatar = avatar;
        this.mutualConnections = mutualConnections;
        this.connected = connected;
        this.pendingRequest = pendingRequest;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public int getMutualConnections() { return mutualConnections; }
    public void setMutualConnections(int mutualConnections) { this.mutualConnections = mutualConnections; }
    public boolean isConnected() { return connected; }
    public void setConnected(boolean connected) { this.connected = connected; }
    public boolean isPendingRequest() { return pendingRequest; }
    public void setPendingRequest(boolean pendingRequest) { this.pendingRequest = pendingRequest; }
}
