const express = require('express');
require('./db');

const productosRouter = require('./routes/productos');
const clientesRouter = require('./routes/clientes');
const pedidosRouter = require('./routes/pedidos');

const app = express();
app.use(express.json());

app.use('/productos', productosRouter);
app.use('/clientes', clientesRouter);
app.use('/pedidos', pedidosRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
