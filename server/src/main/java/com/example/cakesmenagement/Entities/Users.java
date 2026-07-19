package com.example.cakesmenagement.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
@Entity
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int code;
    @NotBlank(message = "שם הוא שדה חובה")
    @Size(min = 2, max = 50, message = "השם חייב להיות בין 2 ל-50 תווים")
    private String name;
    @Email(message = "כתובת אימייל לא תקינה")
    @NotBlank(message = "אימייל הוא שדה חובה")
    private String email;
    @Pattern(regexp = "^\\d{10}$", message = "מספר טלפון חייב להכיל 10 ספרות")
    private String phoneNumber;
    @JsonIgnore
    @Size(min = 6, message = "סיסמה חייבת להכיל לפחות 6 תווים")
    private String password;
    private String role;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "cakes_in_cart_code")
    private List<OrderItem> cakesInCart;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Orders> userOrders;
    @JsonIgnore
    private String resetToken;
    @JsonIgnore
    private LocalDateTime resetTokenExpiry;

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase() : null;
    }
}
