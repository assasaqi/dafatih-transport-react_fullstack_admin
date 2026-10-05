import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Admin from './pages/Admin';

function App() {
    const location = useLocation();

    return (
        <div className="app-container">
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Admin />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
