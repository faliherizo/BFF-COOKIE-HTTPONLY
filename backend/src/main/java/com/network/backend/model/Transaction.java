package com.network.backend.model;

public class Transaction {
    private String id;
    private String date;
    private String amount;
    private String currency;
    private String merchant;
    private String type;

    public Transaction() {}

    public Transaction(String id, String date, String amount, String currency, String merchant, String type) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.currency = currency;
        this.merchant = merchant;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getMerchant() { return merchant; }
    public void setMerchant(String merchant) { this.merchant = merchant; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
