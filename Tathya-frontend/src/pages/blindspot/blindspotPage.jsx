import React from 'react';
import { Eye } from 'lucide-react';
import BlindspotWidget from '../../components/BlindspotWidget/BlindspotWidget';
import './blindspotPage.css';

const BlindspotPage = () => {
    return (
        <div className="blindspot-page">
            <div className="page-container">
                <div className="widget-container">
                    <BlindspotWidget
                        limit={20}
                        showHeader={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default BlindspotPage;
