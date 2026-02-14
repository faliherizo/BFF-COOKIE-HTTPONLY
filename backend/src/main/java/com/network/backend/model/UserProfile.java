package com.network.backend.model;

import java.util.List;

public class UserProfile {
    private String id;
    private String name;
    private String headline;
    private String location;
    private String avatar;
    private String coverImage;
    private String about;
    private int connections;
    private List<Experience> experience;
    private List<Education> education;
    private List<String> skills;

    public UserProfile() {}

    public UserProfile(String id, String name, String headline, String location, String avatar, String coverImage, String about, int connections, List<Experience> experience, List<Education> education, List<String> skills) {
        this.id = id;
        this.name = name;
        this.headline = headline;
        this.location = location;
        this.avatar = avatar;
        this.coverImage = coverImage;
        this.about = about;
        this.connections = connections;
        this.experience = experience;
        this.education = education;
        this.skills = skills;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
    public int getConnections() { return connections; }
    public void setConnections(int connections) { this.connections = connections; }
    public List<Experience> getExperience() { return experience; }
    public void setExperience(List<Experience> experience) { this.experience = experience; }
    public List<Education> getEducation() { return education; }
    public void setEducation(List<Education> education) { this.education = education; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public static class Experience {
        private String title;
        private String company;
        private String location;
        private String startDate;
        private String endDate;
        private boolean current;
        private String description;

        public Experience() {}

        public Experience(String title, String company, String location, String startDate, String endDate, boolean current, String description) {
            this.title = title;
            this.company = company;
            this.location = location;
            this.startDate = startDate;
            this.endDate = endDate;
            this.current = current;
            this.description = description;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public boolean isCurrent() { return current; }
        public void setCurrent(boolean current) { this.current = current; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class Education {
        private String school;
        private String degree;
        private String field;
        private int startYear;
        private int endYear;

        public Education() {}

        public Education(String school, String degree, String field, int startYear, int endYear) {
            this.school = school;
            this.degree = degree;
            this.field = field;
            this.startYear = startYear;
            this.endYear = endYear;
        }

        public String getSchool() { return school; }
        public void setSchool(String school) { this.school = school; }
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public int getStartYear() { return startYear; }
        public void setStartYear(int startYear) { this.startYear = startYear; }
        public int getEndYear() { return endYear; }
        public void setEndYear(int endYear) { this.endYear = endYear; }
    }
}
