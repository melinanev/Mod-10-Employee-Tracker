import inquirer from "inquirer";
import DatabaseManager from "./databaseManager.js";

// Initialize database manager
const dbManager = new DatabaseManager();
await dbManager.init();
const questionsfirst = [
{
    type: "list",
    name: "userChoice",
    message: "What would you like to do?",
    choices: [
        // Employee options
        {
            name: "View All Employees",
            value: "VIEW_EMPLOYEES"
        },
        {
            name: "View Employees By Manager",
            value: "VIEW_EMPLOYEES_BY_MANAGER"
        },
        {
            name: "View Employees By Department",
            value: "VIEW_EMPLOYEES_BY_DEPARTMENT"
        },
        {
            name: "Add Employee",
            value: "ADD_EMPLOYEE"
        },
        {
            name: "Update Employee Role",
            value: "UPDATE_EMPLOYEE_ROLE"
        },
        {
            name: "Update Employee Manager",
            value: "UPDATE_EMPLOYEE_MANAGER"
        },
        {
            name: "Delete Employee",
            value: "DELETE_EMPLOYEE"
        },
        
        // Role options
        {
            name: "View All Roles",
            value: "VIEW_ROLES"
        },
        {
            name: "Add Role",
            value: "ADD_ROLE"
        },
        {
            name: "Delete Role",
            value: "DELETE_ROLE"
        },
        
        // Department options
        {
            name: "View All Departments",
            value: "VIEW_DEPARTMENTS"
        },
        {
            name: "View Department Budget",
            value: "VIEW_DEPARTMENT_BUDGET"
        },
        {
            name: "Add Department",
            value: "ADD_DEPARTMENT"
        },
        {
            name: "Delete Department",
            value: "DELETE_DEPARTMENT"
        },
        
        {
            name: "Quit",
            value: "QUIT"
        }
    ]
}

];

const viewEmployees = async () => {
    const employees = await dbManager.getAllEmployees();
    console.table(employees);
    askquestions();
}

const addEmployee = async () => {
    // Get all roles for selection
    const roles = await dbManager.getAllRoles();
    const roleChoices = roles.map(role => ({
        name: role.title,
        value: role.id
    }));
    
    // Get all employees for manager selection
    const employees = await dbManager.getAllEmployees();
    const employeeChoices = employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
    }));
    
    // Add 'None' option for manager
    employeeChoices.push({name: "None", value: null as unknown as number}); // Type assertion to fix TypeScript error
    
    // Prompt for employee details
    const {first_name, last_name, role_id, manager_id} = await inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "What is the employee's first name?"
        },
        {
            type: "input",
            name: "last_name",
            message: "What is the employee's last name?"
        },
        {
            type: "list",
            name: "role_id",
            message: "What is the employee's role?",
            choices: roleChoices
        },
        {
            type: "list",
            name: "manager_id",
            message: "Who is the employee's manager?",
            choices: employeeChoices
        }           
    ]);
    
    // Add employee to database
    await dbManager.addEmployee(first_name, last_name, role_id, manager_id);
    console.log(`Added ${first_name} ${last_name} to the database`);
    askquestions();
}

const updateEmployeeRole = async () => {
    // Get all employees for selection
    const employees = await dbManager.getAllEmployees();
    const employeeChoices = employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
    }));
    
    // Get all roles for selection
    const roles = await dbManager.getAllRoles();
    const roleChoices = roles.map(role => ({
        name: role.title,
        value: role.id
    }));
    
    // Prompt for employee and role selection
    const {id, role_id} = await inquirer.prompt([
        {
            type: "list",
            name: "id",
            message: "Which employee's role would you like to update?",
            choices: employeeChoices
        },
        {
            type: "list",
            name: "role_id",
            message: "What is the employee's new role?",
            choices: roleChoices
        }
    ]);
    
    // Update employee role in database
    await dbManager.updateEmployeeRole(id, role_id);
    console.log(`Updated employee's role`);
    askquestions();
}

