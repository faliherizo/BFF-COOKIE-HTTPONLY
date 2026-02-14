package com.network.backend.model;

public class FeedPost {
    private String id;
    private Author author;
    private String content;
    private String image;
    private int likes;
    private int comments;
    private int shares;
    private String createdAt;
    private boolean liked;

    public FeedPost() {}

    public FeedPost(String id, Author author, String content, String image, int likes, int comments, int shares, String createdAt, boolean liked) {
        this.id = id;
        this.author = author;
        this.content = content;
        this.image = image;
        this.likes = likes;
        this.comments = comments;
        this.shares = shares;
        this.createdAt = createdAt;
        this.liked = liked;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Author getAuthor() { return author; }
    public void setAuthor(Author author) { this.author = author; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }
    public int getComments() { return comments; }
    public void setComments(int comments) { this.comments = comments; }
    public int getShares() { return shares; }
    public void setShares(int shares) { this.shares = shares; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public boolean isLiked() { return liked; }
    public void setLiked(boolean liked) { this.liked = liked; }
}
