const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware для проверки аутентификации
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Токен доступа не предоставлен' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        error: 'Недействительный токен' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Недействительный токен' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Токен истек' 
      });
    }
    
    console.error('Ошибка аутентификации:', error);
    return res.status(500).json({ 
      error: 'Внутренняя ошибка сервера' 
    });
  }
};

// Middleware для проверки прав доступа к проекту
const checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const Project = require('../models/Project');
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден' 
      });
    }

    if (!(await project.checkAccess(req.user.id))) {
      return res.status(403).json({ 
        error: 'Нет доступа к этому проекту' 
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Ошибка проверки доступа к проекту:', error);
    return res.status(500).json({ 
      error: 'Внутренняя ошибка сервера' 
    });
  }
};

// Middleware для проверки прав доступа к сессии
const checkSessionAccess = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const Session = require('../models/Session');
    
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Сессия не найдена' 
      });
    }

    if (!(await session.checkAccess(req.user.id))) {
      return res.status(403).json({ 
        error: 'Нет доступа к этой сессии' 
      });
    }

    req.session = session;
    next();
  } catch (error) {
    console.error('Ошибка проверки доступа к сессии:', error);
    return res.status(500).json({ 
      error: 'Внутренняя ошибка сервера' 
    });
  }
};

// Генерация JWT токена
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Проверка токена без middleware
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  checkProjectAccess,
  checkSessionAccess,
  generateToken,
  verifyToken
};
