package com.network.backend.service;

import com.network.backend.model.Notification;
import net.datafaker.Faker;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

@Service
public class NotificationService {

    private final Faker faker = new Faker();
    private static final List<String> TYPES = List.of("like", "comment", "connection", "message", "job", "mention");

    public List<Notification> getNotifications(int count) {
        return IntStream.range(0, count).mapToObj(i -> {
            String type = TYPES.get(faker.number().numberBetween(0, TYPES.size()));
            String actorName = faker.name().fullName();

            Map<String, String> messages = Map.of(
                    "like", actorName + " liked your post",
                    "comment", actorName + " commented on your post",
                    "connection", actorName + " sent you a connection request",
                    "message", actorName + " sent you a message",
                    "job", "New job recommendation: " + faker.name().title() + " at " + faker.company().name(),
                    "mention", actorName + " mentioned you in a comment"
            );

            return new Notification(
                    UUID.randomUUID().toString(),
                    type,
                    new Notification.Actor(actorName, "https://i.pravatar.cc/150?u=" + UUID.randomUUID()),
                    messages.get(type),
                    faker.date().past(5, TimeUnit.DAYS).toInstant().toString(),
                    faker.number().numberBetween(0, 10) < 5,
                    "/feed"
            );
        }).sorted(Comparator.comparing(Notification::getTimestamp).reversed()).toList();
    }
}
