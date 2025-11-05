/**
 * Get the database model/schema name based on user role
 * @param {string} role - The user's role
 * @returns {string} The corresponding model name
 */
const getSchemaByRole = (role) => {
    switch (role) {
        case 'admin':
            return 'Admin';
        case 'manager':
            return 'Manager';
        case 'employee':
            return 'Employee';
        case 'deptHead':
            return 'DeptHead';
        default:
            return 'User';
    }
};

export default getSchemaByRole;
