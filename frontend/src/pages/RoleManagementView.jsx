// src/pages/RoleManagementView.js
import React from 'react';

const RoleManagementView = ({ handleOpenAddRoleModal }) => {
    return (
        <div className="admin-card">
            <h3>Role Management</h3>
            <p>Define new roles and their permissions.</p>
            <button className="create-role-button" onClick={handleOpenAddRoleModal}>+ Add New Role</button>
        </div>
    );
};

export default RoleManagementView;