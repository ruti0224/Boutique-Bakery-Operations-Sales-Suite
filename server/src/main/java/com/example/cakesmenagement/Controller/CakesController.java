package com.example.cakesmenagement.Controller;

import com.example.cakesmenagement.Dto.RecommendationRequest;
import com.example.cakesmenagement.Entities.Cakes;
import com.example.cakesmenagement.Service.AdminService;
import com.example.cakesmenagement.Service.ClientService;
import com.example.cakesmenagement.Service.CloudinaryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cakes")
public class CakesController {

    @Autowired
    private ClientService clientService;
    @Autowired
    private AdminService adminService;
    @Autowired
    private CloudinaryService cloudinaryService;


    @PostMapping("/admin/add")
    public Cakes addCake(@Valid  @RequestBody Cakes cake) {
        return adminService.addCake(cake);
    }
    @DeleteMapping("/admin/delete/{id}")
    public void deleteCake(@PathVariable int id) {
        adminService.deleteCake(id);
    }

    @PutMapping("/admin/update/{id}")
    public Cakes updateCake(@PathVariable int id, @Valid @RequestBody Cakes cake) {
        return adminService.updateCake(id, cake);
    }

    @GetMapping("/all")
    public List<Cakes> getAll() {
        return clientService.getAllCakes();
    }

    @GetMapping("/search")
    public List<Cakes> getByName(@RequestParam String name) {
        return clientService.getCakesByName(name);
    }
    @PostMapping("/recommend")
    public List<String> addRecommendation(@Valid @RequestBody RecommendationRequest request) {
        // שליפת הנתונים מה-DTO והעברתם לסרוויס
        return clientService.addRecommendation(
                request.getCakeId(),
                request.getText()
        );
    }
    @PostMapping("/admin/upload-image")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        return cloudinaryService.uploadCakeImage(file);
    }
}
