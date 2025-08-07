// src/pages/AdminDashboardPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './DashboardPage.css';
import './AdminDashboardPage.css';

import Sidebar from '../components/dashboard/Sidebar.jsx';
import UserManagementView from './UserManagementView.jsx';
import RoleManagementView from './RoleManagementView.jsx';
import VerificationCenter from './VerificationCenter.jsx';
import Modal from '../components/common/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const initialRoleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SCREENING_MEMBER', label: 'Screening Member' },
    { value: 'APPLICANT', label: 'Applicant' },
];

const AdminDashboardPage = () => {
    const { logout, user, authTokens } = useAuth();

    const [activeView, setActiveView] = useState('userManagement');
    const [users, setUsers] = useState([]);
    const [currentRoleOptions, setCurrentRoleOptions] = useState(initialRoleOptions);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isAddRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        if (!authTokens) {
            setIsLoadingUsers(false);
            return;
        }
        try {
            const config = { headers: { 'Authorization': `Bearer ${authTokens.access}` } };
            const response = await axios.get('http://localhost:8000/api/users/', config);
            const formattedUsers = response.data.map(u => ({ id: u.id, name: u.first_name || u.email, email: u.email, role: u.role }));
            setUsers(formattedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Could not load user data.");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (activeView === 'userManagement') {
            fetchUsers();
        }
    }, [activeView, authTokens]);

    const filteredUsers = useMemo(() => users.filter(u => (roleFilter === 'All' || u.role === roleFilter) && u.email.toLowerCase().includes(searchQuery.toLowerCase())), [users, searchQuery, roleFilter]);

    const handleAssignRole = async (newRoleValue) => {
        if (!selectedUser || !authTokens) return;

        const loadingToastId = toast.loading('Updating role...');
        const config = { headers: { 'Authorization': `Bearer ${authTokens.access}` } };
        const updatedData = { role: newRoleValue };

        try {
            await axios.patch(`http://localhost:8000/api/users/${selectedUser.id}/`, updatedData, config);

            toast.dismiss(loadingToastId);
            toast.success('Role updated successfully!');

            // Manually update the local state for an instant UI change.
            setUsers(currentUsers => currentUsers.map(u =>
                u.id === selectedUser.id ? { ...u, role: newRoleValue } : u
            ));

            setAssignModalOpen(false);
        } catch (error) {
            toast.dismiss(loadingToastId);
            toast.error("An error occurred while updating the role.");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser || !authTokens) return;
        if (selectedUser.id === user.user_id) {
            toast.error("You cannot delete your own account.");
            setDeleteModalOpen(false);
            return;
        }
        const loadingToastId = toast.loading('Deleting user...');
        const config = { headers: { 'Authorization': `Bearer ${authTokens.access}` } };
        try {
            await axios.delete(`http://localhost:8000/api/users/${selectedUser.id}/`, config);
            toast.dismiss(loadingToastId);
            toast.success('User deleted successfully!');
            // Manually remove the user from local state for an instant UI change.
            setUsers(currentUsers => currentUsers.filter(u => u.id !== selectedUser.id));
            setDeleteModalOpen(false);
        } catch (error) {
            toast.dismiss(loadingToastId);
            toast.error("Failed to delete user.");
        }
    };

    const handleOpenAssignModal = (userToEdit) => { setSelectedUser(userToEdit); setAssignModalOpen(true); };
    const handleOpenDeleteModal = (userToDelete) => { setSelectedUser(userToDelete); setDeleteModalOpen(true); };
    const handleOpenAddRoleModal = () => { setNewRoleName(''); setAddRoleModalOpen(true); };
    const handleAddNewRole = () => {
        if (!newRoleName.trim()) {
            toast.error('Please enter a role name.');
            return;
        }
        const newRoleValue = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
        const newRole = { value: newRoleValue, label: newRoleName.trim() };
        if (currentRoleOptions.some(option => option.value === newRole.value)) {
            toast.error(`Role "${newRole.label}" already exists.`);
            return;
        }
        setCurrentRoleOptions(prevOptions => [...prevOptions, newRole]);
        toast.success(`Role "${newRole.label}" added for this session.`);
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
                return <UserManagementView
                    isLoading={isLoadingUsers}
                    filteredUsers={filteredUsers}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    roles={currentRoleOptions}
                    getRoleClass={getRoleClass}
                    handleOpenAssignModal={handleOpenAssignModal}
                    handleOpenDeleteModal={handleOpenDeleteModal}
                />;
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
                    <main className="admin-content-area">{renderActiveView()}</main>
                </div>
            </div>

            <Modal title="Assign Role" isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <p>Assign a new role to <strong>{selectedUser.name}</strong>.</p>
                        <select className="custom-select" style={{ width: '100%' }} defaultValue={selectedUser.role} onChange={(e) => handleAssignRole(e.target.value)}>
                            {currentRoleOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                        </select>
                    </div>
                )}
            </Modal>

            <Modal title="Confirm Deletion" isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <p>Are you sure you want to permanently delete the user <strong>{selectedUser.name}</strong> ({selectedUser.email})?</p>
                        <p className="delete-warning">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="button-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                            <button className="button-danger" onClick={handleDeleteUser}>Delete User</button>
                        </div>
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