package com.example.cakesmenagement.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.io.UnsupportedEncodingException;
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            logger.info("מתחיל ניסיון שליחת מייל אל: {}", to);
            MimeMessage message = mailSender.createMimeMessage();
            // שים לב: true = multipart, חובה לתמונות מוטמעות
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("sweets.bakery.info@gmail.com", "Sweets קונדיטוריה בוטיק");
            helper.setText(htmlContent, true);

            ClassPathResource logo = new ClassPathResource("static/logo.png");
            helper.addInline("logoImage", logo);

            mailSender.send(message);
            logger.info("המייל נשלח בהצלחה אל: {}", to);
        } catch (UnsupportedEncodingException e) {
            logger.error("שגיאה בקידוד שם השולח: ", e);
        } catch (MessagingException e) {
            logger.error("שגיאה בהרכבת או שליחת המייל (MessagingException): ", e);
        } catch (Exception e) {
            logger.error("שגיאה כללית בשליחת מייל מול שרת Brevo: ", e);
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
          <style>
            @media only screen and (max-width: 600px) {
              .email-container { width: 100%% !important; border-radius: 0 !important; }
              .email-body-padding { padding: 28px 22px !important; }
              .email-header-padding { padding: 24px 20px !important; }
              .email-title { font-size: 19px !important; }
              .email-text { font-size: 14px !important; }
              .email-button { display: block !important; width: 100%% !important;
                               box-sizing: border-box !important; text-align: center !important; }
              .logo-img { height: 70px !important; }
            }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#fce9e8;
                     font-family:'Helvetica Neue', Arial, sans-serif;
                     direction:rtl;">

          <table width="100%%" cellpadding="0" cellspacing="0"
                 style="background-color:#fce9e8; padding:40px 20px;">
            <tr>
              <td align="center">

                <table class="email-container" width="560" cellpadding="0" cellspacing="0"
                       style="width:100%%; max-width:560px;
                              background-color:#fff5f5;
                              border-radius:16px;
                              box-shadow:0 4px 24px rgba(0,0,0,0.08);
                              overflow:hidden;">

                  <tr>
                    <td align="center" class="email-header-padding"
                        style="background-color:#fce9e8;
                               padding:32px 40px;
                               border-bottom:3px solid #d89e5d;">
                      <img src="cid:logoImage" alt="Sweets" class="logo-img"
                           style="height:100px; width:auto; max-width:100%%;"/>
                    </td>
                  </tr>

                  <tr>
                    <td class="email-body-padding" style="padding:40px 48px;">

                      <p class="email-title" style="margin:0 0 8px; font-size:22px;
                                font-weight:700; color:#3a221a;">
                        שלום 
                      </p>

                      <p class="email-text" style="margin:0 0 24px; font-size:15px;
                                color:#6b4f3a; line-height:1.7;">
                        קיבלנו בקשה לאיפוס הסיסמה לחשבון שלך.
                        לחץ על הכפתור למטה כדי לבחור סיסמה חדשה.
                      </p>

                      <table cellpadding="0" cellspacing="0" width="100%%">
                        <tr>
                          <td align="center" style="padding:8px 0 32px;">
                            <a href="%s" class="email-button"
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

                      <div style="background:#fce9e8;
                                  border-right:3px solid #d89e5d;
                                  border-radius:8px;
                                  padding:14px 16px;
                                  margin-bottom:28px;">
                        <p class="email-text" style="margin:0; font-size:13px; color:#8a6040;">
                          ⏱ הקישור תקף ל-<strong>15 דקות</strong> בלבד.
                          אם לא ביקשת איפוס סיסמה — ניתן להתעלם ממייל זה.
                        </p>
                      </div>

                      <p style="margin:0; font-size:12px;
                                color:#b08060; line-height:1.6; word-break:break-all;">
                        אם הכפתור לא עובד, העתיק את הקישור הבא לדפדפן:
                        <br/>
                        <a href="%s" style="color:#d89e5d; word-break:break-all;">
                          %s
                        </a>
                      </p>

                    </td>
                  </tr>

                  <tr>
                    <td align="center" class="email-header-padding"
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
        """.formatted(resetLink, resetLink, resetLink);
    }
    public String buildNewOrderEmailForAdmin(int orderCode, double totalPrice, String customerName, String customerPhone, String itemsHtml) {
        return """
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            @media only screen and (max-width: 600px) {
              .email-container { width: 100%% !important; border-radius: 0 !important; }
              .email-body-padding { padding: 28px 22px !important; }
              .email-header-padding { padding: 24px 20px !important; }
              .email-title { font-size: 19px !important; }
              .email-text { font-size: 14px !important; }
              .logo-img { height: 70px !important; }
            }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#fce9e8; font-family:'Helvetica Neue', Arial, sans-serif; direction:rtl;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#fce9e8; padding:40px 20px;">
            <tr>
              <td align="center">
                <table class="email-container" width="560" cellpadding="0" cellspacing="0"
                       style="width:100%%; max-width:560px; background-color:#fff5f5; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                  <tr>
                    <td align="center" class="email-header-padding" style="background-color:#fce9e8; padding:32px 40px; border-bottom:3px solid #d89e5d;">
                      <img src="cid:logoImage" alt="Sweets" class="logo-img" style="height:100px; width:auto; max-width:100%%;"/>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-body-padding" style="padding:40px 48px;">
                      <p class="email-title" style="margin:0 0 8px; font-size:22px; font-weight:700; color:#3a221a;">
                        הזמנה חדשה התקבלה! 🎉
                      </p>
                      <p class="email-text" style="margin:0 0 24px; font-size:15px; color:#6b4f3a; line-height:1.7;">
                        היי אפרת, התקבלה הזמנה חדשה באתר הממתינה לתשלום.
                      </p>
                      <div style="background:#fce9e8; border-right:3px solid #d89e5d; border-radius:8px; padding:14px 16px; margin-bottom:20px;">
                        <p class="email-text" style="margin:0; font-size:15px; color:#8a6040;"><strong>מספר הזמנה:</strong> #%d</p>
                        <p class="email-text" style="margin:0; font-size:15px; color:#8a6040;"><strong>שם הלקוח:</strong> %s</p>
                        <p class="email-text" style="margin:0; font-size:15px; color:#8a6040;"><strong>טלפון (לוואטסאפ):</strong> %s</p>
                        <p class="email-text" style="margin:0; font-size:15px; color:#8a6040;"><strong>סך הכל:</strong> ₪%.2f</p>
                      </div>

                      <h3 class="email-text" style="color: #3a221a; font-size: 16px; border-bottom: 1px solid #d89e5d; padding-bottom: 5px;">פירוט המוצרים:</h3>
                      <table width="100%%" cellpadding="8" cellspacing="0" class="email-text" style="font-size: 14px; color: #555; margin-bottom: 20px;">
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
    public String buildOrderConfirmationForCustomer(String customerName, double totalPrice) {
        return """
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            @media only screen and (max-width: 600px) {
              .email-container { width: 100%% !important; border-radius: 0 !important; }
              .email-body-padding { padding: 28px 22px !important; }
              .email-header-padding { padding: 24px 20px !important; }
              .email-title { font-size: 19px !important; }
              .email-text { font-size: 14px !important; }
              .logo-img { height: 70px !important; }
            }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#fce9e8; font-family:'Helvetica Neue', Arial, sans-serif; direction:rtl;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#fce9e8; padding:40px 20px;">
            <tr>
              <td align="center">
                <table class="email-container" width="560" cellpadding="0" cellspacing="0"
                       style="width:100%%; max-width:560px; background-color:#fff5f5; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                  <tr>
                    <td align="center" class="email-header-padding" style="background-color:#fce9e8; padding:32px 40px; border-bottom:3px solid #d89e5d;">
                      <img src="cid:logoImage" alt="Sweets" class="logo-img" style="height:100px; width:auto; max-width:100%%;"/>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-body-padding" style="padding:40px 48px;">
                      <p class="email-title" style="margin:0 0 8px; font-size:22px; font-weight:700; color:#3a221a;">
                        תודה על הזמנתך, %s! 🤍
                      </p>
                      <p class="email-text" style="margin:0 0 24px; font-size:15px; color:#6b4f3a; line-height:1.7;">
                        איזה כיף שבחרת ב-Sweets קונדיטוריה בוטיק.<br/>
                        ההזמנה שלך התקבלה בהצלחה בסך ₪%.2f, והיא נמצאת כעת בטיפול.
                      </p>
                      <div style="background:#fce9e8; border-right:3px solid #d89e5d; border-radius:8px; padding:14px 16px; margin-bottom:28px;">
                        <p class="email-text" style="margin:0; font-size:15px; color:#8a6040; line-height:1.6;">
                          <strong>מה קורה עכשיו?</strong><br/>
                          אנו נעבור על פרטי ההזמנה שניצור איתך קשר (בוואטסאפ או בטלפון) בתוך <strong>עד 2 ימי עסקים</strong> לצורך אישור סופי והסדרת התשלום.
                        </p>
                      </div>
                      <p class="email-text" style="margin:0; font-size:14px; color:#b08060;">
                        נשמח לעמוד לרשותך בכל שאלה.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" class="email-header-padding" style="background:#f5dcdc; padding:20px 40px; border-top:1px solid #e6cdcd;">
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
    public String buildContactEmail(String name, String email, String message) {
        return """
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            @media only screen and (max-width: 600px) {
              .email-container { width: 100%% !important; border-radius: 0 !important; }
              .email-body-padding { padding: 28px 22px !important; }
              .email-header-padding { padding: 24px 20px !important; }
              .email-title { font-size: 19px !important; }
              .email-text { font-size: 14px !important; }
              .logo-img { height: 70px !important; }
            }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#fce9e8; font-family:'Helvetica Neue', Arial, sans-serif; direction:rtl;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#fce9e8; padding:40px 20px;">
            <tr><td align="center">
              <table class="email-container" width="560" cellpadding="0" cellspacing="0"
                     style="width:100%%; max-width:560px; background-color:#fff5f5; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                <tr>
                  <td align="center" class="email-header-padding" style="background-color:#fce9e8; padding:32px 40px; border-bottom:3px solid #d89e5d;">
                    <img src="cid:logoImage" alt="Sweets" class="logo-img" style="height:100px; width:auto; max-width:100%%;"/>
                  </td>
                </tr>
                <tr>
                  <td class="email-body-padding" style="padding:40px 48px;">
                    <p class="email-title" style="margin:0 0 8px; font-size:22px; font-weight:700; color:#3a221a;">פנייה חדשה מהאתר 📩</p>
                    <div style="background:#fce9e8; border-right:3px solid #d89e5d; border-radius:8px; padding:14px 16px; margin-bottom:20px;">
                      <p class="email-text" style="margin:0; font-size:15px; color:#8a6040; word-break:break-word;"><strong>שם:</strong> %s</p>
                      <p class="email-text" style="margin:0; font-size:15px; color:#8a6040; word-break:break-word;"><strong>אימייל:</strong> %s</p>
                    </div>
                    <p class="email-text" style="margin:0 0 8px; font-size:15px; color:#6b4f3a; line-height:1.7; word-break:break-word;">%s</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(name, email, message);
    }
}