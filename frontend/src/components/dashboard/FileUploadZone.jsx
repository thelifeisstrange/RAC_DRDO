// src/components/dashboard/FileUploadZone.jsx
import React from 'react';
import { useDropzone } from 'react-dropzone';

// A simple icon component to show different icons
const Icon = ({ name }) => {
  if (name === 'document-text-outline') return <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12.75h.008v.008h-.008v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
  if (name === 'images-outline') return <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
  return null;
};

const FileUploadZone = ({ onFileSelect, selectedFileCount, isMultiple, iconName, promptText, selectedFiles }) => {
  const onDrop = React.useCallback((acceptedFiles) => {
    if (onFileSelect) onFileSelect(acceptedFiles);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: isMultiple });

  const hasFiles = selectedFileCount > 0;
  const zoneClassName = `file-upload-zone ${isDragActive ? 'drag-active' : ''} ${hasFiles ? 'files-selected' : ''}`;

  return (
      <div {...getRootProps({ className: zoneClassName })}>
        <input {...getInputProps()} />

        {hasFiles ? (
            <div className="upload-status">
              <Icon name={iconName} />
              <div className="upload-status-text">
                <span>{selectedFileCount} file{selectedFileCount > 1 ? 's' : ''} selected</span>
                <div className="file-list-preview">
                  {Array.isArray(selectedFiles) ? selectedFiles.map(f => f.name).join(', ') : selectedFiles?.name}
                </div>
              </div>
            </div>
        ) : (
            <div className="upload-prompt">
              <Icon name={iconName} />
              <p>{isDragActive ? "Drop the files here..." : promptText}</p>
            </div>
        )}
      </div>
  );
};

export default FileUploadZone;