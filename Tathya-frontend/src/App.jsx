// App.jsx
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './layouts/navbar/navbar';
import Home from './pages/Home/home';
import About from './pages/About/about';
import NewsArticle from './pages/NewsArticle/NewsArticle';
import './index.css';
import DotGridBackground from '../src/components/Background/DotGridBackground';
import Header from './layouts/header/header';
import Footer from './layouts/footer/footer';
import ContentLayout from './layouts/mainContents/contentLayout';
import LatestStories from './layouts/extraContent/latestStories';
import ExtraLayout from './layouts/extraContent/extraLayout';
import MostRead from './layouts/extraContent/mostRead';
import News from './pages/NewsArticle/News';
import Contact from './pages/Contact/Contact'; // Fixed import
import NewsCatagory from './layouts/NewsCatagory/newsCatagory';

const App = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const location = useLocation();

    // Show category filter only on news-related pages
    const showCategoryFilter = ['/', '/news'].includes(location.pathname);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    return (
        <DotGridBackground className="container">
            <Header />
            <Navbar />
            
            

            {/* Show category filter only on relevant pages */}
            {showCategoryFilter && (
                <NewsCatagory
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
            )}

            <div>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Home
                                selectedCategory={selectedCategory}
                                onCategoryChange={handleCategoryChange}
                            />
                        }
                    />
                    <Route
                        path="/news"
                        element={
                            <News
                                selectedCategory={selectedCategory}
                                onCategoryChange={handleCategoryChange}
                            />
                        }
                    />
                    <Route
                        path="/news/:articleId"
                        element={<NewsArticle />}
                    />
                    <Route
                        path="/about"
                        element={
                            <About
                                selectedCategory={selectedCategory}
                                onCategoryChange={handleCategoryChange}
                            />
                        }
                    />
                    <Route
                        path="/contact"
                        element={<Contact />}
                    />
                </Routes>
            </div>
            <Footer />
        </DotGridBackground>
    );
};

export default App;
