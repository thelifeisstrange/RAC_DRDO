import React from 'react';

const FolderPathInput = ({ path, onPathChange }) => {
  return (
    <div className="folder-path-input-wrapper">
      <ion-icon name="folder-open-outline"></ion-icon>
      <input
        type="text"
        className="folder-path-input"
        placeholder="/path/on/server/to/dataset"
        value={path}
        onChange={(e) => onPathChange(e.target.value)}
      />
    </div>
  );
};

export default FolderPathInput;