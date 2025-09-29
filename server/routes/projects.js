const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Валидация для создания проекта
const createProjectValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Название проекта должно содержать от 1 до 100 символов'),
  body('client')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Название клиента не должно превышать 100 символов'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов')
];

// Валидация для обновления проекта
const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Название проекта должно содержать от 1 до 100 символов'),
  body('client')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Название клиента не должно превышать 100 символов'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'done'])
    .withMessage('Некорректный статус проекта')
];

// Получить все проекты пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.findByUserId(req.user.id);
    
    // Получаем статистику для каждого проекта
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const stats = await project.getStats();
        return {
          ...project.toJSON(),
          stats
        };
      })
    );

    res.json({
      projects: projectsWithStats
    });
  } catch (error) {
    console.error('Ошибка получения проектов:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Получить конкретный проект
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
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

    const stats = await project.getStats();
    const sessions = await project.getSessions();
    const uploadedFiles = await project.getUploadedFiles();

    res.json({
      project: {
        ...project.toJSON(),
        stats,
        sessions,
        uploadedFiles
      }
    });
  } catch (error) {
    console.error('Ошибка получения проекта:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Создать новый проект
router.post('/', authenticateToken, createProjectValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const { name, client, description } = req.body;
    const project = await Project.create(req.user.id, name, client, description);

    res.status(201).json({
      message: 'Проект успешно создан',
      project: project.toJSON()
    });
  } catch (error) {
    console.error('Ошибка создания проекта:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Обновить проект
router.put('/:projectId', authenticateToken, updateProjectValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const project = await Project.findById(req.params.projectId);
    
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

    const updatedProject = await project.update(req.body);

    res.json({
      message: 'Проект успешно обновлен',
      project: updatedProject.toJSON()
    });
  } catch (error) {
    console.error('Ошибка обновления проекта:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Удалить проект
router.delete('/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
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

    await project.delete();

    res.json({
      message: 'Проект успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления проекта:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Получить статистику проекта
router.get('/:projectId/stats', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
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

    const stats = await project.getStats();

    res.json({
      stats
    });
  } catch (error) {
    console.error('Ошибка получения статистики проекта:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;
