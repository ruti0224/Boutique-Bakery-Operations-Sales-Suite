package com.example.cakesmenagement.Service;

import com.example.cakesmenagement.Entities.*;
import com.example.cakesmenagement.JWT.JwtUtil;
import com.example.cakesmenagement.Repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.example.cakesmenagement.Entities.Orders.OrderStatus.PAID;
import static com.example.cakesmenagement.Entities.Payments.PaymentStatus.SUCCESS;

@CrossOrigin(origins = "http://localhost:5173")
@Service
@Transactional
public class AdminService {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsersRepo usersRepo;
    @Autowired
    private CakesRepo cakesRepo;
    @Autowired
    private OrdersRepo orderRepo;
    @Autowired
    private PaymentsRepo paymentsRepo;
    @Autowired
    private CategoriesRepo categoryRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public String loginAndGetToken(String email, String password) {
        // 1. מחפשים משתמש
        Users user = usersRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("משתמש לא קיים"));

        // 2. בודקים סיסמה
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("סיסמה שגויה");
        }

        // 3. מייצרים ומחזירים את הטוקן
        return jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getCode());
    }
    public void deleteUser(int id) {
        Users user = usersRepo.findById(id)
                .orElseThrow(()-> new RuntimeException("id not exist"));

        usersRepo.delete(user);
    }
    public List<Users> getAllClients() {
        List <Users>  list= usersRepo.findAll();
        if (list.isEmpty())
            throw  new RuntimeException("there are no users");
        return list;
    }
    public List<Orders> getAllOrders() {
        List<Orders> allOrders= orderRepo.findAll();
        return allOrders.stream()
                .filter(order -> order.getStatus() != Orders.OrderStatus.CANCELLED)
                .collect(Collectors.toList());
    }
    public void deleteOrder(int id) {
        Orders order = orderRepo.findById(id)
                .orElseThrow(()-> new RuntimeException("id not exist"));
        orderRepo.delete(order);
    }
    public void addOrder(Orders o) {
        if (orderRepo.existsById(o.getOrderCode()))
            throw new RuntimeException("id exist");
        orderRepo.save(o);
    }
    public void updateOrder(int id, Orders updatedOrder) {

        Orders existingOrder = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("id not exist"));
        existingOrder.setUser(updatedOrder.getUser());
        existingOrder.setOrderDate(updatedOrder.getOrderDate());
        existingOrder.setDeliveryDate(updatedOrder.getDeliveryDate());
        existingOrder.setTotalPrice(updatedOrder.getTotalPrice());
        existingOrder.setStatus(updatedOrder.getStatus());
        existingOrder.setNotes(updatedOrder.getNotes());
        existingOrder.setCakes(updatedOrder.getCakes());
        orderRepo.save(existingOrder);
    }
    public List<Orders> getOrderByDate(LocalDate date) {
        List<Orders> orders = orderRepo.findByOrderDate(date);
        if (orders.isEmpty()) {
            throw new RuntimeException("No orders found for this date");
        }
        return orders;
    }
    public List<Orders> getOrdersByUserCode(int userId) {
        List<Orders> orders = orderRepo.findByUser_Code(userId);
        if (orders.isEmpty()) {
            System.out.println("No orders found for user code: " + userId);
        }
        return orders;
    }
    public double getRevenueReport(LocalDate start, LocalDate end) {
        // 1. שליפת רשימת התשלומים מהרפוזיטורי
        List<Payments> payments = paymentsRepo.findByPaymentDateBetween(start, end);
        double total = payments.stream()
                .filter(p -> SUCCESS==p.getPaymentStatus())
                .mapToDouble(p -> p.getAmount())
                .sum();

        return total;
    }
    public void updateOrderStatus(int orderId, Orders.OrderStatus newStatus) {
        // 1. מציאת ההזמנה
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("הזמנה לא נמצאה"));
        order.setStatus(newStatus);
        orderRepo.save(order);
    }
    public Categories addCategory(Categories category) {
        if (categoryRepo.existsById(category.getCategoryCode())) { // בהנחה ש-Name הוא ה-ID
            throw new RuntimeException("קטגוריה בשם זה כבר קיימת");
        }
        return categoryRepo.save(category);
    }
    public void updateCategoryName(int id, String newName) {
        Categories category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("קטגוריה לא נמצאה"));
        category.setName(newName);
        categoryRepo.save(category);
    }

    public void deleteCategory(int id) {
        if (!categoryRepo.existsById(id)) {
            throw new RuntimeException("לא ניתן למחוק: קטגוריה לא קיימת");
        }
        categoryRepo.deleteById(id);
    }
    public Cakes addCake(Cakes cake) {
        if (cakesRepo.existsById(cake.getId())) {
            throw new RuntimeException("עוגה עם קוד זה כבר קיימת במערכת");
        }
        Cakes savedCake = cakesRepo.save(cake);
        return savedCake;
    }
    public void deleteCake(int id) {
        if (!cakesRepo.existsById(id)) {
            throw new RuntimeException("לא ניתן למחוק: עוגה לא קיימת");
        }
        cakesRepo.deleteById(id);
    }

    // עדכון פרטי עוגה קיימת
    public Cakes updateCake(int id, Cakes updatedCake) {
        Cakes existingCake = cakesRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("עוגה לא נמצאה לעדכון"));

        existingCake.setName(updatedCake.getName());
        existingCake.setPrice(updatedCake.getPrice());
        existingCake.setDescription(updatedCake.getDescription());
        existingCake.setImageUrl(updatedCake.getImageUrl());
        existingCake.setIngredients(updatedCake.getIngredients());
        existingCake.setActive(updatedCake.isActive());

        return cakesRepo.save(existingCake);
    }
    public void deletePayment(int id) {
        if (!paymentsRepo.existsById(id)) {
            throw new RuntimeException("Payment not found");
        }
        paymentsRepo.deleteById(id);
    }

}
