const db = require('../db');
const productoModel = require('./productoModel');
const clienteModel = require('./clienteModel');

const calcularDescuento = (cantidad) => {
  if (cantidad > 50) return 0.15;
  if (cantidad > 10) return 0.05;
  return 0;
};

const formatearPedido = (pedido) => {
  const lineas = db.prepare(
    'SELECT * FROM lineas_pedido WHERE pedido_id = ?'
  ).all(pedido.id);

  // Determinar el descuento máximo del pedido
  let maxDescuento = 0;
  for (const linea of lineas) {
    const descuento = calcularDescuento(linea.cantidad);
    if (descuento > maxDescuento) {
      maxDescuento = descuento;
    }
  }

  const lineasFormateadas = lineas.map((linea) => {
    const producto = productoModel.findById(linea.producto_id);
    const subtotal = linea.cantidad * linea.precio_unitario * (1 - maxDescuento);
    return {
      id: linea.id,
      producto_id: linea.producto_id,
      producto: producto ? producto.nombre : 'Desconocido',
      cantidad: linea.cantidad,
      precio_unitario: linea.precio_unitario,
      descuento: maxDescuento,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  });

  const cliente = clienteModel.findById(pedido.cliente_id);

  return {
    id: pedido.id,
    cliente_id: pedido.cliente_id,
    cliente: cliente ? cliente.nombre : 'Desconocido',
    fecha: pedido.fecha,
    estado: pedido.estado,
    total: pedido.total,
    lineas: lineasFormateadas,
  };
};

const findAll = () => {
  const pedidos = db.prepare('SELECT * FROM pedidos').all();
  return pedidos.map(formatearPedido);
};

const findById = (id) => {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
  if (!pedido) return null;
  return formatearPedido(pedido);
};

const crear = (clienteId, lineas) => {
  // Validar stock
  for (const linea of lineas) {
    const producto = productoModel.findById(linea.producto_id);
    if (!producto) {
      throw new Error(`Producto ${linea.producto_id} no existe`);
    }
    if (producto.stock < linea.cantidad) {
      throw new Error(
        `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, solicitado: ${linea.cantidad}`
      );
    }
  }

  // Determinar descuento del pedido
  let maxDescuento = 0;
  for (const linea of lineas) {
    const descuento = calcularDescuento(linea.cantidad);
    if (descuento > maxDescuento) {
      maxDescuento = descuento;
    }
  }

  // Calcular total con descuento
  let total = 0;
  for (const linea of lineas) {
    const producto = productoModel.findById(linea.producto_id);
    total += producto.precio * linea.cantidad * (1 - maxDescuento);
  }
  total = Math.round(total * 100) / 100;

  // Insertar pedido
  const result = db.prepare(
    'INSERT INTO pedidos (cliente_id, total) VALUES (?, ?)'
  ).run(clienteId, total);
  const pedidoId = result.lastInsertRowid;

  // Insertar líneas y actualizar stock
  for (const linea of lineas) {
    const producto = productoModel.findById(linea.producto_id);
    db.prepare(
      'INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)'
    ).run(pedidoId, linea.producto_id, linea.cantidad, producto.precio);
    productoModel.updateStock(producto.id, producto.stock - linea.cantidad);
  }

  return findById(pedidoId);
};

const actualizarEstado = (id, estado) => {
  db.prepare('UPDATE pedidos SET estado = ? WHERE id = ?').run(estado, id);
  return findById(id);
};

const eliminar = (id) => {
  db.prepare('DELETE FROM lineas_pedido WHERE pedido_id = ?').run(id);
  db.prepare('DELETE FROM pedidos WHERE id = ?').run(id);
};

module.exports = { findAll, findById, crear, actualizarEstado, eliminar };
