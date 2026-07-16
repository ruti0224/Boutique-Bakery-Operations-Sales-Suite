package com.example.cakesmenagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenPairDto {
    private String accessToken;
    private String refreshToken;
}