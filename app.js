const express = require('express');
const {
    parseISO
} = require('date-fns');
const {
    utcToZonedTime,
    format
} = require('date-fns-tz');

const mysql = require('mysql2');
const path = require('path');

const moment = require('moment');


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


// Configura el idioma y la localización
moment.locale('es-co'); // Configura el idioma a español (Colombia)
app.locals.moment = moment; // Agrega Moment.js al contexto de EJS


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



app.get('/obtener-productos', verificarSesion, (req, res) => {
    // Obtener productos del inventario desde la base de datos
    const productosQuery = 'SELECT NombreProducto FROM InventarioProductos';

    connection.query(productosQuery, (errorProductos, resultsProductos) => {
        if (errorProductos) {
            console.error('Error al obtener los productos:', errorProductos);
            res.json({
                success: false,
                error: 'Error al obtener los productos.'
            });
        } else {
            // Crear una lista de nombres de productos
            const listaProductos = resultsProductos.map((producto) => producto.NombreProducto);

            // Devolver la lista de productos como respuesta JSON
            res.json({
                success: true,
                productos: listaProductos
            });
        }
    });
});

// Nuevo endpoint para obtener detalles de productos
// Nuevo endpoint para obtener detalles de productos
app.get('/obtener-detalles-producto', verificarSesion, (req, res) => {
    const searchTerm = req.query.searchTerm || '';
    const productosQuery = `SELECT IDProducto, NombreProducto, CantidadStock, PrecioProducto FROM InventarioProductos WHERE NombreProducto LIKE '%${searchTerm}%'`;

    console.log('Término de búsqueda:', searchTerm);

    // Realiza la consulta a la base de datos para buscar productos
    connection.query(productosQuery, (errorProductos, resultsProductos) => {
        if (errorProductos) {
            console.error('Error al obtener los productos:', errorProductos);
            res.status(500).json({
                error: 'Error al obtener los productos.'
            });
        } else {
            console.log('Resultados de búsqueda de productos:', resultsProductos);
            // Enviar los detalles de los productos en formato JSON
            res.json({
                productos: resultsProductos
            });
        }
    });
});



// Endpoint para redirigir a la página de realizar venta
app.get('/realizar-venta', verificarSesion, (req, res) => {
    // Renderizar la página HTML con los resultados
    res.render('realizar_venta');
});


app.get('/buscar-productos', verificarSesion, (req, res) => {
    const searchTerm = req.query.searchTerm || '';
    const productosQuery = `SELECT IDProducto, NombreProducto, CantidadStock, PrecioProducto FROM InventarioProductos WHERE NombreProducto LIKE '%${searchTerm}%'`;

    console.log('Término de búsqueda:', searchTerm);

    // Realiza la consulta a la base de datos para buscar productos
    connection.query(productosQuery, (errorProductos, resultsProductos) => {
        if (errorProductos) {
            console.error('Error al obtener los productos:', errorProductos);
            res.status(500).json({
                error: 'Error al obtener los productos.'
            });
        } else {
            console.log('Resultados de búsqueda de productos:', resultsProductos);
            // Enviar los detalles de los productos en formato JSON
            res.json({
                productos: resultsProductos
            });
        }
    });
});



