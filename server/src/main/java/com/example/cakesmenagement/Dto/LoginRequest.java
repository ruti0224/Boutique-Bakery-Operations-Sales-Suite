package com.example.cakesmenagement.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "אימייל הוא שדה חובה")
    @Email(message = "כתובת אימייל לא תקינה")
    private String email;
    @NotBlank(message = "סיסמה הוא שדה חובה")
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
