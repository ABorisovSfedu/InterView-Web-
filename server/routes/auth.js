const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Валидация для регистрации
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Некорректный email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов'),
  body('plan')
    .optional()
    .isIn(['basic', 'pro', 'premium'])
    .withMessage('Некорректный план подписки')
];

// Валидация для входа
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Некорректный email'),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
];

// Регистрация пользователя
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const { email, password, name, plan = 'basic' } = req.body;

    const user = await User.create(email, password, name, plan);
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    
    if (error.message === 'Пользователь с таким email уже существует') {
      return res.status(409).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Вход пользователя
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Успешный вход',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Получение профиля пользователя
router.get('/profile', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const stats = await req.user.getStats();
    
    res.json({
      user: req.user.toJSON(),
      stats
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Обновление профиля пользователя
router.put('/profile', 
  require('../middleware/auth').authenticateToken,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Имя должно содержать от 2 до 50 символов'),
    body('plan')
      .optional()
      .isIn(['basic', 'pro', 'premium'])
      .withMessage('Некорректный план подписки')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Ошибка валидации',
          details: errors.array()
        });
      }

      const updatedUser = await req.user.update(req.body);
      
      res.json({
        message: 'Профиль успешно обновлен',
        user: updatedUser.toJSON()
      });
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      res.status(500).json({
        error: 'Внутренняя ошибка сервера'
      });
    }
  }
);

// Смена пароля
router.put('/change-password',
  require('../middleware/auth').authenticateToken,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Текущий пароль обязателен'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Новый пароль должен содержать минимум 6 символов')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Ошибка валидации',
          details: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      const isCurrentPasswordValid = await req.user.checkPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Неверный текущий пароль'
        });
      }

      await req.user.updatePassword(newPassword);

      res.json({
        message: 'Пароль успешно изменен'
      });
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      res.status(500).json({
        error: 'Внутренняя ошибка сервера'
      });
    }
  }
);

module.exports = router;
