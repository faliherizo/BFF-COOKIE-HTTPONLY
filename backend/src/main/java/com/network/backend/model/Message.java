package com.network.backend.model;

public class Message {
    private String id;
    private String conversationId;
    private Participant sender;
    private String content;
    private String timestamp;
    private boolean read;

    public Message() {}

    public Message(String id, String conversationId, Participant sender, String content, String timestamp, boolean read) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
        this.read = read;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public Participant getSender() { return sender; }
    public void setSender(Participant sender) { this.sender = sender; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
}
