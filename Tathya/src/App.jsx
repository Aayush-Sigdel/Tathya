// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './layouts/navbar/navbar';
import Home from './pages/home';
import About from './pages/about';
import NewsArticle from './pages/NewsArticle/NewsArticle';
import './index.css';
import DotGridBackground from '../src/components/Background/DotGridBackground';
import Header from './layouts/header/header';

const App = () => {
    return (
        <DotGridBackground className="container">
            <Header />
            <Navbar />
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
                    <Route
                        path="/news/:articleId"
                        element={<NewsArticle />}
                    />
                </Routes>
            </div>
        </DotGridBackground>
    );
};

export default App;
