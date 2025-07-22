// src/pages/AdminDashboardPage.js
import React, { useState, useMemo } from 'react';
import './DashboardPage.css';
import './AdminDashboard.css';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { initialUsers, initialRoles } from '../data/mockData';

const AdminDashboardPage = () => {
    // Get authentication state and functions from context
    const { logout, user } = useAuth();

    // Local state for this component
    const [users, setUsers] = useState(initialUsers);
    const [roles, setRoles] = useState(initialRoles);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isAddRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // Memoized function to filter users based on search and role selection
    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            (roleFilter === 'All' || u.role === roleFilter) &&
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery, roleFilter]);

    // Handler to open the "Assign Role" modal
    const handleOpenAssignModal = (userToEdit) => {
        setSelectedUser(userToEdit);
        setAssignModalOpen(true);
    };

    // Handler to update a user's role in the local state
    const handleAssignRole = (newRole) => {
        setUsers(users.map(u =>
            u.id === selectedUser.id ? { ...u, role: newRole } : u
        ));
        setAssignModalOpen(false);
    };

    // Handler to open the "Add New Role" modal
    const handleOpenAddRoleModal = () => {
        setNewRoleName('');
        setAddRoleModalOpen(true);
    };

    // Handler to add a new role to the local state
    const handleAddNewRole = () => {
        if (newRoleName && !roles.includes(newRoleName)) {
            setRoles([...roles, newRoleName]);
            setAddRoleModalOpen(false);
        } else {
            alert('Please enter a valid, unique role name.');
        }
    };

    // Helper function to get a CSS class based on the role name
    const getRoleClass = (role) => {
        const roleKey = role.split(' ')[0].toLowerCase();
        const validRoles = ['admin', 'screening', 'applicant'];
        return validRoles.includes(roleKey) ? `role-${roleKey}` : 'role-default';
    };

    return (
        <>
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <div className="header-user-info">
                        <span>Hi, {user ? user.name.split(' ')[0] : 'Admin'}</span>
                        <button className="logout-button" onClick={logout}>Logout</button>
                    </div>
                </header>
                <main className="dashboard-main">
                    <div className="admin-card">
                        <h3>User Management</h3>
                        <p>View and manage user roles within the system.</p>
                        <div className="controls-container">
                            <input
                                type="text"
                                placeholder="Search by user email..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select
                                className="filter-select custom-select"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="All">All Roles</option>
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <table className="user-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Current Role</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`role-pill ${getRoleClass(u.role)}`}>{u.role}</span></td>
                                        <td><button className="action-button" onClick={() => handleOpenAssignModal(u)}>Assign Role</button></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6a737d' }}>
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    <div className="admin-card">
                        <h3>Role Management</h3>
                        <p>Define new roles and their permissions.</p>
                        <button className="create-role-button" onClick={handleOpenAddRoleModal}>+ Add New Role</button>
                    </div>
                </main>
            </div>

            {/* Modal for Assigning Roles */}
            <Modal title="Assign Role" isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <p>Assign a new role to <strong>{selectedUser.name}</strong>.</p>
                        <select
                            className="custom-select"
                            style={{ width: '100%', border: '1px solid #dcdfe6', borderRadius: '6px' }}
                            defaultValue={selectedUser.role}
                            onChange={(e) => handleAssignRole(e.target.value)}
                        >
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                )}
            </Modal>

            {/* Modal for Adding New Roles */}
            <Modal title="Add New Role" isOpen={isAddRoleModalOpen} onClose={() => setAddRoleModalOpen(false)}>
                <div className="form-group">
                    <label htmlFor="newRole">Role Name</label>
                    <input
                        type="text"
                        id="newRole"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="e.g., Document Verifier"
                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #dcdfe6', borderRadius: '6px' }}
                    />
                </div>
                <button className="form-button" onClick={handleAddNewRole}>Create Role</button>
            </Modal>
        </>
    );
};

export default AdminDashboardPage;