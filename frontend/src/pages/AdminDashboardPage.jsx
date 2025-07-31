// src/pages/AdminDashboardPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './DashboardPage.css';
import './AdminDashboardPage.css';

import Sidebar from '../components/dashboard/Sidebar.jsx';
import UserManagementView from './UserManagementView.jsx';
import RoleManagementView from './RoleManagementView.jsx';
import Modal from '../components/common/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import VerificationCenter from './VerificationCenter.jsx';

const initialRoleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SCREENING_MEMBER', label: 'Screening Member' },
    { value: 'APPLICANT', label: 'Applicant' },
];

const AdminDashboardPage = () => {
    const { logout, user } = useAuth();

    const [activeView, setActiveView] = useState('userManagement');
    const [users, setUsers] = useState([]);
    const [currentRoleOptions, setCurrentRoleOptions] = useState(initialRoleOptions);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

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
        const loadingToastId = toast.loading('Updating role...');
        const tokens = JSON.parse(localStorage.getItem('drdo-authTokens'));
        if (!tokens) {
            toast.dismiss(loadingToastId);
            toast.error('Authentication error. Please log in again.');
            return;
        }
        const config = { headers: { 'Authorization': `Bearer ${tokens.access}` } };
        const updatedData = { role: newRoleValue };
        try {
            await axios.patch(`http://localhost:8000/api/users/${selectedUser.id}/`, updatedData, config);
            toast.dismiss(loadingToastId);
            toast.success('Role updated successfully!');
            fetchUsers();
            setAssignModalOpen(false);
        } catch (error) {
            toast.dismiss(loadingToastId);
            console.error("Failed to update user role:", error);
            toast.error("An error occurred while updating the role."); // --- REPLACED alert() ---
        }
    };

    const handleOpenAssignModal = (userToEdit) => { setSelectedUser(userToEdit); setAssignModalOpen(true); };
    const handleOpenAddRoleModal = () => { setNewRoleName(''); setAddRoleModalOpen(true); };

    const handleAddNewRole = () => {
        if (!newRoleName.trim()) {
            toast.error('Please enter a role name.'); // --- REPLACED alert() ---
            return;
        }
        const newRoleValue = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
        const newRole = { value: newRoleValue, label: newRoleName.trim() };

        // Check for duplicates
        if (currentRoleOptions.some(option => option.value === newRole.value)) {
            toast.error(`Role "${newRoleName.trim()}" already exists.`);
            return;
        }

        setCurrentRoleOptions(prevOptions => [...prevOptions, newRole]);
        toast.success(`Role "${newRole.label}" added for this session.`); // --- REPLACED alert() ---
        setNewRoleName('');
        setAddRoleModalOpen(false);
    };

    const getRoleClass = (role) => { if (!role) return 'role-default'; return `role-${role.toLowerCase().replace('_', '-')}`; };

    const renderActiveView = () => {
        switch (activeView) {
            case 'screening':
                return <VerificationCenter />;
            case 'roleManagement':
                return <RoleManagementView handleOpenAddRoleModal={handleOpenAddRoleModal} />;
            case 'userManagement':
            default:
                return <UserManagementView filteredUsers={filteredUsers} searchQuery={searchQuery} setSearchQuery={setSearchQuery} roleFilter={roleFilter} setRoleFilter={setRoleFilter} roles={currentRoleOptions} getRoleClass={getRoleClass} handleOpenAssignModal={handleOpenAssignModal} />;
        }
    };

    return (
        <>
            <div className="dashboard-container">
                <header className="dashboard-header"><h1>Admin Dashboard</h1><div className="header-user-info"><span>Hi, {user ? user.first_name : 'Admin'}</span><button className="logout-button" onClick={logout}>Logout</button></div></header>
                <div className="admin-dashboard-layout">
                    <Sidebar activeView={activeView} setActiveView={setActiveView} />
                    <main className="admin-content-area">{renderActiveView()}</main>
                </div>
            </div>

            <Modal title="Assign Role" isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)}>{selectedUser && (<div><p>Assign a new role to <strong>{selectedUser.name}</strong>.</p><select className="custom-select" style={{ width: '100%', border: '1px solid #dcdfe6', borderRadius: '6px' }} defaultValue={selectedUser.role} onChange={(e) => handleAssignRole(e.target.value)}>{currentRoleOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div>)}</Modal>
            <Modal title="Add New Role" isOpen={isAddRoleModalOpen} onClose={() => setAddRoleModalOpen(false)}><div className="form-group"><label htmlFor="newRole">Role Name</label><input type="text" id="newRole" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g., Document Verifier" style={{ width: '100%', padding: '0.8rem', border: '1px solid #dcdfe6', borderRadius: '6px' }} /></div><button className="form-button" onClick={handleAddNewRole}>Create Role</button></Modal>
        </>
    );
};
export default AdminDashboardPage;