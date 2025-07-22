// src/components/dashboard/FileUploader.js
import React, { useState } from 'react';
import './Dashboard.css';

const FileUploader = () => {
    // State for the single CSV file
    const [csvFile, setCsvFile] = useState(null);

    // NEW: State to hold the list of document files (PDFs, images, etc.)
    const [documentFiles, setDocumentFiles] = useState([]);

    const handleCsvChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCsvFile(e.target.files[0]);
        }
    };

    // NEW: Handler for the multiple document file input
    const handleDocumentChange = (e) => {
        if (e.target.files) {
            // Convert FileList to an array and store it
            setDocumentFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = () => {
        // NEW: Updated check to ensure both CSV and documents are selected
        if (!csvFile) {
            alert('Please select the applicant CSV file.');
            return;
        }
        if (documentFiles.length === 0) {
            alert('Please select the documents to verify (e.g., PDF, JPG files).');
            return;
        }

        // Simulate upload process
        alert(`Simulating upload for:\n- CSV: ${csvFile.name}\n- Documents: ${documentFiles.length} files\n\nProcessing will now begin...`);

        // In a real app, this is where you would package both csvFile
        // and documentFiles into a FormData object and send to the backend.
    };

    return (
        <div className="card">
            <h3>Upload Files for Verification</h3>
            <p>
                Upload the applicant CSV and all corresponding document files (e.g., PDFs, JPEGs).
            </p>

            {/* --- CSV Uploader --- */}
            <div className="uploader-area">
                <label>1. Select Applicant CSV File</label>
                <div className="file-input-wrapper">
                    <input type="file" id="csv-upload" accept=".csv" onChange={handleCsvChange} style={{ display: 'none' }} />
                    <label htmlFor="csv-upload" className="upload-label">
                        Choose CSV
                    </label>
                    <span className="file-name">{csvFile ? csvFile.name : 'No file selected'}</span>
                </div>
            </div>

            {/* --- NEW: Document Uploader --- */}
            <div className="uploader-area document-uploader">
                <label>2. Select Applicant Document Files</label>
                <div className="file-input-wrapper">
                    {/* The 'multiple' attribute allows selecting more than one file */}
                    <input type="file" id="doc-upload" multiple onChange={handleDocumentChange} style={{ display: 'none' }} />
                    <label htmlFor="doc-upload" className="upload-label">
                        Choose Documents
                    </label>
                    <span className="file-name">{documentFiles.length > 0 ? `${documentFiles.length} files selected` : 'No files selected'}</span>
                </div>

                {/* NEW: Display the list of selected document files */}
                {documentFiles.length > 0 && (
                    <div className="file-list">
                        <strong>Selected Documents:</strong>
                        <ul>
                            {documentFiles.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button onClick={handleUpload} className="upload-button">Upload and Process All Files</button>
        </div>
    );
};

export default FileUploader;