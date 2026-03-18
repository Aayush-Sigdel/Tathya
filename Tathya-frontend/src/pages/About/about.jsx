import React from 'react';
import {
    Shield,
    Users,
    Clock,
    Target,
    Globe,
    CheckCircle,
    Eye,
    BookOpen,
} from 'lucide-react';
import './about.css';

const About = () => {
    const features = [
        {
            icon: <Shield size={24} />,
            title: 'Verified Sources',
            description:
                'We aggregate news from trusted and verified media outlets to ensure credibility and accuracy.',
        },
        {
            icon: <Users size={24} />,
            title: 'Multiple Perspectives',
            description:
                'Compare coverage across different news sources to get a complete understanding of every story.',
        },
        {
            icon: <Clock size={24} />,
            title: 'Real-time Updates',
            description:
                'Get the latest news as it breaks with our real-time aggregation system.',
        },
        {
            icon: <Target size={24} />,
            title: 'Bias Detection',
            description:
                'Our algorithms help identify potential bias in reporting, promoting balanced news consumption.',
        },
    ];

    const stats = [
        { number: '50+', label: 'News Sources' },
        { number: '10K+', label: 'Articles Daily' },
        { number: '95%', label: 'Accuracy Rate' },
        { number: '24/7', label: 'Live Coverage' },
    ];

    const values = [
        {
            icon: <CheckCircle size={20} />,
            title: 'Transparency',
            description:
                'We believe in open, transparent journalism that serves the public interest.',
        },
        {
            icon: <Eye size={20} />,
            title: 'Accuracy',
            description:
                'Every piece of information is fact-checked and verified before publication.',
        },
        {
            icon: <BookOpen size={20} />,
            title: 'Integrity',
            description:
                'We maintain the highest standards of journalistic integrity and ethics.',
        },
    ];

    return (
        <div className="about-page">
            {/* Header */}
            <div className="about-header">
                <div className="about-container">
                    <h1>About Tathya News</h1>
                    <p>
                        Empowering informed decisions through comprehensive,
                        unbiased news coverage from multiple trusted sources
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="about-container">
                    <h2>Our Mission</h2>
                    <p>
                        To combat misinformation and promote media literacy by
                        providing a platform where readers can access multiple
                        perspectives on the same story, enabling them to form
                        well-informed opinions.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="about-container">
                    <h2>Why Choose Tathya?</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card">
                                <div className="feature-icon">
                                    {feature.icon}
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="about-container">
                    <h2>Tathya by Numbers</h2>
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="stat-card">
                                <div className="stat-number">{stat.number}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="about-container">
                    <h2>Our Core Values</h2>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="value-card">
                                <div className="value-icon">{value.icon}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <div className="about-container">
                    <h2>How Tathya Works</h2>
                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>News Aggregation</h3>
                            <p>
                                We collect news from 50+ verified sources across
                                different media outlets and regions.
                            </p>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>AI Analysis</h3>
                            <p>
                                Our algorithms analyze content for credibility,
                                bias detection, and topic clustering.
                            </p>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Smart Grouping</h3>
                            <p>
                                Related articles are grouped together, allowing
                                you to see multiple perspectives on the same
                                story.
                            </p>
                        </div>
                        <div className="step">
                            <div className="step-number">4</div>
                            <h3>User Experience</h3>
                            <p>
                                Clean, intuitive interface that makes it easy to
                                discover and compare news coverage.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="about-container">
                    <h2>Our Team</h2>
                    <div className="team-card">
                        <div className="team-avatar">
                            <Users size={32} />
                        </div>
                        <div className="team-content">
                            <h3>Tathya Development Team</h3>
                            <p className="team-role">Full Stack Developers</p>
                            <p>
                                Passionate developers committed to delivering
                                accurate, unbiased news coverage for informed
                                decision-making.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="about-container">
                    <div className="cta-content">
                        <h2>Ready to Get Informed?</h2>
                        <p>
                            Join thousands of readers who trust Tathya for
                            comprehensive news coverage.
                        </p>
                        <button
                            className="cta-button"
                            onClick={() => (window.location.href = '/')}>
                            Start Reading News
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
