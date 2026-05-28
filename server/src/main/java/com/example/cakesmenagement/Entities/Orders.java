package com.example.cakesmenagement.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.apache.catalina.User;

import java.time.LocalDate;
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
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int orderCode;

    @NotNull(message = "חובה לשייך משתמש להזמנה")
    @ManyToOne
    private Users user;

    @NotNull(message = "תאריך הזמנה הוא שדה חובה")
    private LocalDate orderDate;

    @FutureOrPresent(message = "תאריך אספקה לא יכול להיות בעבר")
    private LocalDate deliveryDate;

    @Positive(message = "מחיר כולל חייב להיות מספר חיובי")
    private double totalPrice;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "סטטוס הזמנה הוא שדה חובה")
    private OrderStatus status;

    @Size(max = 500, message = "הערות להזמנה מוגבלות ל-500 תווים")
    private String notes;

    @NotEmpty(message = "הזמנה חייבת להכיל לפחות פריט אחד")
    @OneToMany(cascade = CascadeType.ALL)
   @JoinColumn
    private List<OrderItem> cakes;

    public enum OrderStatus {
        PAID, READY_FOR_PICKUP, DELIVERED, CANCELLED
    }
}