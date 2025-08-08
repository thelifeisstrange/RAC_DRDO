//* src/components/common/ DeleteRoleModal.jsx
import React from 'react';
import './DeleteRoleModal.css'; // you can style this however you like

const DeleteRoleModal = ({ role, onClose, onConfirm }) => {
    if (!role) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3>Delete Role</h3>
                <p>
                    Are you sure you want to delete the role{' '}
                    <strong>"{role.name.replace(/_/g, ' ')}"</strong>?
                </p>
                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="confirm-btn" onClick={() => onConfirm(role)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteRoleModal;
