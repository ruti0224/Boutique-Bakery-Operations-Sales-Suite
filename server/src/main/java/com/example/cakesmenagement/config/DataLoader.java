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
        if (categoriesRepo.count() > 0) {
            return;
        }

        Categories c1 = new Categories();
        c1.setName("עוגות ראווה ומוס");
        categoriesRepo.save(c1);

        Categories c2 = new Categories();
        c2.setName("מאפים צרפתיים");
        categoriesRepo.save(c2);

        Cakes cake1 = new Cakes();
        cake1.setName("טריו מוס שוקולד");
        cake1.setDescription("שלוש שכבות של מוס שוקולד בלגי משובח (מריר, חלב ולבן) על תחתית קראנץ' נוגט.");
        cake1.setPrice(140.0);
        cake1.setActive(true);
        cake1.setIngredients("שוקולד בלגי, שמנת מתוקה, ג'לטין, אגוזי לוז");
        cake1.setImageUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80");
        cake1.setCategory(c1);
        cakesRepo.save(cake1);

        Cakes cake2 = new Cakes();
        cake2.setName("ניו יורק צ'יזקייק תותים");
        cake2.setDescription("עוגת גבינה אפויה עשירה וקרמית בסגנון ניו יורק, בעיטור קולי תות שדה טרי.");
        cake2.setPrice(135.0);
        cake2.setActive(true);
        cake2.setIngredients("גבינת שמנת, ביצים, סוכר, תותים טריים, פירורי ביסקוויט");
        cake2.setImageUrl("https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80");
        cake2.setCategory(c1);
        cakesRepo.save(cake2);

        Cakes cake3 = new Cakes();
        cake3.setName("קרואסון חמאה קלאסי");
        cake3.setDescription("מאפה דפדפים צרפתי מסורתי על בסיס חמאה טהורה, פריך מבחוץ ואוורירי מבפנים.");
        cake3.setPrice(15.0);
        cake3.setActive(true);
        cake3.setIngredients("קמח, חמאה, שמרים, חלב, מלח");
        cake3.setImageUrl("https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80");
        cake3.setCategory(c2);
        cakesRepo.save(cake3);

        System.out.println("--- נתוני המאפייה הוכנסו למסד הנתונים בהצלחה! ---");
    }
}