// src/components/dashboard/FileUploadZone.jsx

import React, { useState, useRef } from 'react';

const FileUploadZone = ({ onFileSelect, selectedFileCount, isMultiple, iconName, promptText }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) onFileSelect(e.target.files);
  };

  const zoneClassName = `file-upload-zone ${isDragActive ? 'drag-active' : ''} ${selectedFileCount > 0 ? 'files-selected' : ''}`;

  return (
    <div className={zoneClassName} onClick={() => inputRef.current.click()} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
      <input ref={inputRef} type="file" multiple={isMultiple} onChange={handleChange} className="hidden" />
      
      {/* --- THIS IS THE CORRECTED LINE --- */}
      <ion-icon className="upload-icon" name={iconName}></ion-icon>
      
      {selectedFileCount > 0 ? (
        <p className="upload-status-text">
          {selectedFileCount} file{selectedFileCount > 1 ? 's' : ''} selected
        </p>
      ) : (
        <p>{promptText}</p>
      )}
    </div>
  );
};

export default FileUploadZone;