package com.example.cakesmenagement.Repositories;

import com.example.cakesmenagement.Entities.Payments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentsRepo extends JpaRepository<Payments, Integer> {
    List<Payments> findByPaymentDateBetween(LocalDate start, LocalDate end);
}
