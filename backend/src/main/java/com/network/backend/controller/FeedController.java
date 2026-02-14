package com.network.backend.controller;

import com.network.backend.model.FeedPost;
import com.network.backend.service.FeedService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feed")
public class FeedController {

    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping
    public Map<String, Object> getFeed(@RequestParam(defaultValue = "10") int count) {
        return Map.of("posts", feedService.getFeedPosts(count));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createPost(@RequestBody(required = false) Map<String, String> body) {
        String content = body != null ? body.get("content") : null;
        FeedPost post = feedService.createPost(content);
        return Map.of("post", post);
    }

    @PostMapping("/{postId}/like")
    public Map<String, Object> likePost(@PathVariable String postId) {
        return Map.of("success", true, "postId", postId);
    }
}
