// src/components/FileUpload.jsx

import React, { useState, useRef } from 'react';

const FileUpload = ({ title, onFileSelect, selectedFileCount, isMultiple }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };
  
  // Dynamically build the className string
  const zoneClassName = `file-upload-zone ${isDragActive ? 'drag-active' : ''} ${selectedFileCount > 0 ? 'files-selected' : ''}`;

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={zoneClassName}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={isMultiple}
        onChange={handleChange}
      />
      
      <svg className="upload-icon" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      
      <p className="upload-title">{title}</p>
      
      {selectedFileCount === 0 && (
        <p className="upload-prompt">Drag & drop files here, or click to select</p>
      )}
      
      {selectedFileCount > 0 && (
        <p className="upload-status">
          {selectedFileCount} file{selectedFileCount > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};

export default FileUpload;