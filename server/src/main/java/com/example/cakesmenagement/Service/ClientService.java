package com.example.cakesmenagement.Service;

import com.example.cakesmenagement.Dto.RegisterRequest;
import com.example.cakesmenagement.Entities.*;
import com.example.cakesmenagement.JWT.JwtUtil;
import com.example.cakesmenagement.Repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.HtmlUtils;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.example.cakesmenagement.Entities.Orders.OrderStatus.PAID;
@CrossOrigin(origins = "http://localhost:5173")
@Service
@Transactional
public class ClientService {
    @Autowired
    private UsersRepo usersRepo;
    @Autowired
    private OrdersRepo orderRepo;
    @Autowired
    private CategoriesRepo categoryRepo;
    @Autowired
    private CakesRepo cakeRepo;
    @Autowired
    private PaymentsRepo paymentsRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Users register(RegisterRequest request) {
        if (usersRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        Users u = new Users();
        u.setName(request.getName());
        u.setEmail(request.getEmail());
        u.setPhoneNumber(request.getPhoneNumber());
        u.setPassword(passwordEncoder.encode(request.getPassword()));
        u.setRole("ROLE_USER");
        return usersRepo.save(u);
    }
    @Autowired
    private JwtUtil jwtUtil;


    // הפונקציה החדשה ב-ClientService:
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
    public void updateUser(int id,Users u1) {
        Users user = usersRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("id not exist"));
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("אבטחה: אין לך הרשאה לעדכן פרטים של משתמש אחר!");
        }
        user.setName(u1.getName());
        user.setEmail(u1.getEmail());
        user.setPhoneNumber(u1.getPhoneNumber());
        user.setPassword(u1.getPassword());
        user.setRole(u1.getRole());
        usersRepo.save(user);
    }
    public List<OrderItem> getCart(int id) {
        Users user = usersRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("id not exist"));
        // --- תוספת אבטחה (מניעת IDOR): בדיקה האם מי שביקש הוא באמת בעל העגלה ---
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("אבטחה: אין לך הרשאה לצפות בעגלה של משתמש אחר!");
        }

        return user.getCakesInCart();
    }

    public List<String> addRecommendation(int cakeId, String text) {
        Cakes cake = cakeRepo.findById(cakeId)
                .orElseThrow(() -> new RuntimeException("עוגה לא נמצאה"));
        // --- תוספת אבטחת מידע: ניקוי קוד זדוני (Sanitization) נגד XSS ---
        String safeText = HtmlUtils.htmlEscape(text);
        cake.getRecommendation().add(safeText);
        cakeRepo.save(cake);
        return cake.getRecommendation();
    }
    // בקובץ ה-Service שלך
    public List<OrderItem> addToCart(Cakes cakeFromClient, int userId) {
        // 1. מציאת המשתמש ב-DB
        Users user = usersRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. מציאת העוגה ה"אמיתית" ב-DB (מונע את בעיית ה-Detached Entity)
        Cakes realCake = cakeRepo.findById(cakeFromClient.getId())
                .orElseThrow(() -> new RuntimeException("Cake not found"));

        // 3. יצירת רשימה חדשה אם העגלה ריקה (מונע NullPointerException)
        if (user.getCakesInCart() == null) {
            user.setCakesInCart(new ArrayList<>());
        }

        // 4. בדיקה האם העוגה כבר קיימת בעגלה - אם כן, רק מעדכנים כמות
        OrderItem existingItem = user.getCakesInCart().stream()
                .filter(item -> item.getCake().getId() == realCake.getId())
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + 1);
        } else {
            // 5. אם היא לא קיימת - יצירת פריט חדש
            OrderItem newItem = new OrderItem();
            newItem.setCake(realCake);
            newItem.setQuantity(1);
            user.getCakesInCart().add(newItem);
        }
        usersRepo.save(user);
        return user.getCakesInCart();
    }
    public List<OrderItem> removeFromCart(int cakeId, int userId) {
        // 1. שליפת המשתמש ובדיקה שהוא קיים
        Users user = usersRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("אבטחה: אין לך הרשאה להסיר מעגלה של משתמש אחר!");
        }
        // 2. חיפוש הפריט הספציפי בעגלה לפי ה-ID של העוגה
        OrderItem existingOrderItem = user.getCakesInCart().stream()
                .filter(item -> item.getCake().getId() == cakeId) // וודאי שכאן זה getCode() או getId() לפי הישות Cakes
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cake not found in cart"));
        if (existingOrderItem.getQuantity() > 1) {
            existingOrderItem.setQuantity(existingOrderItem.getQuantity() - 1);
        } else {
            user.getCakesInCart().remove(existingOrderItem);
        }
        usersRepo.save(user);

        return user.getCakesInCart();
    }
    public void addOrder(Orders o) {
        if (o.getNotes() != null) {
            o.setNotes(HtmlUtils.htmlEscape(o.getNotes()));
        }
        if(o.getStatus()!=PAID){
            throw new RuntimeException("you didn't pay");
        }
        if (orderRepo.existsById(o.getOrderCode()))
            throw new RuntimeException("id exist");
        Users user = o.getUser();
        user.getUserOrders().add(o);
        user.getCakesInCart().clear();
        orderRepo.save(o);
        usersRepo.save(user);
    }
    public Optional<Orders> getOrdersById(int userId) {
        if (!usersRepo.existsById(userId))
            throw new RuntimeException("id not exist");
       Optional<Orders> order1= orderRepo.findById(userId);
        return order1;
    }
    public List<Cakes> getCakesByCategory(int categoryCode) {
        return cakeRepo.findByCategory_CategoryCode(categoryCode);
    }
    public List<Cakes> getAllCakes() {
        List<Cakes> lCakes= cakeRepo.findAll();
        return lCakes;
    }
    public List<Cakes> getCakesByName(String name) {
        List<Cakes> lCakes= cakeRepo.findByName(name);
        return lCakes;
    }

    public Payments addPayment(Payments payment) {
        Orders order = orderRepo.findById(payment.getOrder().getOrderCode())
                .orElseThrow(() -> new RuntimeException("הזמנה לא קיימת"));

        // בדיקת אבטחה קריטית! האם הסכום ששולם שווה לסכום ההזמנה?
        if (payment.getAmount() != order.getTotalPrice()) {
            throw new RuntimeException("אבטחה: סכום התשלום אינו תואם לסכום ההזמנה!");
        }

        payment.setOrder(order);
        Payments savedPayment = paymentsRepo.save(payment);
        order.setStatus(PAID);
        orderRepo.save(order);

        return savedPayment;
    }
    public Payments getPaymentById(int id) {
        return paymentsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
    public List<Categories> getAllCategories() {
        return categoryRepo.findAll();
    }


    public Categories findByName(String name) {
        Categories category = categoryRepo.findByName(name);
        if (category == null) {
            return null;
        }
        return category;
    }
}
