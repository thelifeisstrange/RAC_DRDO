import React from 'react';

const UserManagementView = ({
                                isLoading,
                                filteredUsers,
                                searchQuery,
                                setSearchQuery,
                                roleFilter,
                                setRoleFilter,
                                roles,
                                getRoleClass,
                                handleOpenAssignModal,
                                handleOpenDeleteModal,
                            }) => {
    return (
        <div className="admin-card">
            <h3>User Management</h3>
            <p>View and manage user roles within the system.</p>

            {/* Search & Filter Controls */}
            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by user email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                    className="filter-select custom-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="All">All Roles</option>
                    {roles.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Users Table */}
            <table className="user-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    {/* Align header to match the content */}
                    <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
                </thead>

                <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                            Loading users...
                        </td>
                    </tr>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                        <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                                <span className={`role-pill ${getRoleClass(u.role)}`}>
                                    {u.role?.name?.replace(/_/g, ' ') || 'No Role'}
                                </span>
                            </td>
                            {/* Ensure this cell's content is aligned to the right */}
                            <td className="action-buttons-cell">
                                {/* --- THIS BUTTON IS NOW STYLED CONDITIONALLY --- */}
                                <button
                                    className={`action-button ${!u.role ? 'primary' : ''}`}
                                    onClick={() => handleOpenAssignModal(u)}
                                >
                                    Assign Role
                                </button>
                                <button
                                    className="action-button delete"
                                    onClick={() => handleOpenDeleteModal(u)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                            No users found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementView;