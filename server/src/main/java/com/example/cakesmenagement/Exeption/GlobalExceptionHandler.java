package com.example.cakesmenagement.Exeption;
import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // תופס את כל השגיאות היזומות שזרקת מה-Services עם throw new RuntimeException
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeExceptions(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage()); // מחזיר בדיוק את הטקסט שכתבת ב-Service
    }

    // תופס שגיאות של ולידציה (למשל כשחסר @NotBlank או שהאימייל לא תקין)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // שולף את הודעת השגיאה הראשונה שהוגדרה ב-Entity (למשל "שם הוא שדה חובה")
        String errorMessage = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorMessage);
    }
    // הפונקציה הזו תופעל אוטומטית בכל פעם שיש בעיה מול מסד הנתונים (למשל השרת נפל)
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<String> handleDatabaseExceptions(DataAccessException ex) {
        // כאן גם נהוג להדפיס ללוג את השגיאה האמיתית למפתח
        // log.error("Database error occurred", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("אירעה שגיאה פנימית בעת הגישה לנתונים. אנא נסה שנית מאוחר יותר.");
    }

    // רשת ביטחון כללית - תופסת כל שגיאה אחרת שלא הוגדרה מראש
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralExceptions(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("אירעה שגיאה בלתי צפויה.");
    }
}
