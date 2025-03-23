import { Pool, PoolClient } from 'pg';
import connectedpool from './db.js';

// Define types for our database entities
interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  title: string;
  salary: number;
  department_id: number;
  department_name?: string; // For joined queries
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  role_id: number;
  manager_id: number | null;
  role_title?: string;      // For joined queries
  department_name?: string; // For joined queries
  manager_name?: string;    // For joined queries
}

/**
 * DatabaseManager class to handle all database operations for the Employee Tracker
 */
class DatabaseManager {
  private client: PoolClient | null = null;

  /**
   * Initialize database connection
   */
  async init() {
    try {
      const connection = await connectedpool();
      if (connection) {
        this.client = connection;
        console.log('Database connection established');
      } else {
        throw new Error('Failed to establish database connection');
      }
    } catch (error) {
      console.error('Failed to connect to database:', error);
      process.exit(1);
    }
  }

  /**
   * Get all departments
   */
  async getAllDepartments(): Promise<Department[]> {
    try {
      const result = await this.client?.query('SELECT * FROM Departments ORDER BY name');
      return result?.rows || [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  /**
   * Add a new department
   */
  async addDepartment(name: string): Promise<boolean> {
    try {
      await this.client?.query('INSERT INTO Departments (name) VALUES ($1)', [name]);
      return true;
    } catch (error) {
      console.error('Error adding department:', error);
      return false;
    }
  }

  /**
   * Get all roles with department information
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      const query = `
        SELECT r.id, r.title, r.salary, r.department_id, d.name as department_name
        FROM Roles r
        JOIN Departments d ON r.department_id = d.id
        ORDER BY d.name, r.title
      `;
      const result = await this.client?.query(query);
      return result?.rows || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  /**
   * Add a new role
   */
  async addRole(title: string, salary: number, department_id: number): Promise<boolean> {
    try {
      await this.client?.query(
        'INSERT INTO Roles (title, salary, department_id) VALUES ($1, $2, $3)',
        [title, salary, department_id]
      );
      return true;
    } catch (error) {
      console.error('Error adding role:', error);
      return false;
    }
  }

  /**
   * Get all employees with role, department, and manager information
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const query = `
        SELECT 
          e.id, 
          e.first_name, 
          e.last_name, 
          e.role_id,
          e.manager_id,
          r.title AS role_title,
          d.name AS department_name,
          CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM Employees e
        LEFT JOIN Roles r ON e.role_id = r.id
        LEFT JOIN Departments d ON r.department_id = d.id
        LEFT JOIN Employees m ON e.manager_id = m.id
        ORDER BY d.name, e.last_name, e.first_name
      `;
      const result = await this.client?.query(query);
      return result?.rows || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  /**
   * Add a new employee
   */
  async addEmployee(first_name: string, last_name: string, role_id: number, manager_id: number | null): Promise<boolean> {
    try {
      await this.client?.query(
        'INSERT INTO Employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [first_name, last_name, role_id, manager_id]
      );
      return true;
    } catch (error) {
      console.error('Error adding employee:', error);
      return false;
    }
  }

  /**
   * Update an employee's role
   */
  async updateEmployeeRole(employee_id: number, role_id: number): Promise<boolean> {
    try {
      await this.client?.query(
        'UPDATE Employees SET role_id = $1 WHERE id = $2',
        [role_id, employee_id]
      );
      return true;
    } catch (error) {
      console.error('Error updating employee role:', error);
      return false;
    }
  }

  /**
   * Update an employee's manager
   */
  async updateEmployeeManager(employee_id: number, manager_id: number | null): Promise<boolean> {
    try {
      await this.client?.query(
        'UPDATE Employees SET manager_id = $1 WHERE id = $2',
        [manager_id, employee_id]
      );
      return true;
    } catch (error) {
      console.error('Error updating employee manager:', error);
      return false;
    }
  }

  /**
   * Get employees by manager
   */
  async getEmployeesByManager(manager_id: number): Promise<Employee[]> {
    try {
      const query = `
        SELECT 
          e.id, 
          e.first_name, 
          e.last_name, 
          e.role_id,
          r.title AS role_title
        FROM Employees e
        JOIN Roles r ON e.role_id = r.id
        WHERE e.manager_id = $1
        ORDER BY e.last_name, e.first_name
      `;
      const result = await this.client?.query(query, [manager_id]);
      return result?.rows || [];
    } catch (error) {
      console.error('Error fetching employees by manager:', error);
      return [];
    }
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(department_id: number): Promise<Employee[]> {
    try {
      const query = `
        SELECT 
          e.id, 
          e.first_name, 
          e.last_name, 
          e.role_id,
          r.title AS role_title
        FROM Employees e
        JOIN Roles r ON e.role_id = r.id
        WHERE r.department_id = $1
        ORDER BY e.last_name, e.first_name
      `;
      const result = await this.client?.query(query, [department_id]);
      return result?.rows || [];
    } catch (error) {
      console.error('Error fetching employees by department:', error);
      return [];
    }
  }

  /**
   * Delete a department (if no roles are assigned to it)
   */
  async deleteDepartment(department_id: number): Promise<boolean> {
    try {
      // Check if department has roles
      const rolesCheck = await this.client?.query(
        'SELECT COUNT(*) FROM Roles WHERE department_id = $1', 
        [department_id]
      );
      if (rolesCheck?.rows[0].count > 0) {
        console.error('Cannot delete department with assigned roles');
        return false;
      }
      
      await this.client?.query('DELETE FROM Departments WHERE id = $1', [department_id]);
      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      return false;
    }
  }

  /**
   * Delete a role (if no employees are assigned to it)
   */
  async deleteRole(role_id: number): Promise<boolean> {
    try {
      // Check if role has employees
      const employeesCheck = await this.client?.query(
        'SELECT COUNT(*) FROM Employees WHERE role_id = $1', 
        [role_id]
      );
      if (employeesCheck?.rows[0].count > 0) {
        console.error('Cannot delete role with assigned employees');
        return false;
      }
      
      await this.client?.query('DELETE FROM Roles WHERE id = $1', [role_id]);
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(employee_id: number): Promise<boolean> {
    try {
      // Check if employee is a manager for other employees
      const managerCheck = await this.client?.query(
        'SELECT COUNT(*) FROM Employees WHERE manager_id = $1', 
        [employee_id]
      );
      if (managerCheck?.rows[0].count > 0) {
        // Update managed employees to have no manager
        await this.client?.query(
          'UPDATE Employees SET manager_id = NULL WHERE manager_id = $1', 
          [employee_id]
        );
      }
      
      await this.client?.query('DELETE FROM Employees WHERE id = $1', [employee_id]);
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  }

  /**
   * Get department budget (sum of salaries for all employees in a department)
   */
  async getDepartmentBudget(department_id: number): Promise<number> {
    try {
      const query = `
        SELECT SUM(r.salary) as total_budget
        FROM Employees e
        JOIN Roles r ON e.role_id = r.id
        WHERE r.department_id = $1
      `;
      const result = await this.client?.query(query, [department_id]);
      return parseFloat(result?.rows[0].total_budget) || 0;
    } catch (error) {
      console.error('Error calculating department budget:', error);
      return 0;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.client) {
      this.client.release();
      console.log('Database connection closed');
    }
  }
}

export default DatabaseManager;
