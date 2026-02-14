package com.network.backend.model;

public class UserDetails {
    private Address address;
    private String phone;
    private String company;
    private String recentLogin;

    public UserDetails() {}

    public UserDetails(Address address, String phone, String company, String recentLogin) {
        this.address = address;
        this.phone = phone;
        this.company = company;
        this.recentLogin = recentLogin;
    }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getRecentLogin() { return recentLogin; }
    public void setRecentLogin(String recentLogin) { this.recentLogin = recentLogin; }

    public static class Address {
        private String street;
        private String city;
        private String zipCode;
        private String country;

        public Address() {}

        public Address(String street, String city, String zipCode, String country) {
            this.street = street;
            this.city = city;
            this.zipCode = zipCode;
            this.country = country;
        }

        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }
}
