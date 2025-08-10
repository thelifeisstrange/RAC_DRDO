// src/pages/VerificationCenter.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './VerificationCenter.css'; // Points to the new, scoped CSS file
import { useAuth } from '../context/AuthContext.jsx';

// Import all the child components this view depends on
// (Make sure these files exist in your components/dashboard/ directory)
import FileUploadZone from '../components/dashboard/FileUploadZone';
import LoadingState from '../components/dashboard/LoadingState';
import CompactView from '../components/dashboard/CompactView';
import OverviewTable from '../components/dashboard/OverviewTable';
import DetailedTableView from '../components/dashboard/DetailedTableView';

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000/api/pipeline';

// --- Reusable Tabs Component ---
const ViewTabs = ({ activeView, setActiveView }) => {
  const views = ['Detailed Table', 'Overview', 'Compact'];
  return (
      <div className="view-tabs">
        {views.map(view => (
            <button
                key={view}
                className={`tab-button ${activeView === view.toLowerCase().replace(' ', '-') ? 'active' : ''}`}
                onClick={() => setActiveView(view.toLowerCase().replace(' ', '-'))}
            >
              {view}
            </button>
        ))}
      </div>
  );
};

// --- Data Transformer Function ---
const transformApiResult = (data) => {
  const fields = ['name', 'reg_id', 'year', 'score', 'scoreof100', 'rank'];
  const transformed = {
    id: data.id || 'N/A',
    sourceFile: data.id ? `${data.id}_GATE` : 'Unknown File',
  };

  if (data.extracted_name?.includes('ERROR:') || data.extracted_name === 'COMPRESSION_FAILED') {
    transformed.status = 'Failed';
  } else {
    transformed.status = 'Complete';
  }

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

// --- Main Component ---
const VerificationCenter = () => {
  const { authTokens } = useAuth();
  const [csvFile, setCsvFile] = useState(null);
  const [sourceFiles, setSourceFiles] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState('Awaiting files...');
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [results, setResults] = useState([]);
  const [activeView, setActiveView] = useState('detailed-table');
  const [expandedRowId, setExpandedRowId] = useState(null);

  const pollingIntervalRef = useRef(null);

  const pollJobStatus = (id) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(async () => {

      if (!authTokens) {
        setPipelineStatus('❌ Authentication error during status check.');
        clearInterval(pollingIntervalRef.current);
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${authTokens.access}`
        }
      };

      try {
        const response = await axios.get(`${API_BASE_URL}/status/${id}/`, config);
        const { job, results: apiResults } = response.data;
        const transformedResults = apiResults.map(transformApiResult);
        setResults(transformedResults);
        setPipelineStatus(`Processing... ${transformedResults.length} / ${sourceFiles.length} files complete.`);
        if (job.status === 'COMPLETE' || job.status === 'FAILED') {
          clearInterval(pollingIntervalRef.current);
          setIsLoading(false);
          setPipelineStatus(job.status === 'COMPLETE' ? `✅ Process complete! Processed ${transformedResults.length} files.` : `❌ Process failed.`);
        }
      } catch (error) {
        setPipelineStatus('❌ Error fetching results.');
        clearInterval(pollingIntervalRef.current);
        setIsLoading(false);
      }
    }, 3000);
  };

  const handleRunPipeline = async () => {

    // <<< 1. Check for tokens first. Good practice.
    if (!authTokens) {
      setPipelineStatus('❌ Authentication error. Please log in again.');
      return;
    }

    const formData = new FormData();
    formData.append('master_csv', csvFile);
    sourceFiles.forEach(file => formData.append('source_files', file));
    setIsLoading(true);
    setResults([]);
    setJobId(null);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    setPipelineStatus('Uploading files and starting job...');

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authTokens.access}`
      }
    };
    
    try {
      const response = await axios.post(`${API_BASE_URL}/start/`, formData, config);
      const newJobId = response.data.id;
      setJobId(newJobId);
      setPipelineStatus('Job started! Fetching results...');
      pollJobStatus(newJobId);
    } catch (error) {
      setPipelineStatus(`❌ Error starting pipeline: ${error.response?.data?.error || 'Check console'}`);
      setIsLoading(false);
    }
  };

  useEffect(() => () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); }, []);

  const canRun = csvFile && sourceFiles.length > 0 && !isLoading;
  const handleViewChange = (view) => { setExpandedRowId(null); setActiveView(view); };

  const renderResultsView = () => {
    if (results.length === 0) {
      if (isLoading) return null;
      return <p style={{color: 'var(--text-muted)', padding: '2rem'}}>Run a pipeline to see results here.</p>;
    }
    switch (activeView) {
      case 'compact': return <CompactView data={results} />;
      case 'overview': return <OverviewTable data={results} />;
      case 'detailed-table':
      default:
        return <DetailedTableView data={results} expandedRowId={expandedRowId} setExpandedRowId={setExpandedRowId} />;
    }
  };

  return (
      <div className="verification-center-wrapper">
        <div className="dashboard">
          <div className="dashboard-content">
            <header className="dashboard-header">
              <div><h1>Verification Command Center</h1></div>
            </header>

            {isLoading ? (
                <LoadingState processedCount={results.length} totalCount={sourceFiles.length} statusMessage={pipelineStatus} />
            ) : (
                <section className="upload-workflow">
                  <div className="upload-column">
                    <h2>Step 1: Upload Data</h2>
                    <p>Upload the CSV file containing the applicant data.</p>
                    <FileUploadZone onFileSelect={(files) => setCsvFile(files[0])} selectedFileCount={csvFile ? 1 : 0} isMultiple={false} iconName="document-text-outline" promptText="Click or drop a .csv file" />
                  </div>
                  <div className="upload-column">
                    <h2>Step 2: Source Documents</h2>
                    <p>Upload the PDF and image files that need to be verified.</p>
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

            <section className="results-section">
              <nav><ViewTabs activeView={activeView} setActiveView={handleViewChange} /></nav>
              <main>{renderResultsView()}</main>
            </section>
          </div>
        </div>
      </div>
  );
};

export default VerificationCenter;