-- CREATE DATABASE firstapi;

-- \l

-- \c firstapi;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(40),
    correo TEXT NOT NULL UNIQUE,
    edad INT CHECK (edad BETWEEN 1 AND 120),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);