// src/pages/AdminDashboardPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import './DashboardPage.css';
import './AdminDashboardPage.css';

// Import all the components that make up this page
import Sidebar from '../components/dashboard/Sidebar.jsx';
import UserManagementView from './UserManagementView.jsx';
import RoleManagementView from './RoleManagementView.jsx';
import Modal from '../components/common/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
// Import your friend's component
import VerificationCenter from './VerificationCenter.jsx';

// Role options for dropdowns
const roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SCREENING_MEMBER', label: 'Screening Member' },
    { value: 'APPLICANT', label: 'Applicant' },
];

const AdminDashboardPage = () => {
    const { logout, user } = useAuth();

    const [activeView, setActiveView] = useState('userManagement');

    // State for User & Role Management
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    // --- Data Fetching and Logic for User Management ---
    const fetchUsers = () => {
        const tokens = JSON.parse(localStorage.getItem('drdo-authTokens'));
        if (!tokens) return;
        const config = { headers: { 'Authorization': `Bearer ${tokens.access}` } };
        axios.get('http://localhost:8000/api/users/', config)
            .then(response => {
                const formattedUsers = response.data.map(u => ({ id: u.id, name: u.first_name || u.email, email: u.email, role: u.role }));
                setUsers(formattedUsers);
            })
            .catch(error => console.error("Error fetching users:", error));
    };

    useEffect(() => {
        if (activeView === 'userManagement') {
            fetchUsers();
        }
    }, [activeView]);

    const filteredUsers = useMemo(() => users.filter(u => (roleFilter === 'All' || u.role === roleFilter) && u.email.toLowerCase().includes(searchQuery.toLowerCase())), [users, searchQuery, roleFilter]);

    const handleAssignRole = async (newRoleValue) => {
        if (!selectedUser) return;
        const tokens = JSON.parse(localStorage.getItem('drdo-authTokens'));
        if (!tokens) return;
        const config = { headers: { 'Authorization': `Bearer ${tokens.access}` } };
        const updatedData = { role: newRoleValue };
        try {
            await axios.patch(`http://localhost:8000/api/users/${selectedUser.id}/`, updatedData, config);
            fetchUsers();
            setAssignModalOpen(false);
        } catch (error) {
            console.error("Failed to update user role:", error);
            alert("An error occurred while updating the role.");
        }
    };

    const handleOpenAssignModal = (userToEdit) => { setSelectedUser(userToEdit); setAssignModalOpen(true); };
    const handleOpenAddRoleModal = () => { setNewRoleName(''); setAddRoleModalOpen(true); };
    const handleAddNewRole = () => { /* Frontend-only simulation */ };
    const getRoleClass = (role) => { if (!role) return 'role-default'; return `role-${role.toLowerCase().replace('_', '-')}`; };

    // --- Helper function to render the correct view ---
    const renderActiveView = () => {
        switch (activeView) {
            case 'screening':
                return <VerificationCenter />;
            case 'roleManagement':
                return <RoleManagementView handleOpenAddRoleModal={handleOpenAddRoleModal} />;
            case 'userManagement':
            default:
                return <UserManagementView filteredUsers={filteredUsers} searchQuery={searchQuery} setSearchQuery={setSearchQuery} roleFilter={roleFilter} setRoleFilter={setRoleFilter} roles={roleOptions} getRoleClass={getRoleClass} handleOpenAssignModal={handleOpenAssignModal} />;
        }
    };

    return (
        <>
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <div className="header-user-info">
                        <span>Hi, {user ? user.first_name : 'Admin'}</span>
                        <button className="logout-button" onClick={logout}>Logout</button>
                    </div>
                </header>
                <div className="admin-dashboard-layout">
                    <Sidebar activeView={activeView} setActiveView={setActiveView} />
                    <main className="admin-content-area">
                        {renderActiveView()}
                    </main> {/* <-- THE FIX IS HERE */}
                </div>
            </div>

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
                            {roleOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </Modal>

            <Modal title="Add New Role" isOpen={isAddRoleModalOpen} onClose={() => setAddRoleModalOpen(false)}>
                <div className="form-group">
                    <label htmlFor="newRole">Role Name</label>
                    <input type="text" id="newRole" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g., Document Verifier" style={{ width: '100%', padding: '0.8rem', border: '1px solid #dcdfe6', borderRadius: '6px' }} />
                </div>
                <button className="form-button" onClick={handleAddNewRole}>Create Role</button>
            </Modal>
        </>
    );
};

export default AdminDashboardPage;