app.post('/guardar-venta', (req, res) => {
    const {
        cliente,
        totalVenta,
        costosExtra,
        totalFinal,
        metodoPago,
        productosAgregados,
        ventaCancelada // Agrega ventaCancelada a las propiedades recibidas
    } = req.body;

    console.log('Datos del formulario:');
    console.log(req.body);

    const detallesVenta = [];

    try {
        const totalVentaCalculado = parseFloat(totalVenta.replace('$', ''));
        const totalExtra = parseFloat(costosExtra);
        const totalFinalNumerico = parseFloat(totalFinal.replace('$', ''));

        const fechaVenta = new Date();
        const IDEmpleado = req.session.IDEmpleado;

        console.log('Valores antes de la inserción:');
        console.log('Total Venta:', totalVentaCalculado);
        console.log('Total Extra:', totalExtra);
        console.log('Total Final:', totalFinalNumerico);
        console.log('Fecha Venta:', fechaVenta);
        console.log('ID Empleado:', IDEmpleado);
        console.log('Detalles Venta:', detallesVenta);
        console.log('Método de Pago:', metodoPago);

        const productosAgregadosObj = JSON.parse(productosAgregados); // Convertir a objeto JavaScript

        // Aquí comienzas a recorrer los productosAgregados
        for (const productoID in productosAgregadosObj) {
            console.log(`cada productoID: ${productoID}`);
            if (productosAgregadosObj.hasOwnProperty(productoID)) {
                const producto = productosAgregadosObj[productoID];
        
                // Convertir productoID en un número entero
                const productoIDNumero = parseInt(productoID);
        
                // Verificar si productoID es un número válido
                if (!isNaN(productoIDNumero)) {
                    detallesVenta.push({
                        IDProducto: productoIDNumero, // Utiliza el ID del producto como número entero
                        CantidadVendida: producto.cantidad,
                        PrecioUnitario: producto.precio, // Debe ser el precio del producto
                    });
                } else {
                    console.error(`El productoID no es un número válido: ${productoID}`);
                }
        
                console.log(`Valor de producto:`, producto);
                console.log(`Valor de producto.cantidad: ${producto.cantidad}`);
                console.log(`Producto: ${producto.nombre}, Cantidad: ${producto.cantidad}`);
            }
        }
        
        // Modifica esta línea para manejar el valor del checkbox correctamente
        const estadoVenta = req.body.estado === 'on' ? 'finalizada' : 'pendiente';


        console.log('Detalles de Venta:', detallesVenta);

        const queryVenta = 'INSERT INTO Ventas (Cliente, IDEmpleado, FechaVenta, TotalVenta, TotalExtra, TotalFinal, MetodoPago, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const valuesVenta = [cliente, IDEmpleado, fechaVenta, totalVentaCalculado, totalExtra, totalFinalNumerico, metodoPago, estadoVenta];

        connection.query(queryVenta, valuesVenta, (error, resultsVenta) => {
            if (error) {
                console.error('Error en la consulta de venta:', error);
                res.status(500).send('Error al guardar la venta.');
            } else {
                const ventaID = resultsVenta.insertId;
                console.log('Venta registrada exitosamente. ID de Venta:', ventaID);

                //  const queryDetalles = 'INSERT INTO DetallesVenta (IDVenta, IDProducto, CantidadVendida) VALUES (?, ?, ?)';
                const queryDetalles = 'INSERT INTO DetallesVenta (IDVenta, IDProducto, PrecioUnitario, CantidadVendida) VALUES (?, ?, ?, ?)';

                for (const detalle of detallesVenta) {
                    console.log('Valor de productoID al llegar al servidor:', detalle.IDProducto);

                    const valuesDetalles = [ventaID, detalle.IDProducto, detalle.PrecioUnitario, detalle.CantidadVendida];

                    connection.query(queryDetalles, valuesDetalles, (detalleError, detalleResults) => {
                        if (detalleError) {
                            console.error('Error en la consulta de detalles:', detalleError);
                        } else {
                            console.log('Detalles de venta guardados exitosamente. ID de DetallesVenta:', detalleResults.insertId);

                            // Actualizar la cantidad de stock en la tabla InventarioProductos
                            const queryUpdateStock = 'UPDATE InventarioProductos SET CantidadStock = CantidadStock - ? WHERE IDProducto = ?';
                            const valuesUpdateStock = [detalle.CantidadVendida, detalle.IDProducto];

                            connection.query(queryUpdateStock, valuesUpdateStock, (updateError, updateResults) => {
                                if (updateError) {
                                    console.error('Error al actualizar el stock:', updateError);
                                } else {
                                    console.log('Stock actualizado exitosamente para el producto ID:', detalle.IDProducto);
                                }
                            });
                        }
                    });
                }

                res.redirect('/ventas');

            }
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).send('Error general al procesar la venta.');
    }
});





app.get('/ventas', verificarSesion, (req, res) => {
    const sql = 'SELECT * FROM Ventas ORDER BY FechaVenta DESC';
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


// Función para obtener los reportes desde la base de datos
function obtenerReportesDesdeLaBaseDeDatos(callback) {
    // const query = 'SELECT FechaVenta, TotalFinal FROM Ventas'; // Ajusta la consulta según tus necesidades
    const query = 'SELECT FechaVenta, CONVERT(TotalFinal, DECIMAL(10, 2)) AS Ganancia FROM Ventas'; // Ajusta la consulta según tus necesidades

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            callback([]);
        } else {
            const reportes = results.map(row => {
                return {
                    Fecha: row.FechaVenta,
                    Ganancia: row.TotalFinal
                };
            });
            callback(reportes);
        }
    });
}


// Ruta para mostrar la página de reportes
app.get('/reportes', (req, res) => {
    res.render('reportes', {
        reportes: []
    }); // Pasa un array vacío inicialmente
});


