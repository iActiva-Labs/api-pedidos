const express = require('express');
const router = express.Router();
const clienteModel = require('../models/clienteModel');

router.get('/', (req, res) => {
  try {
    const clientes = clienteModel.findAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

router.get('/buscar', (req, res) => {
  try {
    const clientes = clienteModel.search(req.query.email || '');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const cliente = clienteModel.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
});

router.post('/', (req, res) => {
  try {
    const cliente = clienteModel.create(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el cliente' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const cliente = clienteModel.update(req.params.id, req.body);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el cliente' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    clienteModel.remove(req.params.id);
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

module.exports = router;
