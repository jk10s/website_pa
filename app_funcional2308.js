const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(express.urlencoded({
    extended: true
}));

const session = require('express-session');

app.use(session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: true
}));





// Crear la conexión con la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'discotelapatrona',
});

// Establecer la conexión con la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

// Configuración de la carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'assets')));

// Configuración del motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ruta para la página principal
app.get('/', (req, res) => {
    res.render('index');
});

// Agregar más rutas y controladores según las necesidades de tu proyecto
// Por ejemplo:
app.post('/login', (req, res) => {
    const {
        correo,
        contraseña
    } = req.body;
    // Aquí puedes realizar la lógica de autenticación con la base de datos y manejo de sesiones
});

// Middleware para verificar la sesión
function verificarSesion(req, res, next) {
    if (req.session && req.session.IDEmpleado) {
        // El usuario tiene una sesión activa
        next();
    } else {
        // Redirigir a la página de inicio de sesión o mostrar un mensaje de acceso denegado
        res.redirect('/sesion.html'); // O cualquier ruta que prefieras
    }
}

// Ruta para el inicio de sesión
app.get('/sesion.html', (req, res) => {
    res.render('sesion', {
        mensajeError: null
    });
});

app.get('/usuarios', (req, res) => {
    res.render('usuarios');
});

// Ruta para el inicio de sesión
// Ruta para el inicio de sesión
app.post('/iniciar-sesion', (req, res) => {
    const {
        email,
        password
    } = req.body;

    const query = 'SELECT * FROM Empleados WHERE email = ? AND password = ?';
    const values = [email, password];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error al realizar la consulta:', error);
            res.render('sesion', {
                mensajeError: 'Error al iniciar sesión.'
            });
        } else {
            if (results.length > 0) {
                // El usuario ha iniciado sesión correctamente
                const nombreUsuario = results[0].Nombre;
                const tipoUsuario = results[0].TipoCuenta;

                // Establecer el valor de IDEmpleado, nombre y correo en la sesión
                req.session.IDEmpleado = results[0].IDEmpleado;
                req.session.nombre = nombreUsuario;
                req.session.email = results[0].email;
                req.session.tipoCuenta = tipoUsuario; // Agrega esta línea

                if (tipoUsuario === 'administrador') {
                    // Redireccionar a la página de administrador
                    res.render('pagina-administrador', {
                        nombreUsuario
                    });
                } else if (tipoUsuario === 'empleado') {
                    // Redireccionar a la página de empleado
                    res.render('bienvenido', {
                        nombreUsuario
                    });
                }
            } else {
                // Las credenciales son incorrectas
                res.render('sesion', {
                    mensajeError: 'Credenciales incorrectas.'
                });
            }
        }
    });
});





// Ruta para administrar estudiantes
app.get('/agregar-productos', verificarSesion, (req, res) => {
    const query = 'SELECT * FROM usuarios';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener los usuarios:', error);
            res.status(500).send('Error al obtener los usuarios.');
        } else {
            res.render('administrar_estudiantes', {
                usuarios: results
            });
        }
    });
});


app.get('/registrar-producto', verificarSesion, (req, res) => {
    // Realiza una consulta para obtener información necesaria, como clientes y empleados
    const clientesQuery = 'SELECT * FROM Clientes';
    const empleadosQuery = 'SELECT * FROM Empleados';

    connection.query(clientesQuery, (errorClientes, resultsClientes) => {
        if (errorClientes) {
            console.error('Error al obtener los clientes:', errorClientes);
            res.status(500).send('Error al obtener los clientes.');
        } else {
            connection.query(empleadosQuery, (errorEmpleados, resultsEmpleados) => {
                if (errorEmpleados) {
                    console.error('Error al obtener los empleados:', errorEmpleados);
                    res.status(500).send('Error al obtener los empleados.');
                } else {
                    // Renderiza la página para registrar productos consumidos
                    res.render('registrar_producto', {
                        clientes: resultsClientes,
                        empleados: resultsEmpleados,
                        mensaje: null // Puedes personalizar un mensaje de éxito si es necesario
                    });
                }
            });
        }
    });
});

