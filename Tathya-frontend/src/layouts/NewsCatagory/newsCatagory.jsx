import React from 'react';
import './newsCatagory.css';

const NewsCatagory = ({ selectedCategory, onCategoryChange }) => {
    // Define available categories
    const availableCategories = [
        'All',
        'Politics',
        'Economy',
        'Business',
        'Technology',
        'Environment',
        'National',
        'Sports',
        'Health',
        'Education',
        'International',
    ];

    const handleCategoryClick = (category) => {
        if (onCategoryChange) {
            onCategoryChange(category);
        }
    };

    // Get category color for active state
    const getCategoryColor = (category) => {
        const colors = {
            All: '#1976d2',
            Politics: '#e74c3c',
            Economy: '#34495e',
            Business: '#3498db',
            Technology: '#9b59b6',
            Environment: '#27ae60',
            National: '#f39c12',
            Sports: '#e67e22',
            Health: '#2ecc71',
            Education: '#8e44ad',
            International: '#16a085',
        };
        return colors[category] || '#1976d2';
    };

    return (
        <div className="news-category-container">
            <div className="category-filters">
                {availableCategories.map((category, index) => {
                    const isActive = selectedCategory === category;
                    const categoryColor = getCategoryColor(category);

                    return (
                        <button
                            key={category}
                            className={`category-btn ${
                                isActive ? 'active' : ''
                            }`}
                            style={
                                isActive
                                    ? {
                                          background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`,
                                          borderColor: categoryColor,
                                          boxShadow: `0 4px 15px ${categoryColor}40`,
                                      }
                                    : {}
                            }
                            onClick={() => handleCategoryClick(category)}
                            data-index={index}>
                            <span className="category-name">{category}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default NewsCatagory;
