-- Seeds file to pre-populate the employee_tracker_db database

-- Clear existing data
TRUNCATE Departments, Roles, Employees RESTART IDENTITY CASCADE;

-- Insert departments
INSERT INTO Departments (name) VALUES
('Engineering'),
('Finance'),
('Legal'),
('Sales'),
('Marketing'),
('Human Resources');

-- Insert roles
INSERT INTO Roles (title, salary, department_id) VALUES
('Software Engineer', 120000.00, 1),
('Lead Engineer', 150000.00, 1),
('Accountant', 125000.00, 2),
('Finance Manager', 160000.00, 2),
('Lawyer', 190000.00, 3),
('Legal Team Lead', 250000.00, 3),
('Sales Representative', 85000.00, 4),
('Sales Lead', 100000.00, 4),
('Marketing Specialist', 70000.00, 5),
('Marketing Director', 140000.00, 5),
('HR Coordinator', 75000.00, 6),
('HR Manager', 110000.00, 6);

-- Insert employees (with managers)
-- First, insert employees with no manager
INSERT INTO Employees (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 2, NULL),       -- Lead Engineer (no manager)
('Mike', 'Chan', 4, NULL),      -- Finance Manager (no manager)
('Ashley', 'Rodriguez', 6, NULL), -- Legal Team Lead (no manager)
('Kunal', 'Singh', 8, NULL),    -- Sales Lead (no manager)
('Sarah', 'Lourd', 10, NULL),   -- Marketing Director (no manager)
('Tammer', 'Galal', 12, NULL);  -- HR Manager (no manager)

-- Then, insert employees with managers
INSERT INTO Employees (first_name, last_name, role_id, manager_id) VALUES
('Kevin', 'Tupik', 1, 1),        -- Software Engineer (John Doe as manager)
('Malia', 'Brown', 3, 2),        -- Accountant (Mike Chan as manager)
('Tom', 'Allen', 5, 3),          -- Lawyer (Ashley Rodriguez as manager)
('Jake', 'Johnson', 7, 4),       -- Sales Representative (Kunal Singh as manager)
('Emma', 'Watson', 9, 5),        -- Marketing Specialist (Sarah Lourd as manager)
('Robert', 'Smith', 11, 6);      -- HR Coordinator (Tammer Galal as manager)
