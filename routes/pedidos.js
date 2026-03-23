const express = require('express');
const router = express.Router();
const pedidoModel = require('../models/pedidoModel');

router.get('/', (req, res) => {
  try {
    const pedidos = pedidoModel.findAll();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const pedido = pedidoModel.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
});

router.post('/', (req, res) => {
  try {
    const { cliente_id, lineas } = req.body;
    const pedido = pedidoModel.crear(cliente_id, lineas);
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/estado', (req, res) => {
  try {
    const pedido = pedidoModel.actualizarEstado(req.params.id, req.body.estado);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el estado' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    pedidoModel.eliminar(req.params.id);
    res.json({ mensaje: 'Pedido eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
});

module.exports = router;
