import React from 'react';

// --- NEW & UPDATED ICONS ---

// Icon for deletable roles
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

// Icon for the "Add New Role" button
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" width="16" height="16">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

// Icon for the "Locked" pill
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H4.5a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

// Updated component to render the correct permission icon (Check or Cross)
const PermissionIcon = ({ granted }) => {
    return (
        <span className={`permission-icon-wrapper ${granted ? 'granted' : 'denied'}`}>
            {granted ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
        </span>
    );
};


const RoleManagementView = ({ roles, handleOpenAddRoleModal, onOpenDeleteRoleModal }) => {
    return (
        <div className="admin-card">
            <h3>Role Management</h3>
            <p>Define custom roles and their permissions for the system.</p>
            <button className="create-role-button" onClick={handleOpenAddRoleModal}>
                <PlusIcon /> Add New Role
            </button>

            <div className="role-list-container">
                <table className="role-table">
                    <thead>
                    <tr>
                        <th className="role-name-header">Role Name</th>
                        <th className="permission-header">Can Manage Users</th>
                        <th className="permission-header">Can Screen Applications</th>
                        <th className="permission-header">Can Manage Roles</th>
                        <th className="actions-header">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {roles.map((role) => (
                        <tr key={role.id}>
                            <td>{role.name.replace(/_/g, ' ')}</td>
                            <td className="permission-cell"><PermissionIcon granted={role.can_manage_users} /></td>
                            <td className="permission-cell"><PermissionIcon granted={role.can_screen_applications} /></td>
                            <td className="permission-cell"><PermissionIcon granted={role.can_manage_roles} /></td>
                            <td className="actions-cell">
                                {role.is_deletable ? (
                                    <button className="delete-role-button" onClick={() => onOpenDeleteRoleModal(role)} aria-label={`Delete role ${role.name}`}>
                                        <DeleteIcon />
                                    </button>
                                ) : (
                                    <div className="locked-role-pill">
                                        <LockIcon />
                                        <span>Base Role</span>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleManagementView;