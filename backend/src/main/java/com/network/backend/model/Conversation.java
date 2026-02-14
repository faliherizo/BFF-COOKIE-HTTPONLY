package com.network.backend.model;

public class Conversation {
    private String id;
    private Participant participant;
    private String lastMessage;
    private String lastMessageTime;
    private int unreadCount;

    public Conversation() {}

    public Conversation(String id, Participant participant, String lastMessage, String lastMessageTime, int unreadCount) {
        this.id = id;
        this.participant = participant;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Participant getParticipant() { return participant; }
    public void setParticipant(Participant participant) { this.participant = participant; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public String getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(String lastMessageTime) { this.lastMessageTime = lastMessageTime; }
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
}
