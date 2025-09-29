const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Создаем директорию для загрузок, если её нет
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Конфигурация multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Фильтр для проверки типов файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.mp3', '.wav', '.m4a', '.txt'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}`), false);
  }
};

// Создаем экземпляр multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB по умолчанию
    files: 10 // Максимум 10 файлов за раз
  }
});

// Middleware для загрузки файлов
const uploadFiles = upload.array('files', 10);

// Middleware для обработки ошибок загрузки
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Файл слишком большой. Максимальный размер: 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Слишком много файлов. Максимум: 10 файлов'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Неожиданное поле файла'
      });
    }
  }
  
  if (error.message.includes('Неподдерживаемый тип файла')) {
    return res.status(400).json({
      error: error.message
    });
  }

  next(error);
};

// Функция для удаления файла
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
    return false;
  }
};

// Функция для получения размера файла
const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error('Ошибка при получении размера файла:', error);
    return 0;
  }
};

// Функция для получения MIME типа файла
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.txt': 'text/plain'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

module.exports = {
  uploadFiles,
  handleUploadError,
  deleteFile,
  getFileSize,
  getMimeType
};
