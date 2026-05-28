package com.example.cakesmenagement.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
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
public class Cakes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String description;
    private double price; // מחיר עוגה
    private String ingredients; // מרכיבים
    private String imageUrl; // תמונה
    @ElementCollection
    private List<String> recommendation;
    @JsonProperty("isActive")
    private boolean isActive;// אם העוגה זמינה למכירה
    @ManyToOne
    @JoinColumn(name = "category_code") // מומלץ לתת שם ברור לעמודה
    private Categories category;
}
