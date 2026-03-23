# TICKET-001: Sistema de descuentos por volumen

**Estado**: Pendiente
**Prioridad**: Alta

## Descripción

Implementar un sistema de descuentos automáticos basado en la cantidad de unidades por línea de pedido.

## Reglas de negocio

- Más de 10 unidades → 5% de descuento
- Más de 50 unidades → 15% de descuento
- El descuento se aplica al total de la línea (cantidad × precio unitario)
- El descuento de cada línea es independiente de las demás

## Criterios de aceptación

- El descuento aparece en el detalle del pedido (campo `descuento` por línea)
- El subtotal de cada línea refleja el descuento aplicado
- El total del pedido es la suma de los subtotales con descuento
- Tests unitarios para cada regla de descuento
