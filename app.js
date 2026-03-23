const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(express.json());

// base de datos
var db = new Database(path.join(__dirname, 'pedidos.db'));
db.pragma('journal_mode = WAL');

// crear tablas
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
    total REAL NOT NULL DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS lineas_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL
  )
`);

// datos iniciales
var count = db.prepare("SELECT COUNT(*) as c FROM productos").get();
if (count.c == 0) {
  console.log("Cargando datos iniciales...");
  db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('Teclado mecánico', 89.99, 50)").run();
  db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('Ratón inalámbrico', 34.99, 100)").run();
  db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('Monitor 27 pulgadas', 299.99, 25)").run();
  db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('Auriculares Bluetooth', 59.99, 75)").run();
  db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('Webcam HD', 49.99, 60)").run();
  db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('Cable USB-C', 12.99, 200)").run();
  db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('Base para portátil', 39.99, 40)").run();
  db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('Alfombrilla XXL', 19.99, 150)").run();

  db.prepare("INSERT INTO clientes (nombre, email, direccion) VALUES ('María López', 'maria@empresa.com', 'Calle Mayor 1, Madrid')").run();
  db.prepare("INSERT INTO clientes (nombre, email, direccion) VALUES ('Carlos García', 'carlos@empresa.com', 'Av. Libertad 45, Barcelona')").run();
  db.prepare("INSERT INTO clientes (nombre, email, direccion) VALUES ('Ana Martínez', 'ana@empresa.com', 'Plaza España 3, Valencia')").run();
}

// ==================== PRODUCTOS ====================

app.get('/productos', function(req, res) {
  var x = db.prepare("SELECT * FROM productos").all();
  res.json(x);
});

app.get('/productos/buscar', function(req, res) {
  var nombre = req.query.nombre;
  // todo: mejorar busqueda
  var x = db.prepare("SELECT * FROM productos WHERE nombre LIKE '%" + nombre + "%'").all();
  res.json(x);
});

app.get('/productos/:id', function(req, res) {
  var x = db.prepare("SELECT * FROM productos WHERE id = " + req.params.id).get();
  if (x) {
    res.json(x);
  } else {
    res.status(404).json({ mensaje: "no encontrado" });
  }
});

app.post('/productos', function(req, res) {
  var data = req.body;
  console.log("Creando producto: " + data.nombre);
  var result = db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES ('" + data.nombre + "', " + data.precio + ", " + data.stock + ")").run();
  var tmp = db.prepare("SELECT * FROM productos WHERE id = " + result.lastInsertRowid).get();
  res.status(201).json(tmp);
});

app.put('/productos/:id', function(req, res) {
  var data = req.body;
  db.prepare("UPDATE productos SET nombre = '" + data.nombre + "', precio = " + data.precio + ", stock = " + data.stock + " WHERE id = " + req.params.id).run();
  var x = db.prepare("SELECT * FROM productos WHERE id = " + req.params.id).get();
  res.json(x);
});

app.delete('/productos/:id', function(req, res) {
  db.prepare("DELETE FROM productos WHERE id = " + req.params.id).run();
  res.json({ mensaje: "eliminado" });
});

// ==================== CLIENTES ====================

app.get('/clientes', function(req, res) {
  var x = db.prepare("SELECT * FROM clientes").all();
  res.json(x);
});

app.get('/clientes/buscar', function(req, res) {
  var email = req.query.email;
  var x = db.prepare("SELECT * FROM clientes WHERE email LIKE '%" + email + "%'").all();
  res.json(x);
});

app.get('/clientes/:id', function(req, res) {
  var x = db.prepare("SELECT * FROM clientes WHERE id = " + req.params.id).get();
  if (x) {
    res.json(x);
  } else {
    res.status(404).json({ mensaje: "no encontrado" });
  }
});

app.post('/clientes', function(req, res) {
  var data = req.body;
  console.log("Creando cliente: " + data.nombre);
  var result = db.prepare("INSERT INTO clientes (nombre, email, direccion) VALUES ('" + data.nombre + "', '" + data.email + "', '" + data.direccion + "')").run();
  var tmp = db.prepare("SELECT * FROM clientes WHERE id = " + result.lastInsertRowid).get();
  res.status(201).json(tmp);
});

app.put('/clientes/:id', function(req, res) {
  var data = req.body;
  db.prepare("UPDATE clientes SET nombre = '" + data.nombre + "', email = '" + data.email + "', direccion = '" + data.direccion + "' WHERE id = " + req.params.id).run();
  var x = db.prepare("SELECT * FROM clientes WHERE id = " + req.params.id).get();
  res.json(x);
});

app.delete('/clientes/:id', function(req, res) {
  db.prepare("DELETE FROM clientes WHERE id = " + req.params.id).run();
  res.json({ mensaje: "eliminado" });
});

// ==================== PEDIDOS ====================

// listar todos con detalle
app.get('/pedidos', function(req, res) {
  var x = db.prepare("SELECT * FROM pedidos").all();
  var data2 = [];
  for (var i = 0; i < x.length; i++) {
    var tmp = db.prepare("SELECT * FROM lineas_pedido WHERE pedido_id = " + x[i].id).all();
    var data3 = [];
    for (var j = 0; j < tmp.length; j++) {
      var p = db.prepare("SELECT * FROM productos WHERE id = " + tmp[j].producto_id).get();
      data3.push({
        id: tmp[j].id,
        producto_id: tmp[j].producto_id,
        producto: p ? p.nombre : "Desconocido",
        cantidad: tmp[j].cantidad,
        precio_unitario: tmp[j].precio_unitario,
        subtotal: tmp[j].cantidad * tmp[j].precio_unitario
      });
    }
    var c = db.prepare("SELECT * FROM clientes WHERE id = " + x[i].cliente_id).get();
    data2.push({
      id: x[i].id,
      cliente_id: x[i].cliente_id,
      cliente: c ? c.nombre : "Desconocido",
      fecha: x[i].fecha,
      estado: x[i].estado,
      total: x[i].total,
      lineas: data3
    });
  }
  res.json(data2);
});

// crear pedido
app.post('/pedidos', function(req, res) {
  var data = req.body;
  var lineas = data.lineas;

  // calcular total
  var tmp = 0;
  for (var i = 0; i < lineas.length; i++) {
    var p = db.prepare("SELECT * FROM productos WHERE id = " + lineas[i].producto_id).get();
    if (!p) {
      res.status(400).json({ error: "Producto " + lineas[i].producto_id + " no existe" });
      return;
    }
    if (p.stock < lineas[i].cantidad) {
      res.status(400).json({ error: "Stock insuficiente para " + p.nombre + ". Disponible: " + p.stock + ", solicitado: " + lineas[i].cantidad });
      return;
    }
    tmp = tmp + (p.precio * lineas[i].cantidad);
  }

  // insertar pedido
  console.log("Nuevo pedido, total: " + tmp);
  var result = db.prepare("INSERT INTO pedidos (cliente_id, total) VALUES (" + data.cliente_id + ", " + tmp + ")").run();
  var pedidoId = result.lastInsertRowid;

  // insertar lineas y actualizar stock
  for (var i = 0; i < lineas.length; i++) {
    var p = db.prepare("SELECT * FROM productos WHERE id = " + lineas[i].producto_id).get();
    db.prepare("INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (" + pedidoId + ", " + lineas[i].producto_id + ", " + lineas[i].cantidad + ", " + p.precio + ")").run();
    var newStock = p.stock - lineas[i].cantidad;
    db.prepare("UPDATE productos SET stock = " + newStock + " WHERE id = " + p.id).run();
  }

  // devolver pedido creado
  var x = db.prepare("SELECT * FROM pedidos WHERE id = " + pedidoId).get();
  var tmp2 = db.prepare("SELECT * FROM lineas_pedido WHERE pedido_id = " + pedidoId).all();
  var data2 = [];
  for (var j = 0; j < tmp2.length; j++) {
    var p = db.prepare("SELECT * FROM productos WHERE id = " + tmp2[j].producto_id).get();
    data2.push({
      id: tmp2[j].id,
      producto_id: tmp2[j].producto_id,
      producto: p ? p.nombre : "Desconocido",
      cantidad: tmp2[j].cantidad,
      precio_unitario: tmp2[j].precio_unitario,
      subtotal: tmp2[j].cantidad * tmp2[j].precio_unitario
    });
  }
  var c = db.prepare("SELECT * FROM clientes WHERE id = " + x.cliente_id).get();
  res.status(201).json({
    id: x.id,
    cliente_id: x.cliente_id,
    cliente: c ? c.nombre : "Desconocido",
    fecha: x.fecha,
    estado: x.estado,
    total: x.total,
    lineas: data2
  });
});

// obtener un pedido
app.get('/pedidos/:id', function(req, res) {
  var x = db.prepare("SELECT * FROM pedidos WHERE id = " + req.params.id).get();
  if (!x) {
    res.status(404).json({ mensaje: "Pedido no encontrado" });
    return;
  }
  var tmp = db.prepare("SELECT * FROM lineas_pedido WHERE pedido_id = " + x.id).all();
  var data2 = [];
  for (var j = 0; j < tmp.length; j++) {
    var p = db.prepare("SELECT * FROM productos WHERE id = " + tmp[j].producto_id).get();
    data2.push({
      id: tmp[j].id,
      producto_id: tmp[j].producto_id,
      producto: p ? p.nombre : "Desconocido",
      cantidad: tmp[j].cantidad,
      precio_unitario: tmp[j].precio_unitario,
      subtotal: tmp[j].cantidad * tmp[j].precio_unitario
    });
  }
  var c = db.prepare("SELECT * FROM clientes WHERE id = " + x.cliente_id).get();
  res.json({
    id: x.id,
    cliente_id: x.cliente_id,
    cliente: c ? c.nombre : "Desconocido",
    fecha: x.fecha,
    estado: x.estado,
    total: x.total,
    lineas: data2
  });
});

// actualizar estado
app.put('/pedidos/:id/estado', function(req, res) {
  var data = req.body;
  db.prepare("UPDATE pedidos SET estado = '" + data.estado + "' WHERE id = " + req.params.id).run();
  var x = db.prepare("SELECT * FROM pedidos WHERE id = " + req.params.id).get();
  res.json(x);
});

// eliminar pedido
app.delete('/pedidos/:id', function(req, res) {
  db.prepare("DELETE FROM lineas_pedido WHERE pedido_id = " + req.params.id).run();
  db.prepare("DELETE FROM pedidos WHERE id = " + req.params.id).run();
  res.json({ mensaje: "Pedido eliminado" });
});

// ==================== SERVIDOR ====================

var port = 3000;
app.listen(port, function() {
  console.log("Servidor corriendo en http://localhost:" + port);
});
