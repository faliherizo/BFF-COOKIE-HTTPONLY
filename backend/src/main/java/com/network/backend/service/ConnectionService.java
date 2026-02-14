package com.network.backend.service;

import com.network.backend.model.Connection;
import net.datafaker.Faker;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

@Service
public class ConnectionService {

    private final Faker faker = new Faker();

    public List<Connection> getConnections(int count) {
        return IntStream.range(0, count).mapToObj(i -> new Connection(
                UUID.randomUUID().toString(),
                faker.name().fullName(),
                faker.name().title() + " at " + faker.company().name(),
                "https://i.pravatar.cc/150?u=" + UUID.randomUUID(),
                faker.number().numberBetween(0, 50),
                faker.number().numberBetween(0, 10) < 6,
                faker.number().numberBetween(0, 100) < 15
        )).toList();
    }

    public List<Connection> getSuggestions(int count) {
        return IntStream.range(0, count).mapToObj(i -> new Connection(
                UUID.randomUUID().toString(),
                faker.name().fullName(),
                faker.name().title() + " at " + faker.company().name(),
                "https://i.pravatar.cc/150?u=" + UUID.randomUUID(),
                faker.number().numberBetween(1, 30),
                false,
                false
        )).toList();
    }
}
