package com.network.backend.service;

import com.network.backend.model.UserProfile;
import com.network.backend.model.UserDetails;
import net.datafaker.Faker;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

@Service
public class ProfileService {

    private final Faker faker = new Faker();

    private static final List<String> SKILLS = List.of(
            "JavaScript", "TypeScript", "Angular", "React", "Node.js", "Python",
            "Java", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "SQL",
            "MongoDB", "GraphQL", "REST API", "CI/CD", "Agile", "Scrum",
            "Machine Learning", "DevOps", "Microservices", "Leadership"
    );

    private static final List<String> DEGREES = List.of("Bachelor's", "Master's", "PhD", "MBA");
    private static final List<String> FIELDS = List.of("Computer Science", "Business", "Engineering", "Mathematics", "Finance");

    public UserProfile getExtendedProfile() {
        int expCount = faker.number().numberBetween(2, 5);
        int eduCount = faker.number().numberBetween(1, 3);
        int skillCount = faker.number().numberBetween(5, 15);

        return new UserProfile(
                UUID.randomUUID().toString(),
                faker.name().fullName(),
                faker.name().title() + " at " + faker.company().name(),
                faker.address().city() + ", " + faker.address().country(),
                "https://i.pravatar.cc/150?u=" + UUID.randomUUID(),
                "https://picsum.photos/seed/" + UUID.randomUUID() + "/1200/300",
                faker.lorem().paragraph(4),
                faker.number().numberBetween(50, 1500),
                IntStream.range(0, expCount).mapToObj(i -> {
                    boolean current = faker.number().numberBetween(0, 10) < 3;
                    return new UserProfile.Experience(
                            faker.name().title(),
                            faker.company().name(),
                            faker.address().city() + ", " + faker.address().country(),
                            faker.date().past(8 * 365, TimeUnit.DAYS).toInstant().toString(),
                            current ? null : faker.date().past(2 * 365, TimeUnit.DAYS).toInstant().toString(),
                            current,
                            faker.lorem().paragraph()
                    );
                }).toList(),
                IntStream.range(0, eduCount).mapToObj(i -> new UserProfile.Education(
                        faker.company().name() + " University",
                        DEGREES.get(faker.number().numberBetween(0, DEGREES.size())),
                        FIELDS.get(faker.number().numberBetween(0, FIELDS.size())),
                        faker.number().numberBetween(2005, 2015),
                        faker.number().numberBetween(2016, 2023)
                )).toList(),
                IntStream.range(0, skillCount)
                        .mapToObj(i -> SKILLS.get(faker.number().numberBetween(0, SKILLS.size())))
                        .distinct()
                        .toList()
        );
    }

    public UserDetails getUserDetails() {
        return new UserDetails(
                new UserDetails.Address(
                        faker.address().streetAddress(),
                        faker.address().city(),
                        faker.address().zipCode(),
                        faker.address().country()
                ),
                faker.phoneNumber().phoneNumber(),
                faker.company().name(),
                faker.date().past(1, TimeUnit.DAYS).toInstant().toString()
        );
    }

    public Map<String, Object> getProfileExtensions() {
        return Map.of(
                "fakeBio", faker.lorem().sentence(),
                "registeredAt", faker.date().past(2 * 365, TimeUnit.DAYS).toInstant().toString(),
                "avatar", "https://i.pravatar.cc/150?u=" + UUID.randomUUID(),
                "socialMedia", Map.of(
                        "twitter", faker.internet().username(),
                        "github", faker.internet().username()
                )
        );
    }
}
