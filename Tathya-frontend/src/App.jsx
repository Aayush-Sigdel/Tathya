// App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './layouts/navbar/navbar';
import Home from './pages/Home/home';
import About from './pages/About/about';
import NewsArticle from './pages/NewsArticle/NewsArticle';
import './index.css';
import DotGridBackground from '../src/components/Background/DotGridBackground';
import Header from './layouts/header/header';
import Footer from './layouts/footer/footer';
import News from './pages/NewsArticle/News';
import Contact from './pages/Contact/contact.jsx';
import NewsCatagory from './layouts/NewsCatagory/newsCatagory';
import MostRead from './layouts/extraContent/mostRead';
import ContentLayout from './layouts/mainContents/contentLayout';
import Auth from './layouts/authentication/auth';
import OTPModal from './layouts/authentication/otpModal';
import Profile from './layouts/profile/profile';
import Blindspot from './pages/blindspot/blindspot';
import AdminDashboard from './Admin/admin';
import BlindspotPage from './pages/blindspot/blindspotPage.jsx';
import BlindspotArticle from './pages/BlindspotArticle/BlindspotArticle.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('accessToken');
    return isAuthenticated ? (
        children
    ) : (
        <Navigate
            to="/auth"
            replace
        />
    );
};

const App = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    // Check authentication status on app load
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
    }, []);

    // Update authentication status when token changes
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('accessToken');
            setIsAuthenticated(!!token);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Show category filter on specific pages (only when authenticated)
    const showCategoryFilter =
        isAuthenticated && ['/news'].includes(location.pathname);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    return (
        <DotGridBackground className="container">
            {/* Only show Header and Navbar when authenticated */}
            {isAuthenticated && (
                <>
                    <Header />
                    <Navbar />
                </>
            )}

            {/* Show category filter only on relevant pages when authenticated */}
            {showCategoryFilter && (
                <NewsCatagory
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
            )}

            <div>
                <Routes>
                    {/* Public Route - Authentication */}
                    <Route
                        path="/auth"
                        element={
                            isAuthenticated ? (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            ) : (
                                <Auth setIsAuthenticated={setIsAuthenticated} />
                            )
                        }
                    />
                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={handleCategoryChange}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/news"
                        element={
                            <ProtectedRoute>
                                <News
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={handleCategoryChange}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/news/:articleId"
                        element={
                            <ProtectedRoute>
                                <NewsArticle />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            <ProtectedRoute>
                                <About
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={handleCategoryChange}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/contact"
                        element={
                            <ProtectedRoute>
                                <Contact />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/blindspot"
                        element={
                            <ProtectedRoute>
                                <BlindspotPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    // Update the BlindspotArticle route to be protected
                    <Route
                        path="/blindspot-article/:blindspotId"
                        element={
                            <ProtectedRoute>
                                <BlindspotArticle />
                            </ProtectedRoute>
                        }
                    />
                    {/* Catch all - redirect to auth if not authenticated, home if authenticated */}
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to={isAuthenticated ? '/' : '/auth'}
                                replace
                            />
                        }
                    />
                </Routes>
            </div>

            {/* Only show Footer when authenticated */}
            {isAuthenticated && <Footer />}
        </DotGridBackground>
    );
};

export default App;
