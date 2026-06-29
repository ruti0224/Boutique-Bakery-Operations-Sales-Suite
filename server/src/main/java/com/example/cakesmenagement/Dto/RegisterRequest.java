package com.example.cakesmenagement.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    @NotBlank(message = "שם הוא שדה חובה")
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    @Email(message = "כתובת אימייל לא תקינה")
    @NotBlank(message = "אימייל הוא שדה חובה")
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @NotBlank(message = "סיסמה הוא שדה חובה")
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    @NotBlank(message = "מספר פלאפון הוא שדה חובה")
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}