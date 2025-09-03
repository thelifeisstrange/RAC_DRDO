import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './VerificationCenter.css';

import FileUploadZone from '../components/FileUploadZone';
import LoadingState from '../components/LoadingState';
import DetailedTableView from '../components/DetailedTableView';

const API_BASE_URL = 'http://127.0.0.1:8000/api/pipeline';
const ADVERTISEMENT_API_URL = 'http://127.0.0.1:8000/api/advertisements';

const AdvertisementSelector = ({ onSelectAdvertisement }) => {
  const [ads, setAds] = useState([]);
  const [newAdName, setNewAdName] = useState('');

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(`${ADVERTISEMENT_API_URL}/`);
        setAds(response.data);
      } catch (err) {
        toast.error('Could not fetch existing advertisements.');
      }
    };
    fetchAds();
  }, []);

  const handleCreate = async () => {
    if (!newAdName.trim()) {
      toast.error('Advertisement name cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`${ADVERTISEMENT_API_URL}/`, { name: newAdName });
      toast.success(`Advertisement '${response.data.name}' created!`);
      onSelectAdvertisement(response.data);
    } catch (err) {
      toast.error('Failed to create advertisement. Name might already exist.');
    }
  };

  return (
      <div className="advertisement-selector-wrapper">
        <div className="advertisement-selector">
          <h2>Step 1: Select or Create Advertisement</h2>

          <div className="ad-list">
            <h3>Select Existing</h3>
            {ads.length > 0 ? ads.map(ad => (
                <button key={ad.id} className="ad-list-item" onClick={() => onSelectAdvertisement(ad)}>
                  {ad.name}
                </button>
            )) : <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No existing advertisements found.</p>}
          </div>

          <div className="ad-create">
            <h3>Or Create New</h3>
            <input
                type="text"
                value={newAdName}
                onChange={(e) => setNewAdName(e.target.value)}
                placeholder="e.g., Scientist B Recruitment 2025"
            />
            <button onClick={handleCreate}>Create & Continue</button>
          </div>
        </div>
      </div>
  );
};


const transformApiResult = (dataWrapper) => {
  const data = dataWrapper.data;
  const fields = ['name', 'father_name', 'reg_id', 'year', 'paper_code', 'score', 'scoreof100', 'rank'];
  const transformed = {
    id: data.id || 'N/A',
    sourceFile: data.id ? `${data.id}_GATE` : 'Unknown File',
    status: data.extracted_name === 'COMPRESSION_FAILED' ? 'Failed' : 'Complete',
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
  const [advertisement, setAdvertisement] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [sourceFolderPath, setSourceFolderPath] = useState('');
  const [totalFiles, setTotalFiles] = useState(0);
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
        const { status: jobStatus, details: jobDetails, results: apiResults = [] } = response.data;

        const transformedResults = apiResults.map(transformApiResult);
        setResults(transformedResults);

        if (jobDetails && jobDetails.includes('files to process')) {
          const countMatch = jobDetails.match(/(\d+)/);
          if (countMatch) {
            setTotalFiles(parseInt(countMatch[0], 10));
          }
        }

        const statusText = `Processing... ${transformedResults.length} / ${totalFiles} files complete.`;
        setPipelineStatus(statusText);

        if (jobStatus === 'COMPLETE' || jobStatus === 'FAILED') {
          clearInterval(pollingIntervalRef.current);
          setIsLoading(false);
          setIsJobComplete(true);
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
    formData.append('source_folder_path', sourceFolderPath);

    setIsLoading(true);
    setResults([]);
    setJobId(null);
    setTotalFiles(0);
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

  // const handleBulkSave = async () => {
  //   if (results.length === 0 || !advertisement) return;
  //   setIsSaving(true);
  //   setPipelineStatus("Saving all results to the database...");

  //   const payloadData = results.map(res => {
  //     const flatData = { applicant_id: res.id };
  //     const fieldsToFlatten = ['name', 'father_name', 'registration_id', 'year', 'paper_code', 'score', 'scoreof100', 'rank'];

  //     fieldsToFlatten.forEach(field => {
  //       if (res[field]) {
  //         const backendKey = field === 'registration_id' ? 'reg_id' : field;
  //         flatData[`input_${backendKey}`] = res[field].input;
  //         flatData[`extracted_${backendKey}`] = res[field].extracted;
  //         flatData[`${backendKey}_status`] = String(res[field].status);
  //       }
  //     });
  //     return flatData;
  //   });

  //   try {
  //     const response = await axios.post(`${ADVERTISEMENT_API_URL}/save-results/`, {
  //       results: payloadData,
  //       advertisement_id: advertisement.id
  //     });
  //     setPipelineStatus(`✅ ${response.data.status}`);
  //     toast.success(response.data.status);
  //   } catch (error) {
  //     console.error("Failed to save results:", error.response?.data || error);
  //     setPipelineStatus("❌ Error saving results. Check the console.");
  //     toast.error("Error: Could not save results.");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleResetView = () => {
    setAdvertisement(null);
    setResults([]);
    setIsLoading(false);
    setIsJobComplete(false);
    setCsvFile(null);
    setSourceFolderPath('');
  };

  const canRun = csvFile && sourceFolderPath.trim() !== '' && !isLoading;

  return (
      <div className="verification-center-wrapper">
        <div className="dashboard">
          <div className="dashboard-content">
            {!advertisement ? (
                <AdvertisementSelector onSelectAdvertisement={setAdvertisement} />
            ) : (
                <div className="verification-container">
                  <header className="dashboard-header">
                    <h2>Verification Center for: <span>{advertisement.name}</span></h2>
                    <button className="change-ad-button" onClick={handleResetView}>
                      Change Advertisement
                    </button>
                  </header>

                  {isLoading ? (
                      <LoadingState processedCount={results.length} totalCount={totalFiles} statusMessage={pipelineStatus} />
                  ) : (
                      <section className="upload-workflow">
                        <div className="upload-column">
                          <h2>Step 2: Upload Master Data</h2>
                          <p>Upload the simple CSV file for this advertisement.</p>
                          <FileUploadZone onFileSelect={(files) => setCsvFile(files[0])} selectedFileCount={csvFile ? 1 : 0} isMultiple={false} iconName="document-text-outline" promptText="Click or drop a .csv file" selectedFiles={csvFile ? [csvFile] : []} />
                        </div>
                        <div className="upload-column">
                          <h2>Step 3: Specify Source Folder</h2>
                          <p>Provide the full server-side path to the dataset folder.</p>
                          <input
                              type="text"
                              className="folder-path-input"
                              placeholder="/path/on/server/to/dataset"
                              value={sourceFolderPath}
                              onChange={(e) => setSourceFolderPath(e.target.value)}
                          />
                        </div>
                        <div className="action-area">
                          <button className="run-pipeline-button" onClick={handleRunPipeline} disabled={!canRun}>
                            {isLoading ? 'Processing...' : 'Run Verification Pipeline'}
                          </button>
                          <p className="pipeline-status-message">{!isLoading && pipelineStatus}</p>
                        </div>
                      </section>
                  )}

                  {/* {isJobComplete && results.length > 0 && (
                      <div className="bulk-action-area">
                        <p>{pipelineStatus}</p>
                        <button className="save-all-button" onClick={handleBulkSave} disabled={isSaving}>
                          {isSaving ? 'Saving...' : `Save All ${results.length} Verified Records`}
                        </button>
                      </div>
                  )} */}

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
            )}
          </div>
        </div>
      </div>
  );
};

export default VerificationCenter;