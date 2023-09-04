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