function mostrarNotificacion() {
    Swal.fire({
        title: 'Registro Exitoso',
        text: 'Usuario registrado exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

// ...

// Ruta para manejar el registro de usuarios
app.post('/registrar', (req, res) => {
    const {
        nombre,
        email,
        password,
        tipo,
        clave
    } = req.body;

    let tipoCuenta = '';
    if (tipo === 'empleado') {
        tipoCuenta = 'empleado';
    } else if (tipo === 'administrador') {
        tipoCuenta = 'administrador';
        if (clave !== 'Discoteca2023') {
            const alertMessage = 'Error al registrar el usuario. Clave de administrador incorrecta.';
            const alertScript = `<script>alert('${alertMessage}'); window.location.href = '/';</script>`;
            return res.send(alertScript);
        }
    }

    if (!nombre || !email || !password) {
        console.log('Error al registrar el usuario. Faltan los siguientes campos:',
            (!nombre ? 'nombre' : ''),
            (!email ? 'email' : ''),
            (!password ? 'password' : ''));
        const alertMessage = 'Error al registrar el usuario. Datos incompletos.';
        const alertScript = `<script>alert('${alertMessage}'); window.location.href = '/';</script>`;
        return res.send(alertScript);
    }

    const query = 'INSERT INTO Empleados (nombre, email, password, TipoCuenta) VALUES (?, ?, ?, ?)';
    const values = [nombre, email, password, tipoCuenta];

    connection.query(query, values, async (error, results) => {
        if (error) {
            console.error('Error al guardar el usuario:', error);
            const alertMessage = 'Error al registrar el usuario.';
            const alertScript = `<script>alert('${alertMessage}'); window.location.href = '/';</script>`;
            res.send(alertScript);
        } else {
            const alertMessage = 'Usuario registrado exitosamente.';
            const alertScript = `<script>alert('${alertMessage}'); window.location.href = '/';</script>`;
            res.send(alertScript);
        }
    });
});







// ... Importa los módulos necesarios y configura la base de datos ...

// Ruta para mostrar la lista de productos del inventario
app.get('/inventario-productos', verificarSesion, (req, res) => {
    const query = 'SELECT * FROM InventarioProductos';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener el inventario de productos:', error);
            res.status(500).send('Error al obtener el inventario de productos.');
        } else {
            res.render('inventario_productos', {
                productos: results
            });
        }
    });
});

// Ruta para mostrar el formulario de agregar producto al inventario
app.get('/agregar-producto', verificarSesion, (req, res) => {
    res.render('agregar_producto'); // Asegúrate de tener un archivo EJS llamado "agregar_producto"
});

// Ruta para procesar la adición de productos al inventario
app.post('/agregar-producto', verificarSesion, (req, res) => {
    const {
        nombre,
        precio,
        precioCompra, // Agrega este campo correspondiente al precio de compra
        cantidad
    } = req.body;

    // Insertar el nuevo producto en la base de datos
    const query = 'INSERT INTO InventarioProductos (NombreProducto, PrecioProducto, PrecioCompra, CantidadStock) VALUES (?, ?, ?, ?)'; // Incluye el campo PrecioCompra
    const values = [nombre, precio, precioCompra, cantidad]; // Incluye el valor de PrecioCompra

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error al agregar el producto:', error);
            // Manejar el error de alguna manera
            res.redirect('/inventario-productos'); // Redirigir de nuevo a la lista de productos
        } else {
            console.log('Producto agregado exitosamente.');
            // Redirigir a la lista de productos después de agregar
            res.redirect('/inventario-productos');
        }
    });
});


// Ruta para mostrar el formulario de editar producto
// Ruta para editar un producto
app.get('/editar-producto/:id', verificarSesion, (req, res) => {
    const productoID = req.params.id;

    const query = 'SELECT * FROM InventarioProductos WHERE IDProducto = ?';
    connection.query(query, [productoID], (error, results) => {
        if (error) {
            console.error('Error al obtener el producto:', error);
            res.status(500).send('Error al obtener el producto.');
        } else {
            const producto = results[0];
            res.render('editar_producto', {
                producto
            });
        }
    });
});

// Ruta para guardar cambios en un producto editado
app.post('/editar-producto/:id', (req, res) => {
    const productoID = req.params.id;
    const {
        nombre,
        precio,
        precioCompra, // Agrega el campo PrecioCompra
        cantidad
    } = req.body;

    const query = 'UPDATE InventarioProductos SET NombreProducto = ?, PrecioProducto = ?, PrecioCompra = ?, CantidadStock = ? WHERE IDProducto = ?';
    const values = [nombre, precio, precioCompra, cantidad, productoID]; // Incluye el valor de PrecioCompra

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error al editar el producto:', error);
            res.status(500).send('Error al editar el producto.');
        } else {
            console.log('Producto editado exitosamente.');
            res.redirect('/inventario-productos');
        }
    });
});



// Ruta para eliminar producto
app.get('/eliminar-producto/:id', verificarSesion, (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM InventarioProductos WHERE IDProducto = ?';
    connection.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Error al eliminar el producto:', error);
            res.status(500).send('Error al eliminar el producto.');
        } else {
            res.redirect('/inventario-productos');
        }
    });
});

