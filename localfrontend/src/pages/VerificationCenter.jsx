// src/pages/VerificationCenter.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './VerificationCenter.css';

// --- THE CRITICAL FIX: Correct the import paths to match your file structure ---
import FileUploadZone from '../components/FileUploadZone';
import LoadingState from '../components/LoadingState';
import DetailedTableView from '../components/DetailedTableView';
// We are NOT importing from '../components/dashboard/...'

const API_BASE_URL = 'http://127.0.0.1:8000/api/pipeline';

// This function transforms the simple backend's flat result format
// into the nested format the UI components expect.
const transformApiResult = (dataWrapper) => {
  const data = dataWrapper.data;
  const fields = ['name', 'father_name', 'reg_id', 'year', 'paper_code', 'score', 'scoreof100', 'rank'];
  const transformed = {
    id: data.id || 'N/A',
    sourceFile: data.id ? `${data.id}_GATE` : 'Unknown File',
    status: data.extracted_name === 'COMPRESSION_FAILED' ? 'Failed' : 'Complete',
    email: data.email,
    phone: data.phone
  };

  let matches = 0;
  fields.forEach(field => {
    const inputKey = `input_${field}`;
    const extractedKey = `extracted_${field}`;
    const statusKey = `${field}_status`;
    const componentKey = field === 'reg_id' ? 'registration_id' : field;

    const status = data[statusKey] === "True";
    if (status) matches++;

    transformed[componentKey] = {
      input: data[inputKey] || 'N/A',
      extracted: data[extractedKey] || 'N/A',
      status: status,
    };
  });
  transformed.matches = matches;
  transformed.totalFields = fields.length;
  return transformed;
};

const VerificationCenter = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [sourceFiles, setSourceFiles] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState('Awaiting files...');
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [results, setResults] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [isJobComplete, setIsJobComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const pollingIntervalRef = useRef(null);

  const pollJobStatus = (id) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/status/${id}/`);
        
        // --- THE CRITICAL FIX ---
        // The API response is a flat object. We access its properties directly.
        const jobStatus = response.data.status;
        const apiResults = response.data.results; // This is the array of { "data": {...} } objects
        
        // It's safe to map an empty array, this will result in an empty array.
        const transformedResults = apiResults.map(transformApiResult);
        setResults(transformedResults);
        
        setPipelineStatus(`Processing... ${transformedResults.length} / ${sourceFiles.length} files complete.`);
        
        // Check the jobStatus variable, not a non-existent 'job' object.
        if (jobStatus === 'COMPLETE' || jobStatus === 'FAILED') {
          clearInterval(pollingIntervalRef.current);
          setIsLoading(false);
          const finalMessage = jobStatus === 'COMPLETE' ? `✅ Process complete!` : `❌ Process failed.`;
          setPipelineStatus(finalMessage);
        }
      } catch (error) {
        console.error("Error fetching results:", error.response?.data || error.message);
        setPipelineStatus('❌ Error fetching results.');
        clearInterval(pollingIntervalRef.current);
        setIsLoading(false);
      }
    }, 3000);
  };

  const handleRunPipeline = async () => {
    setIsJobComplete(false);
    const formData = new FormData();
    formData.append('master_csv', csvFile);
    sourceFiles.forEach(file => formData.append('source_files', file));
    setIsLoading(true);
    setResults([]);
    setJobId(null);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    setPipelineStatus('Uploading files and starting job...');
    try {
      const response = await axios.post(`${API_BASE_URL}/start/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newJobId = response.data.id;
      setJobId(newJobId);
      setPipelineStatus('Job started! Fetching results...');
      pollJobStatus(newJobId);
    } catch (error) {
      setPipelineStatus(`❌ Error starting pipeline: ${error.response?.data?.error || 'Check console'}`);
      setIsLoading(false);
    }
  };

  const handleBulkSave = async () => {
    if (results.length === 0) return;
    setIsSaving(true);
    setPipelineStatus("Saving all results to the database...");
    
    const payloadData = results.map(res => {
      const flatData = { id: res.id, email: res.email, phone: res.phone };
      const fieldsToFlatten = ['name', 'father_name', 'registration_id', 'year', 'paper_code', 'score', 'scoreof100', 'rank'];
      fieldsToFlatten.forEach(field => {
        const componentKey = field;
        const backendKey = field === 'registration_id' ? 'reg_id' : field;
        if(res[componentKey]) {
          flatData[`input_${backendKey}`] = res[componentKey].input;
          flatData[`extracted_${backendKey}`] = res[componentKey].extracted;
          flatData[`status_${backendKey}`] = String(res[componentKey].status);
        }
      });
      return flatData;
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/save-results/`, { results: payloadData });
      setPipelineStatus(`✅ ${response.data.status}`);
      alert(response.data.status);
    } catch (error) {
      console.error("Failed to save results:", error.response?.data || error);
      setPipelineStatus("❌ Error saving results. Check the console.");
      alert("Error: Could not save results.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); }, []);

  const canRun = csvFile && sourceFiles.length > 0 && !isLoading;

  return (
    <div className="verification-center-wrapper">
      <div className="dashboard">
        <div className="dashboard-content">
          <header className="dashboard-header">
            <div><h1>GATE Document Verification Center</h1></div>
          </header>

          {isLoading ? (
            <LoadingState processedCount={results.length} totalCount={sourceFiles.length} statusMessage={pipelineStatus} />
          ) : (
            <section className="upload-workflow">
              <div className="upload-column">
                <h2>Step 1: Upload Master Data</h2>
                <p>Upload the simple CSV file for GATE applicants.</p>
                <FileUploadZone onFileSelect={(files) => setCsvFile(files[0])} selectedFileCount={csvFile ? 1 : 0} isMultiple={false} iconName="document-text-outline" promptText="Click or drop a .csv file" />
              </div>
              <div className="upload-column">
                <h2>Step 2: Source Documents</h2>
                <p>Upload all GATE scorecard files (e.g., 1001_GATE.pdf).</p>
                <FileUploadZone onFileSelect={(files) => setSourceFiles(Array.from(files))} selectedFileCount={sourceFiles.length} isMultiple={true} iconName="images-outline" promptText="Click or drop source files" />
              </div>
              <div className="action-area">
                <button className="run-pipeline-button" onClick={handleRunPipeline} disabled={!canRun}>
                  {isLoading ? 'Processing...' : 'Run Verification Pipeline'}
                </button>
                <p className="pipeline-status-message">{pipelineStatus}</p>
              </div>
            </section>
          )}
          
          {isJobComplete && results.length > 0 && (
            <div className="bulk-action-area">
              <p>{pipelineStatus}</p>
              <button className="save-all-button" onClick={handleBulkSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : `Save All ${results.length} Verified Records`}
              </button>
            </div>
          )}

          <section className="results-section">
            <main>
              {results.length > 0 ? (
                <DetailedTableView data={results} expandedRowId={expandedRowId} setExpandedRowId={setExpandedRowId} />
              ) : (
                !isLoading && <p style={{color: 'var(--text-muted, #6b7280)', padding: '2rem', textAlign: 'center'}}>Run a pipeline to see results here.</p>
              )}
            </main>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VerificationCenter;