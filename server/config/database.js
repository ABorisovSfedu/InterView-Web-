const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: './config.env' });

const DB_PATH = process.env.DB_PATH || './database.sqlite';

// Создаем подключение к базе данных
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('✅ Подключение к SQLite базе данных установлено');
  }
});

// Включаем поддержку внешних ключей
db.run('PRAGMA foreign_keys = ON');

// Функция для выполнения запросов с промисами
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};
