document.addEventListener('DOMContentLoaded', () => {
    const agregarProductoBtn = document.getElementById('agregarProducto');
    const agregarCostoBtn = document.getElementById('agregarCosto');
    const productoSelect = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');
    const detalleVentaList = document.getElementById('detalleVentaList');
    const totalVentaInput = document.getElementById('totalVenta');
    const costosExtraInput = document.getElementById('costosExtra');
    const totalFinalInput = document.getElementById('totalFinal');

    const productosAgregados = [];
    let costosExtra = 0;

    agregarProductoBtn.addEventListener('click', () => {
        const productoSeleccionado = productoSelect.value;
        const cantidad = parseInt(cantidadInput.value);
        const precio = parseFloat(productoSelect.options[productoSelect.selectedIndex]
            .getAttribute('data-precio'));

        // Agregar producto a la lista de productos agregados
        productosAgregados.push({
            producto: productoSeleccionado,
            cantidad,
            precio
        });

        // Actualizar la lista en la interfaz gráfica
        detalleVentaList.innerHTML = productosAgregados
            .map(item =>
                `<li>${item.cantidad} x Producto ID ${item.producto} - Total: $${(item.cantidad * item.precio).toFixed(2)}</li>`
            )
            .join('');

        // Calcular y mostrar el total de la venta
        const totalVenta = productosAgregados.reduce((total, item) => total + (item
            .cantidad * item.precio), 0);
        totalVentaInput.value = `$${totalVenta.toFixed(2)}`;

        // Calcular y mostrar el total final
        const totalFinal = totalVenta + costosExtra;
        totalFinalInput.value = `$${totalFinal.toFixed(2)}`;
    });

    agregarCostoBtn.addEventListener('click', () => {
        costosExtra += parseFloat(costosExtraInput.value);
        costosExtraInput.value = ''; // Limpiar el campo
        totalFinalInput.value =
            `$${(totalVentaInput.value.replace('$', '') * 1 + costosExtra).toFixed(2)}`;
    });
});
