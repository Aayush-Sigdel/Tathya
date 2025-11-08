// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './layouts/navbar/navbar';
import Home from './pages/home';
import About from './pages/about';
import './index.css';

const App = () => {
    return (
        <div>
            <Navbar /> {/* Always visible */}
            <div className="container">
                <Routes>
                    <Route
                        path="/"
                        element={<Home />}
                    />
                    <Route
                        path="/about"
                        element={<About />}
                    />
                </Routes>
            </div>
        </div>
    );
};

export default App;