// Manejar la finalización del servidor y cerrar la conexión con la base de datos
process.on('SIGINT', () => {
    connection.end((err) => {
        if (err) {
            console.error('Error al cerrar la conexión con la base de datos:', err.message);
        }
        process.exit();
    });
});

// Ruta para obtener la lista de clientes
app.get('/clientes', verificarSesion, (req, res) => {
    const query = 'SELECT * FROM Clientes';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener la lista de clientes:', error);
            res.status(500).send('Error al obtener la lista de clientes.');
        } else {
            res.render('clientes', {
                clientes: results
            });
        }
    });
});

// Continúa con el resto de las rutas y configuraciones según tu proyecto

// Ruta para agregar un nuevo cliente
app.get('/agregar-cliente', verificarSesion, (req, res) => {
    res.render('agregar_cliente');
});

app.post('/agregar-cliente', (req, res) => {
    const {
        nombre,
        telefono,
        correo,
        otrosDetalles
    } = req.body;

    const query = 'INSERT INTO Clientes (Nombre, Telefono, CorreoElectronico, OtrosDetalles) VALUES (?, ?, ?, ?)';
    const values = [nombre, telefono, correo, otrosDetalles];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error al agregar el cliente:', error);
            res.status(500).send('Error al agregar el cliente.');
        } else {
            console.log('Cliente agregado exitosamente.');
            res.redirect('/clientes');
        }
    });
});




app.get('/editar-cliente/:id', verificarSesion, (req, res) => {
    const idCliente = req.params.id;
    const query = 'SELECT * FROM Clientes WHERE IDCliente = ?';

    connection.query(query, [idCliente], (error, results) => {
        if (error || results.length === 0) {
            console.error('Error al obtener el cliente:', error);
            res.status(500).send('Error al obtener el cliente.');
        } else {
            res.render('editar_cliente', {
                cliente: results[0]
            });
        }
    });
});




app.post('/editar-cliente/:id', (req, res) => {
    const idCliente = req.params.id;
    const {
        nombre,
        telefono,
        correo,
        otros
    } = req.body;

    const query = 'UPDATE Clientes SET Nombre = ?, Telefono = ?, CorreoElectronico = ?, OtrosDetalles = ? WHERE IDCliente = ?';
    const values = [nombre, telefono, correo, otros, idCliente];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error al editar el cliente:', error);
            res.status(500).send('Error al editar el cliente.');
        } else {
            console.log('Cliente editado exitosamente.');
            res.redirect('/clientes'); // Redirige a la lista de clientes después de editar
        }
    });
});

// Ruta para eliminar un cliente
app.get('/eliminar-cliente/:id', verificarSesion, (req, res) => {
    const idCliente = req.params.id;
    const query = 'DELETE FROM Clientes WHERE IDCliente = ?';

    connection.query(query, [idCliente], (error) => {
        if (error) {
            console.error('Error al eliminar el cliente:', error);
            res.status(500).send('Error al eliminar el cliente.');
        } else {
            console.log('Cliente eliminado exitosamente.');
            res.redirect('/clientes'); // Asegúrate de que la redirección sea correcta
        }
    });
});


app.get('/realizar-venta', verificarSesion, (req, res) => {
    // Obtener productos del inventario desde la base de datos
    const productosQuery = 'SELECT * FROM InventarioProductos';

    connection.query(productosQuery, (errorProductos, resultsProductos) => {
        if (errorProductos) {
            console.error('Error al obtener los productos:', errorProductos);
            res.status(500).send('Error al obtener los productos.');
        } else {
            res.render('realizar_venta', {
                productos: resultsProductos
            });
        }
    });
});


// app.post('/guardar-venta', (req, res) => {
//     const IDEmpleado = req.session.IDEmpleado;
//     const {
//         cliente,
//         productos,
//         cantidad,
//         totalVenta,
//         costosExtra,
//         totalFinal,
//         metodoPago
//     } = req.body;

//     console.log('Valores recibidos del formulario:');
//     console.log('Cliente:', cliente);
//     console.log('Productos:', productos);
//     console.log('Cantidad:', cantidad);
//     console.log('Total Venta:', totalVenta);
//     console.log('Costos Extra:', costosExtra);
//     console.log('Total Final:', totalFinal);
//     console.log('Método de Pago:', metodoPago);

//     const fechaVenta = new Date();
//     const totalVentaCalculado = parseFloat(totalVenta) * parseInt(cantidad);
//     const totalExtra = parseFloat(costosExtra);
//     const detallesVenta = `Producto: ${productos}, Cantidad: ${cantidad}`;
//     const totalFinalNumerico = parseFloat(totalFinal);





