package com.network.backend.model;

public class Product {
    private String id;
    private String name;
    private String price;
    private String department;
    private String material;
    private String description;
    private boolean inStock;

    public Product() {}

    public Product(String id, String name, String price, String department, String material, String description, boolean inStock) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.department = department;
        this.material = material;
        this.description = description;
        this.inStock = inStock;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }
}