// Bonus functionality: Update employee manager
const updateEmployeeManager = async () => {
    // Get all employees for selection
    const employees = await dbManager.getAllEmployees();
    const employeeChoices = employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
    }));
    
    // Select employee to update
    const { employeeId } = await inquirer.prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee's manager would you like to update?",
            choices: employeeChoices
        }
    ]);
    
    // Create manager choices (excluding the selected employee)
    const managerChoices = employees
        .filter(employee => employee.id !== employeeId)
        .map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));
    
    // Add None option for no manager
    managerChoices.push({ name: "None", value: null as unknown as number }); // Type assertion to fix TypeScript error
    
    // Select new manager
    const { managerId } = await inquirer.prompt([
        {
            type: "list",
            name: "managerId",
            message: "Who is the employee's new manager?",
            choices: managerChoices
        }
    ]);
    
    // Update the employee's manager in the database
    await dbManager.updateEmployeeManager(employeeId, managerId);
    console.log(`Updated employee's manager`);
    askquestions();
}

const viewRoles = async () => {
    const roles = await dbManager.getAllRoles();
    console.table(roles);
    askquestions();
}

const addRole = async () => {
    // Get all departments for selection
    const departments = await dbManager.getAllDepartments();
    const departmentChoices = departments.map(department => ({
        name: department.name,
        value: department.id
    }));
    
    // Prompt for role details
    const {title, salary, department_id} = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the title of the role?"
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary of the role?"
        },
        {
            type: "list",
            name: "department_id",
            message: "Which department does the role belong to?",
            choices: departmentChoices
        }
    ]);
    
    // Add role to database
    await dbManager.addRole(title, parseFloat(salary), department_id);
    console.log(`Added ${title} role to the database`);
    askquestions();
}

const viewDepartments = async () => {
    const departments = await dbManager.getAllDepartments();
    console.table(departments);
    askquestions();
}

const addDepartment = async () => {
    const {name} = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the department?"
        }
    ]);
    await dbManager.addDepartment(name);
    console.log(`Added ${name} department to the database`);
    askquestions();
}

// Bonus functionality: View employees by manager
const viewEmployeesByManager = async () => {
    // Get all employees who are managers
    const employees = await dbManager.getAllEmployees();
    const managers = employees.filter(emp => 
        employees.some(e => e.manager_id === emp.id)
    );
    
    // If no managers found
    if (managers.length === 0) {
        console.log('No managers found in the system');
        return askquestions();
    }
    
    // Create manager choices
    const managerChoices = managers.map(manager => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id
    }));
    
    // Select a manager
    const { managerId } = await inquirer.prompt([
        {
            type: "list",
            name: "managerId",
            message: "Which manager's employees would you like to view?",
            choices: managerChoices
        }
    ]);
    
    // Get employees for the selected manager
    const managerEmployees = await dbManager.getEmployeesByManager(managerId);
    if (managerEmployees.length === 0) {
        console.log('This manager has no direct reports');
    } else {
        console.table(managerEmployees);
    }
    askquestions();
}

// Bonus functionality: View employees by department
const viewEmployeesByDepartment = async () => {
    // Get all departments
    const departments = await dbManager.getAllDepartments();
    
    // Create department choices
    const departmentChoices = departments.map(dept => ({
        name: dept.name,
        value: dept.id
    }));
    
    // Select a department
    const { departmentId } = await inquirer.prompt([
        {
            type: "list",
            name: "departmentId",
            message: "Which department's employees would you like to view?",
            choices: departmentChoices
        }
    ]);
    
    // Get employees for the selected department
    const departmentEmployees = await dbManager.getEmployeesByDepartment(departmentId);
    if (departmentEmployees.length === 0) {
        console.log('This department has no employees');
    } else {
        console.table(departmentEmployees);
    }
    askquestions();
}

// Bonus functionality: View department budget
const viewDepartmentBudget = async () => {
    // Get all departments
    const departments = await dbManager.getAllDepartments();
    
    // Create department choices
    const departmentChoices = departments.map(dept => ({
        name: dept.name,
        value: dept.id
    }));
    
    // Select a department
    const { departmentId } = await inquirer.prompt([
        {
            type: "list",
            name: "departmentId",
            message: "Which department's budget would you like to view?",
            choices: departmentChoices
        }
    ]);
    
    // Get budget for the selected department
    const budget = await dbManager.getDepartmentBudget(departmentId);
    const department = departments.find(d => d.id === departmentId);
    
    console.log(`The total utilized budget of ${department?.name} is $${budget.toLocaleString()}`);
    askquestions();
}