app.post('/generar-reporte', (req, res) => {
    const {
        reporteDiario,
        reporteSemanal,
        reporteMensual,
        fechaReporteDiario
    } = req.body;

    if (reporteDiario && !fechaReporteDiario) {
        return res.send('<script>alert("Debes seleccionar la fecha para generar el informe diario."); window.history.back();</script>');
    }

    let query = `
        SELECT v.IDVenta, v.FechaVenta, v.Cliente, SUM((d.PrecioUnitario - p.PrecioCompra) * d.CantidadVendida) AS GananciaTotal
        FROM Ventas v
        INNER JOIN DetallesVenta d ON v.IDVenta = d.IDVenta
        INNER JOIN InventarioProductos p ON d.IDProducto = p.IDProducto
    `;

    if (reporteDiario) {
        const fechaFin = new Date(fechaReporteDiario);
        fechaFin.setDate(fechaFin.getDate() + 1); // Agregar un día para incluir todo el día seleccionado
        query += ` WHERE v.FechaVenta >= '${fechaReporteDiario}' AND v.FechaVenta < '${fechaFin.toISOString()}'`;
    } else if (reporteSemanal) {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        query += ` WHERE v.FechaVenta >= '${oneWeekAgo.toISOString().split('T')[0]} 00:00:00'`;
    } else if (reporteMensual) {
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        query += ` WHERE v.FechaVenta >= '${oneMonthAgo.toISOString().split('T')[0]} 00:00:00'`;
    }

    query += `
        GROUP BY v.IDVenta
        ORDER BY v.FechaVenta
    `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta de reportes:', error);
            res.status(500).send('Error al generar el informe.');
        } else {
            const reportes = results.map(result => {
                const fecha = new Date(result.FechaVenta);
                const options = {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                };
                const horaFormateada = fecha.toLocaleTimeString('es-CO', options);
                const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()} - ${horaFormateada}`;

                return {
                    IDVenta: result.IDVenta,
                    Fecha: fechaFormateada,
                    NombreCliente: result.Cliente,
                    GananciaTotal: parseFloat(result.GananciaTotal)
                };
            });

            res.render('reportes', {
                reportes
            });
        }
    });
});




app.get('/detalles-venta/:id', (req, res) => {
    const ventaId = req.params.id;

    // Realiza la consulta a la base de datos para obtener los detalles de la venta con el ID especificado
    // Luego, renderiza la plantilla "detallesventa.ejs" con los datos de la venta

    res.render('detallesventa', {
        detallesVenta: detallesObtenidosDeLaBaseDeDatos
    });
});

// Ruta para editar la fecha de venta
app.get('/editar-venta/:id', verificarSesion, (req, res) => {
    const ventaId = req.params.id;

    const query = 'SELECT * FROM Ventas WHERE IDVenta = ?';
    connection.query(query, [ventaId], (error, results) => {
        if (error) {
            console.error('Error al obtener la venta:', error);
            return res.status(500).send('Error al obtener la venta');
        }

        const venta = results[0];

        if (!venta) {
            return res.status(404).send('Venta no encontrada');
        }

        const zonaHoraria = 'America/Bogota';
        const fechaVentaLocal = format(utcToZonedTime(venta.FechaVenta, zonaHoraria), "yyyy-MM-dd'T'HH:mm");

        res.render('editarventa', {
            venta,
            fechaVentaLocal
        });
    });
});

// Ruta para actualizar la fecha de venta
app.post('/editar-venta/:id', verificarSesion, (req, res) => {
    const ventaId = req.params.id;
    const {
        fechaVenta
    } = req.body;

    const updateQuery = 'UPDATE Ventas SET FechaVenta = ? WHERE IDVenta = ?';
    connection.query(updateQuery, [fechaVenta, ventaId], (error, results) => {
        if (error) {
            console.error('Error al actualizar la fecha de la venta:', error);
            return res.status(500).send('Error al actualizar la fecha de la venta');
        }

        console.log('Fecha de venta actualizada correctamente');
        res.redirect('/ventas');
    });
});


app.get('/ver-detalles-venta/:id', verificarSesion, (req, res) => {
    const ventaId = req.params.id;

    const detallesQuery = `
        SELECT DetallesVenta.*, InventarioProductos.NombreProducto
        FROM DetallesVenta
        INNER JOIN InventarioProductos ON DetallesVenta.IDProducto = InventarioProductos.IDProducto
        WHERE DetallesVenta.IDVenta = ?
    `;

    const ventaQuery = `
        SELECT Ventas.*, Ventas.Cliente AS ClienteNombre
        FROM Ventas
        WHERE Ventas.IDVenta = ?
    `;

    connection.query(detallesQuery, [ventaId], (error, detalles) => {
        if (error) {
            console.error('Error al obtener los detalles de la venta:', error);
            return res.status(500).send('Error al obtener los detalles de la venta');
        }

        connection.query(ventaQuery, [ventaId], (error, ventaInfo) => {
            if (error) {
                console.error('Error al obtener la información de la venta:', error);
                return res.status(500).send('Error al obtener la información de la venta');
            }

            const totalVentas = detalles.reduce((total, detalle) => total + (detalle.PrecioUnitario * detalle.CantidadVendida), 0);
            const totalExtra = parseFloat(ventaInfo[0].TotalExtra) || 0;

            res.render('verdetallesventa', {
                detalles,
                totalVentas,
                totalExtra,
                ventaInfo: ventaInfo[0]
            });
        });
    });
});




// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});