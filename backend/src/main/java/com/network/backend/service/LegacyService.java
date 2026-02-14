package com.network.backend.service;

import com.network.backend.model.Transaction;
import com.network.backend.model.Product;
import net.datafaker.Faker;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

@Service
public class LegacyService {

    private final Faker faker = new Faker();

    public List<Transaction> getTransactions(int count) {
        return IntStream.range(0, count).mapToObj(i -> new Transaction(
                UUID.randomUUID().toString(),
                faker.date().past(365, TimeUnit.DAYS).toInstant().toString(),
                String.format("%.2f", faker.number().randomDouble(2, 10, 1000)),
                faker.currency().code(),
                faker.company().name(),
                faker.options().option("debit", "credit")
        )).toList();
    }

    public List<Product> getProducts(int count) {
        return IntStream.range(0, count).mapToObj(i -> new Product(
                UUID.randomUUID().toString(),
                faker.commerce().productName(),
                String.format("%.2f", faker.number().randomDouble(2, 10, 500)),
                faker.commerce().department(),
                faker.commerce().material(),
                faker.lorem().sentence(10),
                faker.bool().bool()
        )).toList();
    }
}
