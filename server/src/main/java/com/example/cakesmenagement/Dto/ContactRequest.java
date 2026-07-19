package com.example.cakesmenagement.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequest {
    @NotBlank(message = "שם הוא שדה חובה")
    @Size(max = 100, message = "שם ארוך מדי")
    private String name;

    @NotBlank(message = "אימייל הוא שדה חובה")
    @Email(message = "כתובת אימייל לא תקינה")
    private String email;

    @NotBlank(message = "הודעה היא שדה חובה")
    @Size(max = 1000, message = "ההודעה ארוכה מדי (עד 1000 תווים)")
    private String message;
}