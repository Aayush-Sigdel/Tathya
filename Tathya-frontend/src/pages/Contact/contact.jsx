import React from 'react';
import './Contact.css';

const Contact = () => {
    return (
        <div className="contact-page">
            <div className="contact-container">
                <h1>Contact Us</h1>
                <p>Get in touch with us</p>

                <div className="contact-form">
                    <form>
                        <input
                            type="text"
                            placeholder="Your Name"
                        />
                        <input
                            type="email"
                            placeholder="Your Email"
                        />
                        <textarea placeholder="Your Message"></textarea>
                        <button type="submit">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