// Bonus functionality: Delete department
const deleteDepartment = async () => {
    // Get all departments
    const departments = await dbManager.getAllDepartments();
    
    // Create department choices
    const departmentChoices = departments.map(dept => ({
        name: dept.name,
        value: dept.id
    }));
    
    // Select a department to delete
    const { departmentId } = await inquirer.prompt([
        {
            type: "list",
            name: "departmentId",
            message: "Which department would you like to delete?",
            choices: departmentChoices
        }
    ]);
    
    // Confirm deletion
    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Are you sure you want to delete this department? This action cannot be undone.",
            default: false
        }
    ]);
    
    if (confirm) {
        const success = await dbManager.deleteDepartment(departmentId);
        if (success) {
            console.log(`Department deleted successfully`);
        } else {
            console.log(`Could not delete department. It may have roles assigned to it.`);
        }
    } else {
        console.log('Department deletion cancelled');
    }
    
    askquestions();
}

// Bonus functionality: Delete role
const deleteRole = async () => {
    // Get all roles
    const roles = await dbManager.getAllRoles();
    
    // Create role choices
    const roleChoices = roles.map(role => ({
        name: `${role.title} (${role.department_name})`,
        value: role.id
    }));
    
    // Select a role to delete
    const { roleId } = await inquirer.prompt([
        {
            type: "list",
            name: "roleId",
            message: "Which role would you like to delete?",
            choices: roleChoices
        }
    ]);
    
    // Confirm deletion
    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Are you sure you want to delete this role? This action cannot be undone.",
            default: false
        }
    ]);
    
    if (confirm) {
        const success = await dbManager.deleteRole(roleId);
        if (success) {
            console.log(`Role deleted successfully`);
        } else {
            console.log(`Could not delete role. It may have employees assigned to it.`);
        }
    } else {
        console.log('Role deletion cancelled');
    }
    
    askquestions();
}

// Bonus functionality: Delete employee
const deleteEmployee = async () => {
    // Get all employees
    const employees = await dbManager.getAllEmployees();
    
    // Create employee choices
    const employeeChoices = employees.map(emp => ({
        name: `${emp.first_name} ${emp.last_name} (${emp.role_title})`,
        value: emp.id
    }));
    
    // Select an employee to delete
    const { employeeId } = await inquirer.prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee would you like to delete?",
            choices: employeeChoices
        }
    ]);
    
    // Confirm deletion
    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Are you sure you want to delete this employee? This action cannot be undone.",
            default: false
        }
    ]);
    
    if (confirm) {
        const success = await dbManager.deleteEmployee(employeeId);
        if (success) {
            console.log(`Employee deleted successfully`);
        } else {
            console.log(`Could not delete employee.`);
        }
    } else {
        console.log('Employee deletion cancelled');
    }
    
    askquestions();
}



const askquestions = async () => {
    const answers = await inquirer.prompt(questionsfirst);

    switch (answers.userChoice) {
        // Employee operations
        case "VIEW_EMPLOYEES":
            viewEmployees();
            break;
        case "VIEW_EMPLOYEES_BY_MANAGER":
            viewEmployeesByManager();
            break;
        case "VIEW_EMPLOYEES_BY_DEPARTMENT":
            viewEmployeesByDepartment();
            break;
        case "ADD_EMPLOYEE":
            addEmployee();
            break;
        case "UPDATE_EMPLOYEE_ROLE":
            updateEmployeeRole();
            break;
        case "UPDATE_EMPLOYEE_MANAGER":
            updateEmployeeManager();
            break;
        case "DELETE_EMPLOYEE":
            deleteEmployee();
            break;
        
        // Role operations
        case "VIEW_ROLES":
            viewRoles();
            break;
        case "ADD_ROLE":
            addRole();
            break;
        case "DELETE_ROLE":
            deleteRole();
            break;
        
        // Department operations
        case "VIEW_DEPARTMENTS":
            viewDepartments();
            break;
        case "VIEW_DEPARTMENT_BUDGET":
            viewDepartmentBudget();
            break;
        case "ADD_DEPARTMENT":
            addDepartment();
            break;
        case "DELETE_DEPARTMENT":
            deleteDepartment();
            break;

        case "QUIT":
            // Close database connection before exiting
            await dbManager.close();
            console.log('Goodbye!');
            process.exit();
    }
}

askquestions();