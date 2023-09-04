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
    database: 'discoteca',
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
    const { correo, contraseña } = req.body;
    // Aquí puedes realizar la lógica de autenticación con la base de datos y manejo de sesiones
});

// Ruta para el inicio de sesión
app.get('/sesion.html', (req, res) => {
    res.render('sesion', {
        mensajeError: null
    });
});

app.get('/usuarios.html', (req, res) => {
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
                const nombreUsuario = results[0].nombre;
                const tipoUsuario = results[0].tipo;

                if (tipoUsuario === 'administrador') {
                    // Redireccionar a la página de administrador
                    res.render('pagina-administrador', {
                        nombreUsuario
                    });
                } else if (tipoUsuario === 'empleado') {
                    // Redireccionar a la página de estudiante
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




// Ruta para manejar el registro de usuarios
app.post('/registrar', (req, res) => {
    const { nombre, email, password, tipo } = req.body;

    // Verifica el valor del campo "tipo" y asigna el tipo de cuenta correspondiente
    let tipoCuenta = '';
    if (tipo === 'empleado') {
        tipoCuenta = 'empleado';
    } else if (tipo === 'administrador') {
        tipoCuenta = 'administrador';
    }

    const query = 'INSERT INTO Empleados (nombre, email, password, TipoCuenta) VALUES (?, ?, ?, ?)';
    const values = [nombre, email, password, tipoCuenta];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error al guardar el usuario:', error);
            res.send('Error al registrar el usuario.');
        } else {
            console.log('Usuario registrado exitosamente.');
            res.send('Usuario registrado exitosamente.');
        }
    });
});

// Manejar la finalización del servidor y cerrar la conexión con la base de datos
process.on('SIGINT', () => {
    connection.end((err) => {
        if (err) {
            console.error('Error al cerrar la conexión con la base de datos  }
  
            // Rutas y configuración de Express
            // ...
            
            // Definición de la ruta para generar el reporte
            app.post('/generar-reporte', (req, res) => {
              const tipoReporte = req.body.tipoReporte;
              const reporte = obtenerDatosDelReporte(tipoReporte);
              res.render('reporte', { reporte });
            });
            
          
          
          // app.post('/generar-reporte', verificarSesion, (req, res) => {
          //     const tipoReporte = req.body.tipoReporte;
          
          //     if (tipoReporte === 'diario') {
          //         generarReporteDiario((error, totalVentas) => {
          //             if (error) {
          //                 res.status(500).send('Error al generar el reporte diario.');
          //             } else {
          //                 const reporte = {
          //                     tipoReporte: 'Diario',
          //                     totalVentas
          //                 };
          //                 res.render('reporte', { reporte });
          //             }
          //         });
          //     } else if (tipoReporte === 'semanal') {
          //         // Generar reporte semanal
          //         // ...
          //     } else if (tipoReporte === 'mensual') {
          //         // Generar reporte mensual
          //         // ...
          //     } else {
          //         res.status(400).send('Tipo de reporte inválido.');
          //     }
          // });
          
          
          app.post('/generar-reporte', (req, res) => {
              const tipoReporte = req.body.tipoReporte;
          
              // Aquí obtienes los datos del reporte según el tipo de reporte seleccionado
              const reporte = obtenerDatosDelReporte(tipoReporte);
          
              // Asegúrate de que reporte no sea undefined antes de renderizar la vista
              if (reporte) {
                  res.render('reporte', { reporte });
              } else {
                  res.status(500).send('Error al obtener los datos del reporte.');
              }
          });
  }
  
  // Rutas y configuración de Express
  // ...
  
  // Definición de la ruta para generar el reporte
  app.post('/generar-reporte', (req, res) => {
    const tipoReporte = req.body.tipoReporte;
    const reporte = obtenerDatosDelReporte(tipoReporte);
    res.render('reporte', { reporte });
  });
  


// app.post('/generar-reporte', verificarSesion, (req, res) => {
//     const tipoReporte = req.body.tipoReporte;

//     if (tipoReporte === 'diario') {
//         generarReporteDiario((error, totalVentas) => {
//             if (error) {
//                 res.status(500).send('Error al generar el reporte diario.');
//             } else {
//                 const reporte = {
//                     tipoReporte: 'Diario',
//                     totalVentas
//                 };
//                 res.render('reporte', { reporte });
//             }
//         });
//     } else if (tipoReporte === 'semanal') {
//         // Generar reporte semanal
//         // ...
//     } else if (tipoReporte === 'mensual') {
//         // Generar reporte mensual
//         // ...
//     } else {
//         res.status(400).send('Tipo de reporte inválido.');
//     }
// });


app.post('/generar-reporte', (req, res) => {
    const tipoReporte = req.body.tipoReporte;

    // Aquí obtienes los datos del reporte según el tipo de reporte seleccionado
    const reporte = obtenerDatosDelReporte(tipoReporte);

    // Asegúrate de que reporte no sea undefined antes de renderizar la vista
    if (reporte) {
        res.render('reporte', { reporte });
    } else {
        res.status(500).send('Error al obtener los datos del reporte.');
    }
});
          
        process.exit();
    });
});

// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
