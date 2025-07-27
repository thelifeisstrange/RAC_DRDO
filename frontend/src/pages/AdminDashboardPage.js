// src/pages/AdminDashboardPage.js
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import './DashboardPage.css';
import './AdminDashboard.css';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { initialRoles } from '../data/mockData';

const AdminDashboardPage = () => {
    const { logout, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState(initialRoles);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const fetchUsers = () => {
        const tokens = JSON.parse(localStorage.getItem('drdo-authTokens'));
        if (!tokens) return;
        const config = { headers: { 'Authorization': `Bearer ${tokens.access}` } };

        axios.get('http://localhost:8000/api/users/', config)
            .then(response => {
                const formattedUsers = response.data.map(u => ({
                    id: u.id,
                    name: u.first_name || u.email,
                    email: u.email,
                    role: u.role
                }));
                setUsers(formattedUsers);
            })
            .catch(error => console.error("Error fetching users:", error));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAssignRole = async (newRole) => {
        if (!selectedUser) return;
        const tokens = JSON.parse(localStorage.getItem('drdo-authTokens'));
        if (!tokens) return;
        const config = { headers: { 'Authorization': `Bearer ${tokens.access}` } };
        const updatedData = { role: newRole };
        try {
            await axios.patch(`http://localhost:8000/api/users/${selectedUser.id}/`, updatedData, config);
            fetchUsers();
            setAssignModalOpen(false);
        } catch (error) {
            console.error("Failed to update user role:", error);
            alert("An error occurred while updating the role.");
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => (roleFilter === 'All' || u.role === roleFilter) && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [users, searchQuery, roleFilter]);

    const handleOpenAssignModal = (userToEdit) => {
        setSelectedUser(userToEdit);
        setAssignModalOpen(true);
    };

    // --- THIS IS THE UPDATED HELPER FUNCTION ---
    const getRoleClass = (role) => {
        if (!role) return 'role-default';
        // This correctly converts "SCREENING_MEMBER" to "role-screening-member"
        return `role-${role.toLowerCase().replace('_', '-')}`;
    };

    const [isAddRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const handleOpenAddRoleModal = () => { setNewRoleName(''); setAddRoleModalOpen(true); };
    const handleAddNewRole = () => { if (newRoleName && !roles.includes(newRoleName)) { setRoles([...roles, newRoleName]); setAddRoleModalOpen(false); } else { alert('Please enter a valid, unique role name.'); }};

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
                <main className="dashboard-main">
                    <div className="admin-card">
                        <h3>User Management</h3>
                        <p>View and manage user roles within the system.</p>
                        <div className="controls-container"><input type="text" placeholder="Search by user email..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><select className="filter-select custom-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}><option value="All">All Roles</option>{roles.map(role => (<option key={role} value={role}>{role}</option>))}</select></div>
                        <table className="user-table"><thead><tr><th>Name</th><th>Email</th><th>Current Role</th><th>Action</th></tr></thead><tbody>{users.length > 0 ? (filteredUsers.map(u => (<tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><span className={`role-pill ${getRoleClass(u.role)}`}>{u.role}</span></td><td><button className="action-button" onClick={() => handleOpenAssignModal(u)}>Assign Role</button></td></tr>))) : (<tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6a737d' }}>Loading users or no users found...</td></tr>)}</tbody></table>
                    </div>
                    <div className="admin-card">
                        <h3>Role Management</h3>
                        <p>Define new roles and their permissions.</p>
                        <button className="create-role-button" onClick={handleOpenAddRoleModal}>+ Add New Role</button>
                    </div>
                </main>
            </div>
            <Modal title="Assign Role" isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)}>{selectedUser && (<div><p>Assign a new role to <strong>{selectedUser.name}</strong>.</p><select className="custom-select" style={{ width: '100%', border: '1px solid #dcdfe6', borderRadius: '6px' }} defaultValue={selectedUser.role} onChange={(e) => handleAssignRole(e.target.value)}>{roles.map(role => <option key={role} value={role}>{role}</option>)}</select></div>)}</Modal>
            <Modal title="Add New Role" isOpen={isAddRoleModalOpen} onClose={() => setAddRoleModalOpen(false)}><div className="form-group"><label htmlFor="newRole">Role Name</label><input type="text" id="newRole" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g., Document Verifier" style={{ width: '100%', padding: '0.8rem', border: '1px solid #dcdfe6', borderRadius: '6px' }} /></div><button className="form-button" onClick={handleAddNewRole}>Create Role</button></Modal>
        </>
    );
};
export default AdminDashboardPage;