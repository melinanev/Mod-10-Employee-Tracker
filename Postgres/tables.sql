drop database if exists
employee_tracker_db;
create database employee_tracker_db;
\c employee_tracker_db;




CREATE TABLE Departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    department_id INTEGER NOT NULL,
    constraint fk_department foreign key (department_id) REFERENCES Departments(id)
);

CREATE TABLE Employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    constraint fk_role foreign key (role_id) REFERENCES Roles(id),
    manager_id INTEGER,
    constraint fk_manager foreign key (manager_id) REFERENCES Employees(id)
);