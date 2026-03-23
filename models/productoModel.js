const db = require('../db');

const findAll = () => {
  return db.prepare('SELECT * FROM productos').all();
};

const findById = (id) => {
  return db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
};

const search = (nombre) => {
  return db.prepare('SELECT * FROM productos WHERE nombre LIKE ?').all(`%${nombre}%`);
};

const create = ({ nombre, precio, stock }) => {
  const result = db.prepare(
    'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)'
  ).run(nombre, precio, stock);
  return findById(result.lastInsertRowid);
};

const update = (id, { nombre, precio, stock }) => {
  db.prepare(
    'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?'
  ).run(nombre, precio, stock, id);
  return findById(id);
};

const updateStock = (id, nuevoStock) => {
  db.prepare('UPDATE productos SET stock = ? WHERE id = ?').run(nuevoStock, id);
};

const remove = (id) => {
  db.prepare('DELETE FROM productos WHERE id = ?').run(id);
};

module.exports = { findAll, findById, search, create, update, updateStock, remove };