//     try {
//         // Resto del código para procesar la venta...

//         // Insertar la venta en la base de datos
//         const query = 'INSERT INTO Ventas (Cliente, Empleado, FechaVenta, TotalVenta, TotalExtra, DetallesVenta, TotalFinal, Estado, MetodoPago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
//         const values = [cliente, IDEmpleado, fechaVenta, totalVentaCalculado, totalExtra, detallesVenta, totalFinalNumerico, 'pendiente', metodoPago];

//         connection.query(query, values, (error, results) => {
//             if (error) {
//                 console.error('Error al guardar la venta:', error);
//                 res.status(500).send('Error al guardar la venta.');
//             } else {
//                 console.log('Venta registrada exitosamente.');
//                 res.redirect('/ventas'); // Redirigir a la página de ventas o a donde desees
//             }
//         });
//     } catch (error) {
//         console.error('Error general:', error);
//         res.status(500).send('Error general al procesar la venta.');
//     }
// });



app.post('/guardar-venta', (req, res) => {
    const {
        cliente,
        productos,
        cantidad,
        totalVenta,
        costosExtra,
        totalFinal,
        metodoPago
    } = req.body;

    // Convertir productos y cantidad en arreglos para facilitar el procesamiento
    const productosArray = productos.split(',');
    const cantidadArray = cantidad.split(',');

    try {
        // Convertir los valores numéricos
        const totalVentaCalculado = parseFloat(totalVenta.replace('$', ''));
        const totalExtra = parseFloat(costosExtra);
        const totalFinalNumerico = parseFloat(totalFinal.replace('$', ''));

        // Obtener la fecha actual
        const fechaVenta = new Date();

        // Obtener el IDEmpleado desde la sesión
        const IDEmpleado = req.session.IDEmpleado;

        // Crear el objeto de detalles de la venta
        const detallesVenta = JSON.stringify({
            productos,
            cantidad
        });

        console.log('Valores antes de la inserción:');
        console.log('Total Venta:', totalVentaCalculado);
        console.log('Total Extra:', totalExtra);
        console.log('Total Final:', totalFinalNumerico);
        console.log('Fecha Venta:', fechaVenta);
        console.log('ID Empleado:', IDEmpleado);
        console.log('Detalles Venta:', detallesVenta);
        console.log('Método de Pago:', metodoPago);

        // Insertar la venta en la base de datos
        const query = 'INSERT INTO Ventas (Cliente, IDEmpleado, FechaVenta, TotalVenta, TotalExtra, TotalFinal, DetallesVenta, MetodoPago) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [cliente, IDEmpleado, fechaVenta, totalVentaCalculado, totalExtra, totalFinalNumerico, detallesVenta, metodoPago];

        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error al guardar la venta:', error);
                res.status(500).send('Error al guardar la venta.');
            } else {
                console.log('Venta registrada exitosamente.');
                res.redirect('/ventas'); // Redirigir a la página de ventas o a donde desees
            }
        });

        // Recorrer los productos vendidos y actualizar la cantidad en stock
        for (let i = 0; i < productosArray.length; i++) {
            const productoID = productosArray[i];
            const cantidadVendida = parseInt(cantidadArray[i]);

            // Consultar la cantidad actual en stock del producto
            const stockQuery = 'SELECT CantidadStock FROM InventarioProductos WHERE IDProducto = ?';
            connection.query(stockQuery, [productoID], (error, stockResults) => {
                if (error) {
                    console.error('Error al obtener la cantidad en stock:', error);
                } else {
                    const stockActual = stockResults[0].CantidadStock;

                    // Verificar si hay suficiente stock para la venta
                    if (cantidadVendida > stockActual) {
                        console.error('No hay suficiente stock para la venta:', productoID);
                    } else {
                        // Calcular la nueva cantidad en stock
                        const nuevaCantidadStock = stockActual - cantidadVendida;

                        // Actualizar la cantidad en stock del producto
                        const updateStockQuery = 'UPDATE InventarioProductos SET CantidadStock = ? WHERE IDProducto = ?';
                        connection.query(updateStockQuery, [nuevaCantidadStock, productoID], (updateError, updateResults) => {
                            if (updateError) {
                                console.error('Error al actualizar la cantidad en stock:', updateError);
                            } else {
                                console.log('Cantidad en stock actualizada para el producto:', productoID);
                            }
                        });
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).send('Error general al procesar la venta.');
    }
});





// ...




app.get('/ventas', verificarSesion, (req, res) => {
    const sql = 'SELECT * FROM Ventas';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener los datos de ventas:', error);
            return res.status(500).send('Error al obtener los datos de ventas');
        }

        const ventas = results;

        res.render('ventas', {
            ventas
        });
    });
});


