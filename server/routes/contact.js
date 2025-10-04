const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting для формы обратной связи
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 сообщений с одного IP за 15 минут
  message: {
    error: 'Слишком много сообщений. Попробуйте позже.'
  }
});

// Настройка nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password' // App Password, не обычный пароль!
  }
});

// Валидация данных формы
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя должно содержать от 2 до 100 символов'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Некорректный email адрес'),
  body('message')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Сообщение должно содержать от 5 до 1000 символов')
];

// POST /api/contact - отправка формы обратной связи
router.post('/', contactLimiter, contactValidation, async (req, res) => {
  try {
    console.log('📨 Получены данные формы:', req.body);
    
    // Проверка валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Ошибки валидации:', errors.array());
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const { name, email, message } = req.body;

    // Настройка письма
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: 'aborisov@sfedu.ru',
      subject: 'Сайт InterView',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
            Новое сообщение с сайта InterView
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4f46e5; margin-top: 0;">Информация о отправителе:</h3>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #4f46e5; margin-top: 0;">Сообщение:</h3>
            <p style="line-height: 1.6; color: #374151;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; font-size: 12px; color: #6b7280;">
            <p>Это сообщение отправлено с сайта InterView (http://localhost:3000)</p>
            <p>Время отправки: ${new Date().toLocaleString('ru-RU')}</p>
          </div>
        </div>
      `,
      text: `
Новое сообщение с сайта InterView

Информация о отправителе:
Имя: ${name}
Email: ${email}

Сообщение:
${message}

---
Это сообщение отправлено с сайта InterView (http://localhost:3000)
Время отправки: ${new Date().toLocaleString('ru-RU')}
      `
    };

    // Отправка письма
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Письмо отправлено от ${name} (${email}) на aborisov@sfedu.ru`);
    console.log(`📧 Тема: Сайт InterView`);
    console.log(`📝 Сообщение: ${message}`);
    console.log(`🔗 Message ID: ${info.messageId}`);

    res.json({
      success: true,
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.'
    });

  } catch (error) {
    console.error('❌ Ошибка отправки письма:', error);
    
    res.status(500).json({
      error: 'Ошибка отправки сообщения',
      message: 'Произошла ошибка при отправке сообщения. Попробуйте позже или свяжитесь с нами напрямую.'
    });
  }
});

// GET /api/contact - проверка доступности формы
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Форма обратной связи доступна',
    email: 'aborisov@sfedu.ru'
  });
});

module.exports = router;
