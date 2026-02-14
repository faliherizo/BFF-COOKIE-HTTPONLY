package com.network.backend.service;

import com.network.backend.model.Author;
import com.network.backend.model.FeedPost;
import net.datafaker.Faker;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

@Service
public class FeedService {

    private final Faker faker = new Faker();

    public List<FeedPost> getFeedPosts(int count) {
        return IntStream.range(0, count).mapToObj(i -> new FeedPost(
                UUID.randomUUID().toString(),
                new Author(
                        UUID.randomUUID().toString(),
                        faker.name().fullName(),
                        faker.name().title() + " at " + faker.company().name(),
                        "https://i.pravatar.cc/150?u=" + UUID.randomUUID()
                ),
                faker.lorem().paragraph(faker.number().numberBetween(1, 4)),
                faker.bool().bool()
                        ? "https://picsum.photos/seed/" + UUID.randomUUID() + "/600/400"
                        : null,
                faker.number().numberBetween(0, 500),
                faker.number().numberBetween(0, 80),
                faker.number().numberBetween(0, 30),
                faker.date().past(7, TimeUnit.DAYS).toInstant().toString(),
                faker.number().numberBetween(0, 10) < 3
        )).toList();
    }

    public FeedPost createPost(String content) {
        FeedPost post = getFeedPosts(1).getFirst();
        if (content != null && !content.isBlank()) {
            post.setContent(content);
        }
        post.setLikes(0);
        post.setComments(0);
        post.setShares(0);
        post.setCreatedAt(Instant.now().toString());
        post.setLiked(false);
        return post;
    }
}