app.get('/cerrar-sesion', (req, res) => {
    // Destruye la sesión y redirige al inicio
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar la sesión:', err);
            res.status(500).send('Error al cerrar la sesión.');
        } else {
            res.redirect('/');
        }
    });
});



app.get('/perfil', (req, res) => {
    // Obtén los detalles del usuario desde la sesión o la base de datos
    const nombreUsuario = req.session.nombre;
    const correoUsuario = req.session.email;
    const tipoCuenta = req.session.tipoCuenta; // Agrega esta línea

    // Renderiza la página de perfil y pasa los detalles del usuario como variables
    res.render('miperfil', {
        nombre: nombreUsuario,
        email: correoUsuario,
        tipoCuenta: tipoCuenta // Agrega esta línea
    });
});


app.get('/ventas-pendientes', (req, res) => {
    // Consultar las ventas pendientes desde la base de datos
    const query = 'SELECT * FROM Ventas WHERE estado = "pendiente"';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al consultar ventas pendientes:', error);
            res.status(500).send('Error al consultar ventas pendientes.');
        } else {
            // Renderizar la página EJS con la lista de ventas pendientes
            res.render('ventas-pendientes', {
                ventasPendientes: results
            });
        }
    });
});


app.post('/marcar-venta-finalizada', (req, res) => {
    const ventaId = req.body.ventaId;

    // Aquí debes actualizar el estado de la venta en la base de datos a "finalizada"
    const query = 'UPDATE Ventas SET Estado = ? WHERE IDVenta = ?';
    const values = ['finalizada', ventaId];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error al marcar la venta como finalizada:', error);
            res.status(500).send('Error al marcar la venta como finalizada.');
        } else {
            console.log('Venta marcada como finalizada exitosamente.');
            res.redirect('/ventas'); // Redirigir a la página de ventas para refrescar la lista
        }
    });
});

function calcularTotalVentas(ventas) {
    // Implementa la lógica para calcular el total de ventas
    let total = 0;
    for (const venta of ventas) {
        total += venta.TotalFinal;
    }
    return total;
}



// ...

// Importa los módulos necesarios y configura la conexión a la base de datos
// ...

// Importa los módulos necesarios y configura la conexión a la base de datos
function obtenerDatosDelReporte(tipoReporte, fechaReporte, callback) {
    const query = 'SELECT FechaVenta, IDEmpleado, IDCliente, TotalFinal FROM Ventas WHERE FechaVenta >= ? AND FechaVenta < ?';

    const startDate = new Date(fechaReporte);
    startDate.setHours(0, 0, 0, 0); // Establece la hora en 00:00:00 del día seleccionado

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // Agrega un día al día seleccionado
    endDate.setHours(0, 0, 0, 0); // Establece la hora en 00:00:00 del día siguiente

    connection.query(query, [startDate, endDate], (error, results) => {
        if (error) {
            console.error('Error al obtener los datos del reporte:', error);
            callback(error, null);
        } else {
            // Convertir los valores de TotalFinal a números decimales
            for (const venta of results) {
                venta.TotalFinal = parseFloat(venta.TotalFinal);
            }

            // Realizar los cálculos necesarios para obtener el total de ventas
            const totalVentas = calcularTotalVentas(results);
            const reporte = {
                tipoReporte: tipoReporte,
                ventas: results,
                totalVentas: totalVentas
            };
            callback(null, reporte);
        }
    });
}

// ...

app.post('/generar-reporte', (req, res) => {
    const tipoReporte = req.body.tipoReporte;
    const fechaReporte = req.body.fechaReporte; // Agrega esta línea para obtener la fecha del formulario
    obtenerDatosDelReporte(tipoReporte, fechaReporte, (error, reporte) => {
        if (error) {
            res.status(500).send('Error al obtener los datos del reporte.');
        } else {
            console.log(reporte);
            res.render('reporte', {
                reporte
            });
        }
    });
});

// ...


// Ruta para acceder a la página de selección de tipo de reporte
app.get('/seleccionar-reporte', (req, res) => {
    // Aquí obtienes los datos del reporte y los almacenas en una variable llamada 'reporte'
    obtenerDatosDelReporte(req.body.tipoReporte, (error, reporte) => {
        if (error) {
            res.status(500).send('Error al obtener los datos del reporte.');
        } else {
            // Luego, renderizas la vista 'reporte.ejs' y pasas la variable 'reporte' al template
            res.render('reporte', {
                reporte: reporte
            });
        }
    });
});



// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});