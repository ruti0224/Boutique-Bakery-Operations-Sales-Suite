package com.example.cakesmenagement.Controller;
import com.example.cakesmenagement.Entities.Cakes;
import com.example.cakesmenagement.Entities.OrderItem;
import com.example.cakesmenagement.Entities.Users;
import com.example.cakesmenagement.Service.AdminService;
import com.example.cakesmenagement.Service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    @Autowired
    private ClientService clientService;
    @Autowired
    private AdminService adminService;

    @PutMapping("/{id}")
    public void update(@PathVariable int id,@Valid @RequestBody Users user) {
        clientService.updateUser(id, user);
    }

    // --- ניהול סל קניות ---
    @GetMapping("/{id}/cart")
    public List<OrderItem> getCart(@PathVariable int id) {
        return clientService.getCart(id);
    }
    @GetMapping("/{id}")
    public Users getUser(@PathVariable int id) {
        return clientService.getUserById(id);
    }
    @PostMapping("/{id}/cart/add")
    public List<OrderItem> addToCart(@PathVariable int id,@Valid @RequestBody Cakes cake) {
        return clientService.addToCart(cake, id);
    }

    @DeleteMapping("/{userId}/cart/remove/{cakeId}")
    public List<OrderItem> removeFromCart(@PathVariable int userId, @PathVariable int cakeId) {
        return clientService.removeFromCart(cakeId, userId);
    }

    // --- פעולות מנהל על משתמשים ---
    @GetMapping("/admin/all")
    public List<Users> getAllClients() {
        return adminService.getAllClients();
    }

    @DeleteMapping("/admin/{id}")
    public void deleteUser(@PathVariable int id) {
        adminService.deleteUser(id);
    }

}
