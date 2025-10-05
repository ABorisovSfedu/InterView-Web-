const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const { authenticateToken, checkProjectAccess } = require('../middleware/auth');
const { uploadFiles, handleUploadError, getFileSize, getMimeType } = require('../middleware/upload');
const { dbRun } = require('../config/database');

const router = express.Router();

// Валидация для создания сессии
const createSessionValidation = [
  body('type')
    .isIn(['interview', 'import'])
    .withMessage('Тип сессии должен быть "interview" или "import"'),
  body('duration')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Длительность должна быть положительным числом'),
  body('fileSize')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Размер файла должен быть положительным числом')
];

// Получить все сессии пользователя за неделю
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Получаем сессии за последние 7 дней
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const sessions = await Session.findByUserIdAndDateRange(userId, oneWeekAgo, new Date());
    
    res.json({
      sessions: sessions.map(session => session.toJSON())
    });
  } catch (error) {
    console.error('Ошибка получения сессий пользователя:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Получить все сессии проекта
router.get('/project/:projectId', authenticateToken, checkProjectAccess, async (req, res) => {
  try {
    const sessions = await Session.findByProjectId(req.params.projectId);
    
    // Получаем загруженные файлы для каждой сессии
    const sessionsWithFiles = await Promise.all(
      sessions.map(async (session) => {
        const files = await session.getUploadedFiles();
        return {
          ...session.toJSON(),
          files
        };
      })
    );

    res.json({
      sessions: sessionsWithFiles
    });
  } catch (error) {
    console.error('Ошибка получения сессий:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Получить конкретную сессию
router.get('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
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

    const files = await session.getUploadedFiles();

    res.json({
      session: {
        ...session.toJSON(),
        files
      }
    });
  } catch (error) {
    console.error('Ошибка получения сессии:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Создать новую сессию
router.post('/project/:projectId', authenticateToken, checkProjectAccess, createSessionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const { type, duration, fileSize } = req.body;
    const session = await Session.create(req.params.projectId, type, duration, null, fileSize);

    res.status(201).json({
      message: 'Сессия успешно создана',
      session: session.toJSON()
    });
  } catch (error) {
    console.error('Ошибка создания сессии:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Обновить сессию
router.put('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
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

    const updatedSession = await session.update(req.body);

    res.json({
      message: 'Сессия успешно обновлена',
      session: updatedSession.toJSON()
    });
  } catch (error) {
    console.error('Ошибка обновления сессии:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Удалить сессию
router.delete('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
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

    await session.delete();

    res.json({
      message: 'Сессия успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления сессии:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Загрузить файлы в сессию
router.post('/:sessionId/upload', 
  authenticateToken, 
  async (req, res, next) => {
    // Проверяем доступ к сессии
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }
    if (!(await session.checkAccess(req.user.id))) {
      return res.status(403).json({ error: 'Нет доступа к этой сессии' });
    }
    req.session = session;
    next();
  },
  uploadFiles,
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'Файлы не были загружены'
        });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        const fileSize = getFileSize(file.path);
        const mimeType = getMimeType(file.path);

        const result = await dbRun(`
          INSERT INTO uploaded_files 
          (session_id, project_id, filename, original_name, file_type, file_size, file_path, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
        `, [
          req.params.sessionId,
          req.session.projectId,
          file.filename,
          file.originalname,
          mimeType,
          fileSize,
          file.path
        ]);

        uploadedFiles.push({
          id: result.id,
          sessionId: req.params.sessionId,
          projectId: req.session.projectId,
          filename: file.filename,
          originalName: file.originalname,
          fileType: mimeType,
          fileSize: fileSize,
          filePath: file.path,
          status: 'completed',
          createdAt: new Date().toISOString()
        });
      }

      // Обновляем статус сессии на "completed" если есть файлы
      await req.session.update({ status: 'completed' });

      res.json({
        message: 'Файлы успешно загружены',
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      res.status(500).json({
        error: 'Внутренняя ошибка сервера'
      });
    }
  }
);

// Получить файлы сессии
router.get('/:sessionId/files', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
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

    const files = await session.getUploadedFiles();

    res.json({
      files
    });
  } catch (error) {
    console.error('Ошибка получения файлов сессии:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Сохранить layout сессии
router.post('/:sessionId/layout', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
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

    const { elements, timestamp } = req.body;
    
    if (!elements || !Array.isArray(elements)) {
      return res.status(400).json({
        error: 'Элементы layout обязательны и должны быть массивом'
      });
    }

    // Сохраняем layout в базу данных
    const layoutData = {
      sessionId: req.params.sessionId,
      elements: elements,
      timestamp: timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Проверяем, есть ли уже layout для этой сессии
    const existingLayout = await dbRun(`
      SELECT id FROM session_layouts WHERE session_id = ?
    `, [req.params.sessionId]);

    if (existingLayout) {
      // Обновляем существующий layout
      await dbRun(`
        UPDATE session_layouts 
        SET elements = ?, timestamp = ?, updated_at = ?
        WHERE session_id = ?
      `, [
        JSON.stringify(elements),
        layoutData.timestamp,
        layoutData.updatedAt,
        req.params.sessionId
      ]);
    } else {
      // Создаем новый layout
      await dbRun(`
        INSERT INTO session_layouts (session_id, elements, timestamp, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `, [
        req.params.sessionId,
        JSON.stringify(elements),
        layoutData.timestamp,
        layoutData.updatedAt,
        layoutData.updatedAt
      ]);
    }

    res.json({
      message: 'Layout успешно сохранен',
      layout: layoutData
    });
  } catch (error) {
    console.error('Ошибка сохранения layout:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Загрузить layout сессии
router.get('/:sessionId/layout', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
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

    // Получаем layout из базы данных
    const layout = await dbRun(`
      SELECT elements, timestamp, created_at, updated_at 
      FROM session_layouts 
      WHERE session_id = ?
    `, [req.params.sessionId]);

    if (!layout) {
      return res.status(404).json({
        error: 'Layout не найден для этой сессии'
      });
    }

    const layoutData = {
      sessionId: req.params.sessionId,
      elements: JSON.parse(layout.elements),
      timestamp: layout.timestamp,
      createdAt: layout.created_at,
      updatedAt: layout.updated_at
    };

    res.json(layoutData);
  } catch (error) {
    console.error('Ошибка загрузки layout:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;
