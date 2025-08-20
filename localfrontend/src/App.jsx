import './index.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

function App() {
  return (
      <Router>
          <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000, // Toasts last for 4 seconds
                style: {
                  background: 'var(--color-text-heading, #111827)', // Use our CSS variable for dark background
                  color: 'var(--color-bg-card, #ffffff)', // Use our CSS variable for light text
                  fontSize: '0.9rem',
                  fontWeight: '600',
                },
                // Style for specific toast types
                success: {
                  style: {
                    background: 'var(--color-green-bg, #d1fae5)',
                    color: 'var(--color-green-text, #065f46)',
                  },
                },
                error: {
                  style: {
                    background: 'var(--color-red-bg, #fee2e2)',
                    color: 'var(--color-red-text, #991b1b)',
                  },
                },
              }}
          />

          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<AdminDashboardPage />} />            
          </Routes>
      </Router>
  );
}

export default App;