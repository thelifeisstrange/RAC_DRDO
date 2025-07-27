// src/pages/UserManagementView.jsx
import React from 'react';

const UserManagementView = ({ filteredUsers, searchQuery, setSearchQuery, roleFilter, setRoleFilter, roles, getRoleClass, handleOpenAssignModal }) => {
    return (
        <div className="admin-card">
            <h3>User Management</h3>
            <p>View and manage user roles within the system.</p>
            <div className="controls-container">
                <input type="text" placeholder="Search by user email..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <select className="filter-select custom-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="All">All Roles</option>

                    {/* --- THIS IS THE CORRECTED MAPPING --- */}
                    {roles.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                    {/* --- End of correction --- */}

                </select>
            </div>
            <table className="user-table">
                <thead><tr><th>Name</th><th>Email</th><th>Current Role</th><th>Action</th></tr></thead>
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
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users found...</td></tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementView;