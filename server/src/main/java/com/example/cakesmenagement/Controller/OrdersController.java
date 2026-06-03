package com.example.cakesmenagement.Controller;

import com.example.cakesmenagement.Entities.Orders;
import com.example.cakesmenagement.Service.AdminService;
import com.example.cakesmenagement.Service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrdersController {

    @Autowired
    private ClientService clientService;

    @Autowired
    private AdminService adminService;

    @PostMapping("/add")
    public Orders addOrder(@RequestBody Orders order) {
        return clientService.addOrder(order);
    }

    @GetMapping("/{id}")
    public Optional<Orders> getById(@PathVariable int id) {
        return clientService.getOrdersById(id);
    }

    @GetMapping("/admin/all")
    public List<Orders> getAllForAdmin() {
        return adminService.getAllOrders();
    }

    @PatchMapping("/admin/status/{id}")
    public void updateStatus(@PathVariable int id, @RequestParam String status) {
        adminService.updateOrderStatusWithStr(id, status);
    }

    @GetMapping("/admin/by-date")
    public List<Orders> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return adminService.getOrderByDate(date);
    }

    @PutMapping("/admin/update/{id}")
    public void updateOrder(@PathVariable int id, @Valid @RequestBody Orders order) {
        adminService.updateOrder(id, order);
    }

    // ✅ התיקון הקריטי: הוצאנו את המילה /admin/ מהנתיב כדי שלקוחות יוכלו לצפות בהזמנות שלהם ללא שגיאת 403!
    @GetMapping("/user/{userId}")
    public List<Orders> getByUser(@PathVariable int userId) {
        return adminService.getOrdersByUserCode(userId);
    }

    @DeleteMapping("/admin/{id}")
    public void deleteOrder(@PathVariable int id) {
        adminService.deleteOrder(id);
    }
}