// src/data/mockData.js
export const mockData = [
  {
    id: '1010', status: 'Complete', sourceFile: '1010_GATE.pdf',
    matches: 4, totalFields: 6, // New data for fraction
    name: { input: 'Subhobrata Paul', extracted: 'Subhobrata Paul', status: true },
    registration_id: { input: 'bt22s56506204', extracted: 'BT22S6506204', status: false },
    year: { input: '2023', extracted: '1999', status: false },
    score: { input: '731', extracted: '731', status: true },
    scoreof100: { input: '58', extracted: '58', status: true },
    rank: { input: '66', extracted: '66.', status: false },
  },
  // ... Add more mock data entries here following the same structure ...
  {
    id: '1004', status: 'Complete', sourceFile: '1004_GATE.pdf',
    matches: 6, totalFields: 6,
    name: { input: 'Kunal Pradhan', extracted: 'Kunal Pradhan', status: true },
    registration_id: { input: 'cs17s56065411', extracted: 'CS17S56065411', status: true },
    year: { input: '2017', extracted: '2017', status: true },
    score: { input: '394', extracted: '394', status: true },
    scoreof100: { input: '28.9', extracted: '28.9', status: true },
    rank: { input: '8751', extracted: '8751', status: true },
  },
  {
    id: 'N/A', status: 'Failed', sourceFile: 'corrupt_document.pdf',
    matches: 0, totalFields: 6,
    name: { input: 'N/A', extracted: 'COMPRESSION_ERROR', status: false },
    registration_id: { input: 'N/A', extracted: '', status: false },
    // ... fill out rest of failed example
  },
];