import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './DashboardPage.css';
import './AdminDashboardPage.css';

import Sidebar from '../components/dashboard/Sidebar.jsx';
import UserManagementView from './UserManagementView.jsx';
import RoleManagementView from './RoleManagementView.jsx';
import VerificationCenter from './VerificationCenter.jsx';
import Modal from '../components/common/Modal.jsx'; // Assuming a generic modal exists here
import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboardPage = () => {
    const { logout, user, authTokens } = useAuth();

    // Core Data State
    const [activeView, setActiveView] = useState('userManagement');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter and Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // Modal and Selection State
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isDeleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [isAddRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const [newRole, setNewRole] = useState({
        name: '',
        can_manage_users: false,
        can_screen_applications: false,
        can_manage_roles: false,
    });

    const fetchData = async () => {
        setIsLoading(true);
        if (!authTokens) {
            setIsLoading(false);
            return;
        }
        const config = { headers: { 'Authorization': `Bearer ${authTokens.access}` } };
        try {
            const [usersRes, rolesRes] = await Promise.all([
                axios.get('http://localhost:8000/api/users/', config),
                axios.get('http://localhost:8000/api/roles/', config)
            ]);
            setUsers(usersRes.data.map(u => ({ ...u, name: u.first_name || u.email })));
            setRoles(rolesRes.data);
        } catch (error) {
            toast.error("Could not load initial dashboard data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [authTokens]);

    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            (roleFilter === 'All' || u.role?.name === roleFilter) &&
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery, roleFilter]);

    const handleAssignRole = async (roleId) => {
        if (!selectedUser || !authTokens) return;
        const roleName = roleId ? roles.find(r => r.id === parseInt(roleId))?.name.replace(/_/g, ' ') : 'No Role';
        const loadingToastId = toast.loading(`Assigning role to ${selectedUser.name}...`);
        const config = { headers: { 'Authorization': 'Bearer ' + authTokens.access } };
        try {
            await axios.patch(`http://localhost:8000/api/users/${selectedUser.id}/`, { role: roleId || null }, config);
            toast.dismiss(loadingToastId);
            toast.success(`Role "${roleName}" assigned to ${selectedUser.name} successfully!`);
            await fetchData();
            setAssignModalOpen(false);
        } catch (error) {
            toast.dismiss(loadingToastId);
            toast.error(`Failed to assign role to ${selectedUser.name}.`);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser || !authTokens) return;
        if (selectedUser.id === user.user_id) {
            toast.error("You cannot delete your own account.");
            setDeleteUserModalOpen(false);
            return;
        }
        const loadingToastId = toast.loading(`Deleting user ${selectedUser.name}...`);
        const config = { headers: { 'Authorization': `Bearer ${authTokens.access}` } };
        try {
            await axios.delete(`http://localhost:8000/api/users/${selectedUser.id}/`, config);
            toast.dismiss(loadingToastId);
            toast.success(`User ${selectedUser.name} deleted successfully!`);
            await fetchData();
            setDeleteUserModalOpen(false);
        } catch (error) {
            toast.dismiss(loadingToastId);
            toast.error(`Failed to delete user ${selectedUser.name}.`);
        }
    };

    const handleAddNewRole = async () => {
        const trimmedName = newRole.name.trim();
        if (!trimmedName) return toast.error("Role name cannot be empty.");
        if (!authTokens) return toast.error("Authentication error. Please log in again.");

        const roleValue = trimmedName.toUpperCase().replace(/\s+/g, '_');
        if (roles.some(r => r.name === roleValue)) {
            return toast.error(`A role named "${trimmedName}" already exists.`);
        }
        const loadingToastId = toast.loading(`Creating role "${trimmedName}"...`);
        const config = { headers: { 'Authorization': 'Bearer ' + authTokens.access } };
        const dataToSend = {
            name: roleValue,
            can_manage_users: newRole.can_manage_users,
            can_screen_applications: newRole.can_screen_applications,
            can_manage_roles: newRole.can_manage_roles
        };
        try {
            await axios.post('http://localhost:8000/api/roles/', dataToSend, config);
            toast.dismiss(loadingToastId);
            toast.success(`Role "${trimmedName}" created successfully!`);
            await fetchData();
            setAddRoleModalOpen(false);
        } catch (error) {
            toast.dismiss(loadingToastId);
            toast.error(`Failed to create role "${trimmedName}".`);
        }
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;
        const prettyRoleName = roleToDelete.name.replace(/_/g, ' ');
        const loadingToastId = toast.loading(`Deleting role "${prettyRoleName}"...`);
        const config = { headers: { 'Authorization': `Bearer ${authTokens.access}` } };
        try {
            await axios.delete(`http://localhost:8000/api/roles/${roleToDelete.id}/`, config);
            toast.dismiss(loadingToastId);
            toast.success(`Role "${prettyRoleName}" deleted successfully!`);
            await fetchData();
            setRoleToDelete(null); // Close modal
        } catch (err) {
            toast.dismiss(loadingToastId);
            toast.error(`Failed to delete role "${prettyRoleName}".`);
        }
    };

    const handleOpenAssignModal = (userToEdit) => {
        setSelectedUser(userToEdit);
        setAssignModalOpen(true);
    };

    const handleOpenDeleteUserModal = (userToDelete) => {
        setSelectedUser(userToDelete);
        setDeleteUserModalOpen(true);
    };

    const handleOpenDeleteRoleModal = (role) => {
        setRoleToDelete(role);
    };

    const handleOpenAddRoleModal = () => {
        setNewRole({ name: '', can_manage_users: false, can_screen_applications: false, can_manage_roles: false });
        setAddRoleModalOpen(true);
    };

    const getRoleClass = (role) => {
        if (!role || !role.name) return 'role-default';
        return `role-${role.name.toLowerCase().replace('_', '-')}`;
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'screening':
                return <VerificationCenter />;
            case 'roleManagement':
                return <RoleManagementView
                    roles={roles}
                    handleOpenAddRoleModal={handleOpenAddRoleModal}
                    onOpenDeleteRoleModal={handleOpenDeleteRoleModal}
                />;
            case 'userManagement':
            default:
                return <UserManagementView
                    isLoading={isLoading}
                    filteredUsers={filteredUsers}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    roles={roles.map(r => ({ value: r.name, label: r.name.replace(/_/g, ' ') }))}
                    getRoleClass={getRoleClass}
                    handleOpenAssignModal={handleOpenAssignModal}
                    handleOpenDeleteModal={handleOpenDeleteUserModal}
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
                        <select
                            className="custom-select"
                            style={{ width: '100%' }}
                            defaultValue={selectedUser.role?.id || ''}
                            onChange={(e) => handleAssignRole(e.target.value)}
                        >
                            <option value="">No Role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                )}
            </Modal>

            <Modal title="Confirm User Deletion" isOpen={isDeleteUserModalOpen} onClose={() => setDeleteUserModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <p>Are you sure you want to permanently delete the user <strong>{selectedUser.name}</strong> ({selectedUser.email})?</p>
                        <p className="delete-warning">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="button-secondary" onClick={() => setDeleteUserModalOpen(false)}>Cancel</button>
                            <button className="button-danger" onClick={handleDeleteUser}>Delete User</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal title="Confirm Role Deletion" isOpen={!!roleToDelete} onClose={() => setRoleToDelete(null)}>
                {roleToDelete && (
                    <div>
                        <p>Are you sure you want to permanently delete the role <strong>"{roleToDelete.name.replace(/_/g, ' ')}"</strong>?</p>
                        <p className="delete-warning">This action cannot be undone. Users with this role will be unassigned.</p>
                        <div className="modal-actions">
                            <button className="button-secondary" onClick={() => setRoleToDelete(null)}>Cancel</button>
                            <button className="button-danger" onClick={handleDeleteRole}>Delete Role</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal title="Add New Role" isOpen={isAddRoleModalOpen} onClose={() => setAddRoleModalOpen(false)}>
                <div className="form-group">
                    <label htmlFor="roleName">Role Name</label>
                    <input id="roleName" type="text" value={newRole.name} onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Document Verifier" style={{ width: '100%', padding: '0.8rem', border: '1px solid #dcdfe6', borderRadius: '6px' }} />
                    <div className="permission-row"><label htmlFor="manageUsers">Can manage users</label><input type="checkbox" id="manageUsers" checked={newRole.can_manage_users} onChange={e => setNewRole(prev => ({ ...prev, can_manage_users: e.target.checked }))} /></div>
                    <div className="permission-row"><label htmlFor="screenApps">Can screen applications</label><input type="checkbox" id="screenApps" checked={newRole.can_screen_applications} onChange={e => setNewRole(prev => ({ ...prev, can_screen_applications: e.target.checked }))} /></div>
                    <div className="permission-row"><label htmlFor="manageRoles">Can manage roles</label><input type="checkbox" id="manageRoles" checked={newRole.can_manage_roles} onChange={e => setNewRole(prev => ({ ...prev, can_manage_roles: e.target.checked }))} /></div>
                </div>
                <button className="form-button" onClick={handleAddNewRole}>Create Role</button>
            </Modal>
        </>
    );
};

export default AdminDashboardPage;