// src/pages/AdminDashboardPage.js
import React, { useState, useMemo } from 'react'; // NEW: Import useMemo for performance
import './DashboardPage.css';
import './AdminDashboard.css';
import Modal from '../components/common/Modal';

// Initial mock data - We'll add one more user to make filtering more obvious
const initialUsers = [
    { id: 1, name: 'Rohan Sharma', email: 'rohan.s@email.com', role: 'Screening Member' },
    { id: 2, name: 'Priya Singh', email: 'priya.s@email.com', role: 'Screening Member' },
    { id: 3, name: 'Amit Kumar', email: 'amit.k@email.com', role: 'Applicant' },
    { id: 4, name: 'Archit Yadav', email: 'archit.y@email.com', role: 'Admin' },
    { id: 5, name: 'Rushan Shaikh', email: 'stanley_1337@meta.org.in', role: 'Admin' },
];
const initialRoles = ['Admin', 'Screening Member', 'Applicant'];

const AdminDashboardPage = () => {
    const [users, setUsers] = useState(initialUsers);
    const [roles, setRoles] = useState(initialRoles);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isAddRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRoleName, setNewRoleName] = useState('');

    // --- NEW: State for search and filter controls ---
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // --- NEW: Memoized calculation to filter users based on search and role selection ---
    // This recalculates only when its dependencies (users, searchQuery, roleFilter) change.
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesRole = roleFilter === 'All' || user.role === roleFilter;
            const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }, [users, searchQuery, roleFilter]);


    const handleOpenAssignModal = (user) => {
        setSelectedUser(user);
        setAssignModalOpen(true);
    };

    const handleAssignRole = (newRole) => {
        setUsers(users.map(user =>
            user.id === selectedUser.id ? { ...user, role: newRole } : user
        ));
        setAssignModalOpen(false);
    };

    const handleOpenAddRoleModal = () => {
        setNewRoleName('');
        setAddRoleModalOpen(true);
    };

    const handleAddNewRole = () => {
        if (newRoleName && !roles.includes(newRoleName)) {
            setRoles([...roles, newRoleName]);
            setAddRoleModalOpen(false);
        } else {
            alert('Please enter a valid, unique role name.');
        }
    };

    const getRoleClass = (role) => {
        const roleKey = role.split(' ')[0].toLowerCase();
        const validRoles = ['admin', 'screening', 'applicant'];
        return validRoles.includes(roleKey) ? `role-${roleKey}` : 'role-default';
    }

    return (
        <>
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <span>RAC Portal</span>
                </header>
                <main className="dashboard-main">
                    <div className="admin-card">
                        <h3>User Management</h3>
                        <p>View and manage user roles within the system.</p>

                        {/* --- NEW: Search and Filter Controls Section --- */}
                        <div className="controls-container">
                            <input
                                type="text"
                                placeholder="Search by user email..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select
                                className="filter-select"
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
                            {/* --- NEW: We now map over 'filteredUsers' instead of the full 'users' list --- */}
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td><span className={`role-pill ${getRoleClass(user.role)}`}>{user.role}</span></td>
                                        <td><button className="action-button" onClick={() => handleOpenAssignModal(user)}>Assign Role</button></td>
                                    </tr>
                                ))
                            ) : (
                                // --- NEW: A helpful message to show when no users match the criteria ---
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

            {/* --- Modals (No changes needed here) --- */}
            <Modal title="Assign Role" isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <p>Assign a new role to <strong>{selectedUser.name}</strong>.</p>
                        <select
                            className="form-group"
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #dcdfe6', borderRadius: '6px' }}
                            defaultValue={selectedUser.role}
                            onChange={(e) => handleAssignRole(e.target.value)}
                        >
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                )}
            </Modal>
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
