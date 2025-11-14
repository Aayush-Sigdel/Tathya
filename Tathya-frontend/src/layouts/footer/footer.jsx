import React from 'react';
import {Link} from 'react-router-dom';
import { Facebook, Twitter, Instagram} from 'lucide-react';
import styles from './footer.module.css';

const Footer = () => {
  const usefulLinks = [
    {name: 'Advertisement' , url: 'advertisement'},
    {name: 'Advice', url: 'advice'},
    {name: 'Contact', url: 'contact'}
  ];

  return(
    <footer className={styles["footer-container"]}>
      <div className={styles["footer-content"]}>
        {/*about us section */}
        <div className={styles["footer-section"]}>
          <h3 className={styles["section-title"]}> About us </h3>
          <p className={styles["about-text"]}>
          Tathya is a multilingual news aggregator that shows every angle of a story. 
          We compare coverage across sources, highlight bias and 
          reveal blind spots to promote informed, critical news consumption.
          </p>
          <Link 
            to="about" 
            className={styles["read-more-link"]}
          >
            Read more
          </Link>
        </div>

        {/*useful links */}
        <div className={styles["footer-section"]}>
          <h3 className={styles["section-title"]}>Useful Links</h3>
          <ul className={styles["links-list"]}>
            {usefulLinks.map((link, index) => (

              <li key={index} className={styles["link-item"]}>
                <Link 
                  to={link.url}
                  className={styles["link"]}
                  >
                    {link.name}
                  </Link>
              </li>
            ))}
          </ul>

          {/*social media*/}
          <div className={styles["social-icons-container"]}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles["social-icon"]}>
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles["social-icon"]}>
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles["social-icon"]}>
              <Instagram size={20} />
              </a>
          </div>
        </div>

        {/* Contact Address Section */}
        <div className={styles["footer-section"]}>
          <h3 className={styles["section-title"]}>Contact address</h3>
          <p className={styles["contact-text"]}>
            Tathya Pvt Ltd.<br />
            Gaidakot, Nepal
          </p>
          <div className={styles["phone-numbers"]}>
            <p className={styles["phone"]}>+977-1234567890</p>
            <p className={styles["phone"]}>+977-0987654321</p>
          </div>
          </div>
      </div>
      {/* Bottom Bar */}
      <div className={styles["footer-bottom"]}>
        <p className={styles["copyright"]}>© Copyright tathya.com</p>
        <div className={styles["footer-links"]}>
          <Link to="termsOfService" className={styles["footer-link"]}>Terms of Service</Link>
          <Link to="privacyPolicy" className={styles["footer-link"]}>Privacy Policy</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer;

