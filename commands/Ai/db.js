import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./memory.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      content TEXT,
      embedding TEXT
    )
  `);
});

export default db;
