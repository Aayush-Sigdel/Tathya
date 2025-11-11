// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './layouts/navbar/navbar';
import Home from './pages/home';
import About from './pages/about';
import './index.css';
import DotGridBackground from './Background/DotGridBackground';
import Header from './layouts/header/header';
import ContentLayout from './layouts/mainContents/contentLayout';

const App = () => {
    return (
        <DotGridBackground className="container">
            <Header />
            <Navbar />
            <ContentLayout />
            <div>
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
        </DotGridBackground>
    );
};

export default App;
