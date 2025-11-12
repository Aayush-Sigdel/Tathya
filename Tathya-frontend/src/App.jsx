// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './layouts/navbar/navbar';
import Home from './pages/home';
import About from './pages/about';
import './index.css';
import DotGridBackground from './Background/DotGridBackground';
import Header from './layouts/header/header';
import Footer from './layouts/footer/footer';
import ContentLayout from './layouts/mainContents/contentLayout';
import LatestStories from './layouts/extraContent/latestStories';
import ExtraLayout from './layouts/extraContent/extraLayout';
import MostRead from './layouts/extraContent/mostRead';

const App = () => {
    return (
        <DotGridBackground className="container">
            <Header />
            <Navbar />
            <ContentLayout />
            <MostRead />
            <ExtraLayout />

            <Footer />
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
