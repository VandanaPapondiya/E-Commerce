package com.example.myproject.entity;
import jakarta.persistence.*;
import org.jspecify.annotations.Nullable;

//@Entity annotation indicates that this class is a JPA entity and will be mapped to a database table.
// The @Table annotation specifies the name of the table in the database that this entity will
// be mapped to, which is "user" in this case. The class has fields for id, name, email, password,
// and role, with appropriate annotations for primary key generation and unique constraints on the
// email field.
//JPA is class ka object ko table ki row banayega aur class ke field ko table ke column banayega.
// JPA humein database operations ko asaani se perform karne mein madad karta hai,
// jaise ki data ko save karna, update karna, delete karna, aur query karna.
// Is tarah se hum apne Java application ko database ke saath interact kar sakte hain bina SQL
// queries likhne ki zarurat ke.
@Entity
@Table(name = "user")
public class User{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String role;

    public void setName(String name) {
       this.name=name;
    }

    public void setEmail(String email) {
        this.email=email;
    }

    public void setRole(String user) {
        this.role=user;
    }

    public void setPassword(String password) {
        this.password=password;
    }

    public String getEmail() {
        return email;
    }

    public @Nullable String getPassword() {
        return password;
    }
}