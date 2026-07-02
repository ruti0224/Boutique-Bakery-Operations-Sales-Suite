package com.example.cakesmenagement.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "שם הוא שדה חובה")
    private String name;

    @NotBlank(message = "אימייל הוא שדה חובה")
    @Email(message = "כתובת אימייל לא תקינה")
    private String email;

    @NotBlank(message = "סיסמה היא שדה חובה")
    @Size(min = 6, message = "הסיסמה חייבת להכיל לפחות 6 תווים")
    private String password;

    @NotBlank(message = "מספר טלפון הוא שדה חובה")
    @Pattern(regexp = "^\\d{10}$", message = "מספר טלפון חייב להכיל בדיוק 10 ספרות")
    private String phoneNumber;

    // --- Getters & Setters --- //

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}