import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            });

            // Reset success message after 3 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 3000);
        }, 1000);
    };

    return (
        <div className="contact-page">
            {/* Header */}
            <div className="contact-header">
                <div className="contact-container">
                    <h1>Contact Us</h1>
                    <p>
                        Get in touch with our team for any questions or support
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="contact-content">
                <div className="contact-container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="form-section">
                            <h2>Send us a message</h2>

                            {submitStatus === 'success' && (
                                <div className="success-message">
                                    <CheckCircle size={18} />
                                    <span>Message sent successfully!</span>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="contact-form">
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Your Email"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="Subject (Optional)"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Your Message"
                                        rows="6"
                                        required></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <div className="loading-dot"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="info-section">
                            <h2>Contact Information</h2>
                            <p>
                                Reach out to us directly through any of these
                                channels
                            </p>

                            <div className="contact-info-list">
                                <div className="contact-info-item">
                                    <Mail size={20} />
                                    <div>
                                        <strong>Email</strong>
                                        <p>contact@tathyanews.com</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <Phone size={20} />
                                    <div>
                                        <strong>Phone</strong>
                                        <p>+977-1-4567890</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <MapPin size={20} />
                                    <div>
                                        <strong>Address</strong>
                                        <p>Kathmandu, Nepal</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <Clock size={20} />
                                    <div>
                                        <strong>Office Hours</strong>
                                        <p>Mon-Fri: 9:00 AM - 6:00 PM NPT</p>
                                    </div>
                                </div>
                            </div>

                            <div className="response-info">
                                <h3>Response Time</h3>
                                <p>
                                    We typically respond to all inquiries within
                                    24 hours during business days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
