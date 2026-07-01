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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.example.cakesmenagement.Entities.Orders.OrderStatus.PAID;

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
    @Autowired
    private EmailService emailService;

    public Users register(RegisterRequest request) {
        if (usersRepo.existsByEmailIgnoreCase(request.getEmail())) {
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


    public String loginAndGetToken(String email, String password) {
        Users user = usersRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("משתמש לא קיים"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("סיסמה שגויה");
        }
        return jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getCode());
    }
    public Users getUserById(int id) {
        Users user = usersRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("אבטחה: אין לך הרשאה לצפות בפרטים של משתמש אחר!");
        }
        return user;
    }
    public void updateUser(int id, Users u1) {
        Users user = usersRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("id not exist"));
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("אבטחה: אין לך הרשאה לעדכן פרטים של משתמש אחר!");
        }

        user.setName(u1.getName());
        user.setEmail(u1.getEmail());
        user.setPhoneNumber(u1.getPhoneNumber());
        usersRepo.save(user);
    }

    public void changePassword(int userId, String oldPassword, String newPassword) {
        Users user = usersRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("משתמש לא נמצא"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("הסיסמה הנוכחית שהוזנה שגויה");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
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

    public void generateResetToken(String email) {
        // 1. מחפשים את המשתמש
        Users user = usersRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("משתמש לא נמצא"));

        // 2. מייצרים טוקן אקראי וייחודי
        String token = UUID.randomUUID().toString();

        // 3. שומרים במשתמש ונותנים תוקף של 15 דקות
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        usersRepo.save(user);

        // 4. נדפיס לקונסול את הקישור (בהמשך נחליף את זה בשליחת אימייל אמיתית)
        // הכתובת כאן היא הכתובת של צד הלקוח שלך
        String resetLink = "http://localhost:8081/reset-password?token=" + token;
        emailService.sendEmail(email, "שחזור סיסמה - מאפיית הבוטיק",
                "שלום, כדי לאפס את הסיסמה לחצי על הקישור הבא: " + resetLink);
    }
    public void resetPassword(String token, String newPassword) {
        // 1. מחפשים משתמש שיש לו בדיוק את הטוקן הזה
        Users user = usersRepo.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("קישור לא חוקי או שגוי"));

        // 2. בודקים שהטוקן לא פג תוקף (עברו יותר מ-15 דקות)
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("פג תוקפו של הקישור. אנא בקש קישור חדש.");
        }

        // 3. מעדכנים לסיסמה החדשה (וכמובן מצפינים אותה!)
        user.setPassword(passwordEncoder.encode(newPassword));

        // 4. מוחקים את הטוקן כדי שלא יוכלו להשתמש בו שוב
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        usersRepo.save(user);
    }
    public List<OrderItem> addToCart(Cakes cakeFromClient, int userId) {
        // 1. מציאת המשתמש ב-DB
        Users user = usersRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. בדיקת אבטחה קריטית! האם המשתמש המחובר הוא באמת בעל העגלה?
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("אבטחה: אין לך הרשאה להוסיף מוצרים לעגלה של משתמש אחר!");
        }

        // 3. מציאת העוגה ה"אמיתית" מהמסד כדי לוודא נתונים עדכניים ומניעת אובייקט מנותק
        Cakes realCake = cakeRepo.findById(cakeFromClient.getId())
                .orElseThrow(() -> new RuntimeException("Cake not found"));

        // 4. אתחול הרשימה אם היא ריקה (מונע קריסה במשתמשים חדשים)
        if (user.getCakesInCart() == null) {
            user.setCakesInCart(new ArrayList<>());
        }

        // 5. בדיקה האם העוגה כבר קיימת בעגלה - אם כן, רק מגדילים כמות
        OrderItem existingItem = user.getCakesInCart().stream()
                .filter(item -> item.getCake().getId() == realCake.getId())
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + 1);
        } else {
            // 6. העוגה לא בעגלה - יוצרים פריט חדש
            OrderItem newItem = new OrderItem();
            newItem.setCake(realCake);
            newItem.setQuantity(1);
            user.getCakesInCart().add(newItem);
        }

        // עכשיו, בזכות ה-Cascade, הפקודה הזו גם תשמור את הפריט החדש!
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
    public Orders addOrder(Orders o) {
        if (o.getNotes() != null) {
            o.setNotes(HtmlUtils.htmlEscape(o.getNotes()));
        }

        // מוודאים שמעבירים סטטוס (PAID נחשב 1 כברירת מחדל אצלנו עכשיו)
        if(o.getStatus() == null){
            throw new RuntimeException("you didn't pay");
        }

        // 1. שליפת המשתמש דרך ה-Security Context במקום לסמוך על הדפדפן! (זה הרבה יותר בטוח)
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Users realUser = usersRepo.findByEmailIgnoreCase(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("אבטחה: משתמש לא מחובר או לא נמצא"));

        // 2. משיכת הפריטים ישירות מעגלת המשתמש
        List<OrderItem> cartItems = realUser.getCakesInCart();
        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("העגלה ריקה");
        }

        // 3. חישוב המחיר הכולל בשרת
        double realTotal = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItem item : cartItems) {
            realTotal += (item.getCake().getPrice() * item.getQuantity());

            OrderItem newOrderItem = new OrderItem();
            newOrderItem.setCake(item.getCake());
            newOrderItem.setQuantity(item.getQuantity());
            orderItems.add(newOrderItem);
        }

        o.setTotalPrice(realTotal);
        o.setCakes(orderItems);
        o.setUser(realUser);

        // 4. הוספת ההזמנה למשתמש וניקוי העגלה
        if (realUser.getUserOrders() == null) {
            realUser.setUserOrders(new ArrayList<>());
        }
        realUser.getUserOrders().add(o);
        realUser.getCakesInCart().clear();

        orderRepo.save(o);
        usersRepo.save(realUser);

        return o;
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
