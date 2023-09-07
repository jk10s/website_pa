-- Creación de la base de datos "discoteca"
CREATE DATABASE discoteca;

-- Selección de la base de datos
USE discoteca;

-- Creación de la tabla "Clientes"
CREATE TABLE Clientes (
    IDCliente INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100) NOT NULL,
    Telefono VARCHAR(15),
    CorreoElectronico VARCHAR(100) NOT NULL,
    OtrosDetalles TEXT
);

-- Creación de la tabla "Empleados"
CREATE TABLE Empleados (
    IDEmpleado INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    CorreoElectronico VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    TipoCuenta ENUM('administrador', 'empleado') NOT NULL,
    EsAdministrador BOOLEAN NOT NULL DEFAULT 0
);

-- Creación de la tabla "InventarioBebidas"
CREATE TABLE InventarioBebidas (
    IDBebida INT PRIMARY KEY AUTO_INCREMENT,
    NombreBebida VARCHAR(100) NOT NULL,
    TipoBebida VARCHAR(50) NOT NULL,
    PrecioUnidad DECIMAL(10, 2) NOT NULL,
    CantidadStock INT NOT NULL
);

-- Creación de la tabla "Ventas"
CREATE TABLE Ventas (
    IDVenta INT PRIMARY KEY AUTO_INCREMENT,
    IDCliente INT,
    IDEmpleado INT,
    FechaVenta DATETIME NOT NULL,
    TotalVenta DECIMAL(10, 2) NOT NULL,
    DetallesVenta TEXT,
    FOREIGN KEY (IDCliente) REFERENCES Clientes(IDCliente),
    FOREIGN KEY (IDEmpleado) REFERENCES Empleados(IDEmpleado)
);

-- Creación de la tabla "Reportes"
CREATE TABLE Reportes (
    IDReporte INT PRIMARY KEY AUTO_INCREMENT,
    TipoReporte ENUM('diario', 'semanal', 'mensual') NOT NULL,
    Fecha DATE, -- Utilizado para reportes diarios y semanales
    Mes INT, -- Utilizado para reportes mensuales
    Anio INT, -- Utilizado para reportes mensuales
    TotalVentas DECIMAL(10, 2) NOT NULL,
    OtrosDetalles TEXT
);

















CREATE DATABASE IF NOT EXISTS discotelapatrona;

USE discotelapatrona;

-- Tabla Empleados
CREATE TABLE IF NOT EXISTS Empleados (
    IDEmpleado INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    TipoCuenta ENUM('administrador','empleado') NOT NULL,
    EsAdministrador TINYINT(1) NOT NULL DEFAULT 0
);

-- Tabla InventarioProductos
CREATE TABLE IF NOT EXISTS InventarioProductos (
    IDProducto INT AUTO_INCREMENT PRIMARY KEY,
    NombreProducto VARCHAR(100) NOT NULL,
    PrecioCompra DECIMAL(10,2) NOT NULL,
    PrecioProducto DECIMAL(10,2) NOT NULL,
    CantidadStock INT NOT NULL
);

-- Tabla Ventas
CREATE TABLE IF NOT EXISTS Ventas (
    IDVenta INT AUTO_INCREMENT PRIMARY KEY,
    Cliente VARCHAR(255),
    IDEmpleado INT,
    FechaVenta DATETIME NOT NULL,
    TotalVenta DECIMAL(10,2) NOT NULL,
    TotalExtra DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    TotalFinal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Estado ENUM('pendiente','finalizada') NOT NULL DEFAULT 'pendiente',
    MetodoPago ENUM('efectivo','tarjeta','codigo_qr')
);

-- Tabla DetallesVenta
CREATE TABLE IF NOT EXISTS DetallesVenta (
    IDDetalleVenta INT AUTO_INCREMENT PRIMARY KEY,
    IDVenta INT,
    IDProducto INT,
    PrecioUnitario DECIMAL(10,2),
    CantidadVendida INT NOT NULL
);

-- Tabla Reportes
CREATE TABLE IF NOT EXISTS Reportes (
    IDReporte INT AUTO_INCREMENT PRIMARY KEY,
    TipoReporte ENUM('diario','semanal','mensual') NOT NULL,
    Fecha DATE,
    Mes INT,
    Anio INT,
    TotalVentas DECIMAL(10,2) NOT NULL,
    OtrosDetalles TEXT
);

