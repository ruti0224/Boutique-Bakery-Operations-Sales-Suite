package com.example.cakesmenagement.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
@Entity
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int code;

    @Min(value = 1, message = "כמות חייבת להיות לפחות 1")
    @Max(value = 1000, message = "לא ניתן להזמין יותר מ-100 יחידות מפריט בודד")
    private int quantity;

    @NotNull(message = "חובה לשייך מוצר לפריט ההזמנה")
    @ManyToOne
    private Cakes cake;
}
