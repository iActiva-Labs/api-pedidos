const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'pedidos.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    direccion TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    fecha TEXT NOT NULL DEFAULT (datetime('now')),
    estado TEXT NOT NULL DEFAULT 'pendiente',
    total REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS lineas_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )
`);

// Datos iniciales
const count = db.prepare('SELECT COUNT(*) as c FROM productos').get();
if (count.c === 0) {
  console.log('Cargando datos iniciales...');

  const insertProducto = db.prepare(
    'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)'
  );
  insertProducto.run('Teclado mecánico', 89.99, 50);
  insertProducto.run('Ratón inalámbrico', 34.99, 100);
  insertProducto.run('Monitor 27 pulgadas', 299.99, 25);
  insertProducto.run('Auriculares Bluetooth', 59.99, 75);
  insertProducto.run('Webcam HD', 49.99, 60);
  insertProducto.run('Cable USB-C', 12.99, 200);
  insertProducto.run('Base para portátil', 39.99, 40);
  insertProducto.run('Alfombrilla XXL', 19.99, 150);

  const insertCliente = db.prepare(
    'INSERT INTO clientes (nombre, email, direccion) VALUES (?, ?, ?)'
  );
  insertCliente.run('María López', 'maria@empresa.com', 'Calle Mayor 1, Madrid');
  insertCliente.run('Carlos García', 'carlos@empresa.com', 'Av. Libertad 45, Barcelona');
  insertCliente.run('Ana Martínez', 'ana@empresa.com', 'Plaza España 3, Valencia');
}

module.exports = db;
