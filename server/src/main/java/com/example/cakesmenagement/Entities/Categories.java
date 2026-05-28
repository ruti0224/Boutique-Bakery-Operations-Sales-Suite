package com.example.cakesmenagement.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
@Entity
public class Categories {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int categoryCode;

    @NotBlank(message = "שם הקטגוריה הוא שדה חובה")
    @Size(min = 2, max = 30, message = "שם קטגוריה חייב להיות בין 2 ל-30 תווים")
    private String name;

//    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
//    @JoinColumn(name = "category_id") // זה יוצר עמודה בטבלת CAKES במקום טבלה חדשה
//    private List<Cakes> lCakes;
}
