import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--color-text-heading, #111827)',
                        color: 'var(--color-bg-card, #ffffff)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                    },
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
                <Route path="/" element={<AdminDashboardPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;