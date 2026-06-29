package com.example.cakesmenagement.Controller;


import com.example.cakesmenagement.Entities.Cakes;
import com.example.cakesmenagement.Entities.Categories;
import com.example.cakesmenagement.Repositories.CategoriesRepo;
import com.example.cakesmenagement.Service.AdminService;
import com.example.cakesmenagement.Service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // מגדיר את המחלקה כקונטרולר
@RequestMapping("/api/categories") // הכתובת הבסיסית של כל הפעולות כאן
public class CategoriesController {
    @Autowired
    private AdminService adminService;
    @Autowired
    private ClientService clientService;
    @Autowired
    private CategoriesRepo categoriesRepo;

    @GetMapping
    public List<Categories> getAll() {
        return clientService.getAllCategories();
    }
    @PostMapping("/admin/add")
    public Categories add(@Valid  @RequestBody Categories category) {
        return adminService.addCategory(category);
    }
    @PutMapping("/admin/update/{id}")
    public void update(@PathVariable int id, @RequestParam String newName) {
        adminService.updateCategoryName(id, newName);
    }
    @DeleteMapping("/admin/delete/{id}")
    public void delete(@PathVariable int id) {
        adminService.deleteCategory(id);
    }
    @GetMapping("/category/{catName}")
    public List<Cakes> getByCat(@PathVariable String catName) {
        Categories c=clientService.findByName(catName);
        return clientService.getCakesByCategory(c.getCategoryCode());
    }

}
