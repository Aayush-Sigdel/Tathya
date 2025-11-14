import React from 'react';
import dummyData from '../../components/NewsComponents/dummydata.json';

const NewsCatagory = ({ selectedCategory, onCategoryChange }) => {
    const categories = ['All', ...dummyData.metadata.categories];
    const newsGroups = dummyData.newsGroups || [];

    const handleCategoryClick = (category) => {
        if (onCategoryChange) {
            onCategoryChange(category);
        }
    };

    // Count news groups that have articles in the given category
    const getGroupCountForCategory = (category) => {
        if (category === 'All') {
            return newsGroups.length;
        }
        return newsGroups.filter((group) =>
            group.news.some((article) => article.category === category)
        ).length;
    };

    return (
        <div className="news-category-container">
            <div className="category-filters">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`category-btn ${
                            selectedCategory === category ? 'active' : ''
                        }`}
                        onClick={() => handleCategoryClick(category)}>
                        {category}
                        <span className="category-count">
                            {getGroupCountForCategory(category)}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NewsCatagory;
