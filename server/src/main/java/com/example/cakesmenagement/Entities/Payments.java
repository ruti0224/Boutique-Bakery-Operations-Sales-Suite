package com.example.cakesmenagement.Entities;

import jakarta.persistence.*;
import jakarta.persistence.criteria.Order;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
@Entity
public class Payments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotNull(message = "תשלום חייב להיות משויך להזמנה")
    @OneToOne
    private Orders order;

    @Positive(message = "סכום התשלום חייב להיות חיובי")
    private double amount;

    @PastOrPresent(message = "תאריך תשלום לא יכול להיות בעתיד")
    private LocalDateTime paymentDate;

    @NotBlank(message = "אמצעי תשלום הוא שדה חובה")
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "סטטוס תשלום הוא שדה חובה")
    private PaymentStatus paymentStatus;

    @NotBlank(message = "מזהה עסקה הוא שדה חובה")
    private String transactionId;

    public enum PaymentStatus {
        SUCCESS, FAILED, REFUNDED
    }
}