package com.example.cakesmenagement.Repositories;

import com.example.cakesmenagement.Entities.Cakes;
import com.example.cakesmenagement.Entities.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface OrdersRepo extends JpaRepository<Orders, Integer> {
    List<Orders> findByOrderDate(LocalDate date);
    List<Orders> findByUser_Code(int userCode);
}
