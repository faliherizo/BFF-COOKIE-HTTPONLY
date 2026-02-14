package com.network.backend.service;

import com.network.backend.model.Conversation;
import com.network.backend.model.Message;
import com.network.backend.model.Participant;
import net.datafaker.Faker;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

@Service
public class MessageService {

    private final Faker faker = new Faker();

    public List<Conversation> getConversations(int count) {
        return IntStream.range(0, count).mapToObj(i -> new Conversation(
                UUID.randomUUID().toString(),
                new Participant(
                        UUID.randomUUID().toString(),
                        faker.name().fullName(),
                        "https://i.pravatar.cc/150?u=" + UUID.randomUUID(),
                        faker.name().title() + " at " + faker.company().name(),
                        faker.number().numberBetween(0, 10) < 3
                ),
                faker.lorem().sentence(),
                faker.date().past(3, TimeUnit.DAYS).toInstant().toString(),
                faker.number().numberBetween(0, 5)
        )).toList();
    }

    public List<Message> getMessages(String conversationId, int count) {
        Participant partner = new Participant(
                UUID.randomUUID().toString(),
                faker.name().fullName(),
                "https://i.pravatar.cc/150?u=" + UUID.randomUUID(),
                faker.name().title() + " at " + faker.company().name(),
                faker.number().numberBetween(0, 10) < 4
        );

        Participant currentUser = new Participant(
                "current-user",
                "You",
                "",
                "",
                true
        );

        return IntStream.range(0, count).mapToObj(i -> new Message(
                UUID.randomUUID().toString(),
                conversationId,
                faker.bool().bool() ? partner : currentUser,
                faker.lorem().sentence(faker.number().numberBetween(3, 15)),
                faker.date().past(2, TimeUnit.DAYS).toInstant().toString(),
                faker.number().numberBetween(0, 10) < 7
        )).sorted(Comparator.comparing(Message::getTimestamp)).toList();
    }

    public Message sendMessage(String conversationId) {
        return getMessages(conversationId, 1).getFirst();
    }
}
