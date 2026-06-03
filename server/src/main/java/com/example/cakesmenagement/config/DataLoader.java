package com.example.cakesmenagement.config;

import com.example.cakesmenagement.Entities.Categories;
import com.example.cakesmenagement.Entities.Cakes;
import com.example.cakesmenagement.Repositories.CategoriesRepo;
import com.example.cakesmenagement.Repositories.CakesRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final CategoriesRepo categoriesRepo;
    private final CakesRepo cakesRepo;

    public DataLoader(CategoriesRepo categoriesRepo, CakesRepo cakesRepo) {
        this.categoriesRepo = categoriesRepo;
        this.cakesRepo = cakesRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // אם כבר יש קטגוריות, לא נעשה כלום כדי לא לשכפל
        if (categoriesRepo.count() > 0) {
            return;
        }

        // --- 1. יצירת 5 קטגוריות ---
        Categories c1 = new Categories(); c1.setName("עוגות ראווה ומוס"); categoriesRepo.save(c1);
        Categories c2 = new Categories(); c2.setName("מאפים צרפתיים"); categoriesRepo.save(c2);
        Categories c3 = new Categories(); c3.setName("עוגיות ומקרונים"); categoriesRepo.save(c3);
        Categories c4 = new Categories(); c4.setName("טארטים ופאי"); categoriesRepo.save(c4);
        Categories c5 = new Categories(); c5.setName("עוגות חגיגיות"); categoriesRepo.save(c5);

        // --- 2. הכנסת מוצרים מדהימים עם תמונות ---

        // מוצר 1
        Cakes cake1 = new Cakes();
        cake1.setName("טריו מוס שוקולד");
        cake1.setDescription("שלוש שכבות של מוס שוקולד בלגי משובח (מריר, חלב ולבן) על תחתית קראנץ' נוגט.");
        cake1.setPrice(140.0);
        cake1.setActive(true);
        cake1.setIngredients("שוקולד בלגי, שמנת מתוקה, ג'לטין, אגוזי לוז, פייטה פויטין");
        cake1.setImageUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80");
        cake1.setCategory(c1);
        cakesRepo.save(cake1);

        // מוצר 2
        Cakes cake2 = new Cakes();
        cake2.setName("ניו יורק צ'יזקייק תותים");
        cake2.setDescription("עוגת גבינה אפויה עשירה וקרמית בסגנון ניו יורק, בעיטור קולי תות שדה טרי.");
        cake2.setPrice(135.0);
        cake2.setActive(true);
        cake2.setIngredients("גבינת שמנת, ביצים, סוכר, תותים טריים, חמאה, פירורי ביסקוויט");
        cake2.setImageUrl("https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80");
        cake2.setCategory(c1);
        cakesRepo.save(cake2);

        // מוצר 3
        Cakes cake3 = new Cakes();
        cake3.setName("קרואסון חמאה קלאסי");
        cake3.setDescription("מאפה דפדפים צרפתי מסורתי על בסיס חמאה טהורה, פריך מבחוץ ואוורירי מבפנים.");
        cake3.setPrice(15.0);
        cake3.setActive(true);
        cake3.setIngredients("קמח מיוחד למאפים, חמאה 82%, שמרים, חלב, סוכר, מלח");
        cake3.setImageUrl("https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80");
        cake3.setCategory(c2);
        cakesRepo.save(cake3);

        // מוצר 4
        Cakes cake4 = new Cakes();
        cake4.setName("מארז מקרונים פריזאי (12 יח')");
        cake4.setDescription("מארז מהודר של עוגיות מקרון שקדים במגוון טעמים: פיסטוק, פטל, קרמל מלוח ושוקולד.");
        cake4.setPrice(65.0);
        cake4.setActive(true);
        cake4.setIngredients("קמח שקדים, חלבונים, סוכר, מחית פיסטוק, מחית פטל, גאנש שוקולד");
        cake4.setImageUrl("https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&q=80");
        cake4.setCategory(c3);
        cakesRepo.save(cake4);

        // מוצר 5
        Cakes cake5 = new Cakes();
        cake5.setName("טארט לימון מרנג");
        cake5.setDescription("קלתית בצק פריך שקדים, מילוי קרם לימון חמצמץ-מתוק וכיפת מרנג איטלקי חרוך.");
        cake5.setPrice(120.0);
        cake5.setActive(true);
        cake5.setIngredients("קמח, חמאה, שקדים טחונים, מיץ וגרידת לימון טרי, ביצים, סוכר");
        cake5.setImageUrl("https://images.unsplash.com/photo-1519869325930-281384150729?w=500&q=80");
        cake5.setCategory(c4);
        cakesRepo.save(cake5);

        // מוצר 6
        Cakes cake6 = new Cakes();
        cake6.setName("עוגת היער השחור (קלאסית)");
        cake6.setDescription("עוגת יום הולדת גרמנית מפורסמת: שכבות ספוג קקאו, קצפת עשירה, דובדבני אמרנה ושוקולד מגורד.");
        cake6.setPrice(160.0);
        cake6.setActive(true);
        cake6.setIngredients("קמח, קקאו איכותי, שמנת מתוקה, דובדבנים חמוצים, קירש, שוקולד מריר");
        cake6.setImageUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80");
        cake6.setCategory(c5);
        cakesRepo.save(cake6);

        // מוצר 7
        Cakes cake7 = new Cakes();
        cake7.setName("פחזניות קרם פטיסייר (מארז 6)");
        cake7.setDescription("בצק רבוך אוורירי במילוי נדיב של קרם פטיסייר וניל אמיתי מגרגרי מקל וניל ממדגסקר.");
        cake7.setPrice(45.0);
        cake7.setActive(true);
        cake7.setIngredients("מים, חמאה, קמח, ביצים, חלב, חלמונים, קורנפלור, מקל וניל");
        cake7.setImageUrl("https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=500&q=80");
        cake7.setCategory(c2);
        cakesRepo.save(cake7);

        // מוצר 8
        Cakes cake8 = new Cakes();
        cake8.setName("עוגיות שוקולד צ'יפס אמסטרדם (מארז 5)");
        cake8.setDescription("העוגיות המפורסמות מאמסטרדם! עוגיות קקאו נימוחות מבפנים עם ליבת שוקולד לבן נמס.");
        cake8.setPrice(50.0);
        cake8.setActive(true);
        cake8.setIngredients("קמח, קקאו, סוכר חום, חמאה, ביצים, שוקולד לבן, אבקת אפייה");
        cake8.setImageUrl("https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80");
        cake8.setCategory(c3);
        cakesRepo.save(cake8);

        System.out.println("--- נתוני המאפייה (8 מוצרים, 5 קטגוריות) הוכנסו למסד הנתונים בהצלחה! ---");
    }
}