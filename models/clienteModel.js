const db = require('../db');

const findAll = () => {
  return db.prepare('SELECT * FROM clientes').all();
};

const findById = (id) => {
  return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
};

const search = (email) => {
  return db.prepare('SELECT * FROM clientes WHERE email LIKE ?').all(`%${email}%`);
};

const create = ({ nombre, email, direccion }) => {
  const result = db.prepare(
    'INSERT INTO clientes (nombre, email, direccion) VALUES (?, ?, ?)'
  ).run(nombre, email, direccion);
  return findById(result.lastInsertRowid);
};

const update = (id, { nombre, email, direccion }) => {
  db.prepare(
    'UPDATE clientes SET nombre = ?, email = ?, direccion = ? WHERE id = ?'
  ).run(nombre, email, direccion, id);
  return findById(id);
};

const remove = (id) => {
  db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
};

module.exports = { findAll, findById, search, create, update, remove };
