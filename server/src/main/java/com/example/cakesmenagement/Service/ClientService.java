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
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.example.cakesmenagement.security.TokenBlacklistService;
import com.example.cakesmenagement.Dto.AuthResponse;
import com.example.cakesmenagement.Dto.RegisterRequest;
import java.util.Collections;
import java.util.UUID;
import static com.example.cakesmenagement.Entities.Orders.OrderStatus.PAID;
import static com.example.cakesmenagement.Entities.Orders.OrderStatus.PENDING_PAYMENT;

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
    @Autowired
    private RateLimitingService rateLimitingService;
    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private JwtUtil jwtUtil;

    public Users register(RegisterRequest request) {
        rateLimitingService.checkRateLimit();
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

    public String loginAndGetToken(String email, String password) {
        Users user = usersRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("משתמש לא קיים"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("סיסמה שגויה");
        }
        return jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getCode());
    }

    // הוסיפי את ה-Imports הללו בראש קובץ ה-ClientService:


    // הוסיפי את ההזרקה הזו בתוך המחלקה:



    // 1️⃣ מתודת הרשמה מובנית המבצעת Auto-Login ומחזירה ישר AuthResponse
    public AuthResponse registerAndGetToken(RegisterRequest request) {
        // קריאה למתודת הרישום הקיימת והנקייה שלך שכבר שומרת ב-DB
        Users registeredUser = this.register(request);

        // הפקת טוקן מיידית עבור המשתמש החדש ללא צורך במסך התחברות נוסף
        String token = jwtUtil.generateToken(registeredUser.getEmail(),registeredUser.getRole(), registeredUser.getCode());
        return new AuthResponse(token);
    }

    // 2️⃣ מנגנון Logout - רישום הטוקן ברשימה השחורה לפסילה מיידית
    public void logout(String token) {
        tokenBlacklistService.blacklistToken(token);
    }

    // 3️⃣ לוגיקת אימות ורישום מול גוגל (OAuth2 Login)
    public AuthResponse loginWithGoogle(String googleToken) {
        try {
            // בניית המאמת הרשמי של גוגל
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    // החליפי את המחרוזת למטה ב-Client ID האמיתי שקיבלת מה-Google Developer Console שלך
                    .setAudience(Collections.singletonList("314706987398-npml3p0mgbnq08bp09921gl2rqkgmd73.apps.googleusercontent.com"))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleToken);
            if (idToken == null) {
                throw new RuntimeException("טוקן גוגל אינו תקין או פג תוקף");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail().toLowerCase();
            String name = (String) payload.get("name");

            // בדיקה האם המשתמש כבר קיים במערכת (לפי אימייל)
            Users user = usersRepo.findByEmailIgnoreCase(email).orElseGet(() -> {
                // אם המשתמש לא קיים - נרשום אותו אוטומטית בפעם הראשונה
                Users newUser = new Users();
                newUser.setEmail(email);
                newUser.setName(name);
                newUser.setRole("ROLE_USER");
                // יצירת סיסמה אקראית מאובטחת (הוא תמיד יתחבר דרך גוגל)
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                return usersRepo.save(newUser);
            });

            // הפקת טוקן JWT פנימי של האפליקציה שלך עבור המשתמש המאומת
            String systemToken = jwtUtil.generateToken(user.getEmail(),user.getRole(),user.getCode());
            return new AuthResponse(systemToken);

        } catch (Exception e) {
            throw new RuntimeException("שגיאה בתהליך אימות ה-Google Auth: " + e.getMessage());
        }
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
        if (user.getResetToken() != null &&
                user.getResetTokenExpiry() != null &&
                user.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
            throw new RuntimeException(
                    "נשלח כבר קישור לאיפוס סיסמה. יש להמתין 15 דקות לפני שליחה נוספת."
            );
        }
        // 2. מייצרים טוקן אקראי וייחודי
        String token = UUID.randomUUID().toString();

        // 3. שומרים במשתמש ונותנים תוקף של 15 דקות
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        usersRepo.save(user);

        // הכתובת כאן היא הכתובת של צד הלקוח שלך
        String resetLink = "http://localhost:8081/reset-password?token=" + token;

        emailService.sendEmail(
                email,
                "איפוס סיסמה — Sweets",
                emailService.buildResetPasswordEmail(resetLink)
        );

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
        // הגנת בוטים: עצירת הפעולה אם ה-IP הזה ביצע יותר מ-5 הזמנות בחצי שעה האחרונה
        rateLimitingService.checkRateLimit();

        if (o.getNotes() != null) {
            o.setNotes(HtmlUtils.htmlEscape(o.getNotes()));
        }

        o.setStatus(PENDING_PAYMENT);
        // 1. שליפת המשתמש (כבר קיים אצלך)
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Users realUser = usersRepo.findByEmailIgnoreCase(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("אבטחה: משתמש לא מחובר או לא נמצא"));

        // --- הגנת אנטי-ספאם 1: חסימת ריבוי הזמנות ממתינות לתשלום ---
        if (realUser.getUserOrders() != null) {
            long pendingOrdersCount = realUser.getUserOrders().stream()
                    .filter(order -> order.getStatus() == PENDING_PAYMENT)
                    .count();

            // אם למשתמש יש כבר 2 הזמנות שלא שולמו, נחסום אותו מלעשות עוד אחת
            if (pendingOrdersCount >= 2) {
                throw new RuntimeException("מטעמי אבטחה: יש לך כבר הזמנות הממתינות לתשלום. אנא הסדר תשלום מול העסק לפני ביצוע הזמנה חדשה.");
            }
        }
        // -------------------------------------------------------------
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

        // 5. שמירה במסד הנתונים
        Orders savedOrder = orderRepo.save(o);
        usersRepo.save(realUser);

        // 6. בניית פירוט העוגות עבור המייל למנהלת
        StringBuilder itemsHtml = new StringBuilder();
        for (OrderItem item : orderItems) {
            itemsHtml.append(String.format("<tr><td style='border-bottom: 1px solid #eee;'>%s</td><td style='border-bottom: 1px solid #eee; text-align: left;'>כמות: %d</td></tr>",
                    item.getCake().getName(), item.getQuantity()));
        }

        // 7. שליחת מייל לבעלת העסק
        String adminEmail = "sweets.bakery.info@gmail.com";
        String customerName = realUser.getName();
        String customerPhone = realUser.getPhoneNumber() != null ? realUser.getPhoneNumber() : "לא הוזן";

        String adminContent = emailService.buildNewOrderEmailForAdmin(
                savedOrder.getOrderCode(),
                savedOrder.getTotalPrice(),
                customerName,
                customerPhone,
                itemsHtml.toString() // העברת פירוט העוגות
        );
        emailService.sendEmail(adminEmail, "הזמנה חדשה באתר! (#" + savedOrder.getOrderCode() + ")", adminContent);

        // 8. שליחת מייל ללקוח (נשאר כפי שהיה - ללא מספר הזמנה וללא פירוט)
        String customerEmail = realUser.getEmail();
        String customerContent = emailService.buildOrderConfirmationForCustomer(
                customerName,
                savedOrder.getTotalPrice()
        );
        emailService.sendEmail(customerEmail, "אישור הזמנה — Sweets", customerContent);

        return savedOrder;
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
