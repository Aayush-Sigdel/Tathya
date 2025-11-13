import React from 'react';
import dummyData from '../../components/NewsComponents/dummydata.json';
import './newsCatagory.css';

const NewsCatagory = ({ selectedCategory, onCategoryChange }) => {
    const categories = ['All', ...dummyData.metadata.categories];

    return (
        <div className="news-category-container">
            <div className="category-filters">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`category-btn ${
                            selectedCategory === category ? 'active' : ''
                        }`}
                        onClick={() => onCategoryChange(category)}>
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NewsCatagory;
