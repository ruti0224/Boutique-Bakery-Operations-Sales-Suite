package com.example.cakesmenagement.Controller;
import com.example.cakesmenagement.Entities.Cakes;
import com.example.cakesmenagement.Entities.Orders;
import com.example.cakesmenagement.Entities.Payments;
import com.example.cakesmenagement.Service.AdminService;
import com.example.cakesmenagement.Service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController // מגדיר את המחלקה כקונטרולר
@RequestMapping("/api/payments") // הכתובת הבסיסית של כל הפעולות כאן
@CrossOrigin
public class PaymentsController {
    @Autowired
    private ClientService clientService;
    @Autowired
    private AdminService adminService;

    @PostMapping("/process")
    public Payments processPayment(@Valid  @RequestBody Payments payment) {
        return clientService.addPayment(payment);
    }

    @GetMapping("/{id}")
    public Payments getPayment(@PathVariable int id) {
        return clientService.getPaymentById(id);
    }

    // --- דו"ח הכנסות (אדמין) ---
    @GetMapping("/admin/revenue")
    public double getRevenue(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        return adminService.getRevenueReport(start, end);
    }
    @DeleteMapping("/admin/{id}")
    public void deletePayment(@PathVariable int id) {
        adminService.deletePayment(id);
    }
}
