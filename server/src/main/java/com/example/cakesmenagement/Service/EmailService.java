package com.example.cakesmenagement.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // שים לב: true = multipart, חובה לתמונות מוטמעות
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("sweets.boutique.bakery.info@gmail.com");
            helper.setText(htmlContent, true);

            // מצרף את הלוגו כ-CID
            ClassPathResource logo = new ClassPathResource("static/logo (2).png");
            helper.addInline("logoImage", logo);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("שגיאה בשליחת המייל: " + e.getMessage());
        }
    }

    public String buildResetPasswordEmail(String resetLink) {
        return """
            <!DOCTYPE html>
            <html dir="rtl" lang="he">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>איפוס סיסמה</title>
            </head>
            <body style="margin:0; padding:0; background-color:#fce9e8;
                         font-family:'Helvetica Neue', Arial, sans-serif;
                         direction:rtl;">

              <table width="100%%" cellpadding="0" cellspacing="0"
                     style="background-color:#fce9e8; padding:40px 20px;">
                <tr>
                  <td align="center">

                    <table width="560" cellpadding="0" cellspacing="0"
                           style="background-color:#fff5f5;
                                  border-radius:16px;
                                  box-shadow:0 4px 24px rgba(0,0,0,0.08);
                                  overflow:hidden;">

                      <!-- HEADER — לוגו -->
                      <tr>
                        <td align="center"
                            style="background-color:#fce9e8;
                                   padding:32px 40px;
                                   border-bottom:3px solid #d89e5d;">
                          <img src="cid:logoImage"
                               alt="Sweets"
                               style="height:100px; width:auto;"/>
                        </td>
                      </tr>

                      <!-- BODY -->
                      <tr>
                        <td style="padding:40px 48px;">

                          <p style="margin:0 0 8px; font-size:22px;
                                    font-weight:700; color:#3a221a;">
                            שלום 
                          </p>

                          <p style="margin:0 0 24px; font-size:15px;
                                    color:#6b4f3a; line-height:1.7;">
                            קיבלנו בקשה לאיפוס הסיסמה לחשבון שלך.
                            לחץ על הכפתור למטה כדי לבחור סיסמה חדשה.
                          </p>

                          <!-- כפתור איפוס -->
                          <table cellpadding="0" cellspacing="0" width="100%%">
                            <tr>
                              <td align="center" style="padding:8px 0 32px;">
                                <a href="%s"
                                   style="display:inline-block;
                                          background:linear-gradient(135deg,#d89e5d,#be823c);
                                          color:#ffffff; font-size:16px; font-weight:700;
                                          text-decoration:none; padding:14px 40px;
                                          border-radius:50px;
                                          box-shadow:0 4px 16px rgba(216,158,93,0.45);">
                                  איפוס סיסמה &larr;
                                </a>
                              </td>
                            </tr>
                          </table>

                          <!-- הערת תוקף -->
                          <div style="background:#fce9e8;
                                      border-right:3px solid #d89e5d;
                                      border-radius:8px;
                                      padding:14px 16px;
                                      margin-bottom:28px;">
                            <p style="margin:0; font-size:13px; color:#8a6040;">
                              ⏱ הקישור תקף ל-<strong>15 דקות</strong> בלבד.
                              אם לא ביקשת איפוס סיסמה — ניתן להתעלם ממייל זה.
                            </p>
                          </div>

                          <!-- קישור גיבוי -->
                          <p style="margin:0; font-size:12px;
                                    color:#b08060; line-height:1.6;">
                            אם הכפתור לא עובד, העתיק את הקישור הבא לדפדפן:
                            <br/>
                            <a href="%s"
                               style="color:#d89e5d; word-break:break-all;">
                              %s
                            </a>
                          </p>

                        </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                        <td align="center"
                            style="background:#f5dcdc; padding:20px 40px;
                                   border-top:1px solid #e6cdcd;">
                          <p style="margin:0; font-size:12px; color:#a07860;">
                            נאפה באהבה 🤍 | Sweets קונדיטוריה בוטיק
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

            </body>
            </html>
            """.formatted(
                resetLink,
                resetLink,
                resetLink
        );
    }
    // --- 1. מייל לבעלת העסק (מעוצב + פירוט עוגות) ---
    public String buildNewOrderEmailForAdmin(int orderCode, double totalPrice, String customerName, String customerPhone, String itemsHtml) {
        return """
            <!DOCTYPE html>
            <html dir="rtl" lang="he">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body style="margin:0; padding:0; background-color:#fce9e8; font-family:'Helvetica Neue', Arial, sans-serif; direction:rtl;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#fce9e8; padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background-color:#fff5f5; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                      <tr>
                        <td align="center" style="background-color:#fce9e8; padding:32px 40px; border-bottom:3px solid #d89e5d;">
                          <img src="cid:logoImage" alt="Sweets" style="height:100px; width:auto;"/>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:40px 48px;">
                          <p style="margin:0 0 8px; font-size:22px; font-weight:700; color:#3a221a;">
                            הזמנה חדשה התקבלה! 🎉
                          </p>
                          <p style="margin:0 0 24px; font-size:15px; color:#6b4f3a; line-height:1.7;">
                            היי רותי, התקבלה הזמנה חדשה באתר הממתינה לתשלום.
                          </p>
                          <div style="background:#fce9e8; border-right:3px solid #d89e5d; border-radius:8px; padding:14px 16px; margin-bottom:20px;">
                            <p style="margin:0; font-size:15px; color:#8a6040;"><strong>מספר הזמנה:</strong> #%d</p>
                            <p style="margin:0; font-size:15px; color:#8a6040;"><strong>שם הלקוח:</strong> %s</p>
                            <p style="margin:0; font-size:15px; color:#8a6040;"><strong>טלפון (לוואטסאפ):</strong> %s</p>
                            <p style="margin:0; font-size:15px; color:#8a6040;"><strong>סך הכל:</strong> ₪%.2f</p>
                          </div>
                          
                          <h3 style="color: #3a221a; font-size: 16px; border-bottom: 1px solid #d89e5d; padding-bottom: 5px;">פירוט המוצרים:</h3>
                          <table width="100%%" cellpadding="8" cellspacing="0" style="font-size: 14px; color: #555; margin-bottom: 20px;">
                            %s
                          </table>
                          
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(orderCode, customerName, customerPhone, totalPrice, itemsHtml);
    }

    // --- 2. מייל ללקוח (יוקרתי, מרגיע, ומעדכן על יצירת קשר תוך 2 ימי עסקים) ---
    public String buildOrderConfirmationForCustomer(String customerName, double totalPrice) {
        return """
            <!DOCTYPE html>
            <html dir="rtl" lang="he">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body style="margin:0; padding:0; background-color:#fce9e8; font-family:'Helvetica Neue', Arial, sans-serif; direction:rtl;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#fce9e8; padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background-color:#fff5f5; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                      <tr>
                        <td align="center" style="background-color:#fce9e8; padding:32px 40px; border-bottom:3px solid #d89e5d;">
                          <img src="cid:logoImage" alt="Sweets" style="height:100px; width:auto;"/>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:40px 48px;">
                          <p style="margin:0 0 8px; font-size:22px; font-weight:700; color:#3a221a;">
                            תודה על הזמנתך, %s! 🤍
                          </p>
                          <p style="margin:0 0 24px; font-size:15px; color:#6b4f3a; line-height:1.7;">
                            איזה כיף שבחרת ב-Sweets קונדיטוריה בוטיק.<br/>
                            ההזמנה שלך התקבלה בהצלחה בסך ₪%.2f, והיא נמצאת כעת בטיפול.
                          </p>
                          <div style="background:#fce9e8; border-right:3px solid #d89e5d; border-radius:8px; padding:14px 16px; margin-bottom:28px;">
                            <p style="margin:0; font-size:15px; color:#8a6040; line-height:1.6;">
                              <strong>מה קורה עכשיו?</strong><br/>
                              אנו נעבור על פרטי ההזמנה שניצור איתך קשר (בוואטסאפ או בטלפון) בתוך <strong>עד 2 ימי עסקים</strong> לצורך אישור סופי והסדרת התשלום.
                            </p>
                          </div>
                          <p style="margin:0; font-size:14px; color:#b08060;">
                            נשמח לעמוד לרשותך בכל שאלה.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="background:#f5dcdc; padding:20px 40px; border-top:1px solid #e6cdcd;">
                          <p style="margin:0; font-size:12px; color:#a07860;">
                            נאפה באהבה 🤍 | Sweets קונדיטוריה בוטיק
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(customerName, totalPrice);
    }
}