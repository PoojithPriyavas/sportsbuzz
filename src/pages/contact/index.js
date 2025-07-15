import React, { useState } from 'react';
import './contact.module.css';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        category: '',
        subject: '',
        message: '',
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim() || formData.name.trim().length < 2) newErrors.name = 'Please enter your full name (at least 2 characters)';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
        if (formData.mobile.trim() && !/^[+]?\d[\d\s\-()]{9,}$/.test(formData.mobile)) newErrors.mobile = 'Please enter a valid mobile number';
        if (!formData.category) newErrors.category = 'Please select a category';
        if (!formData.subject) newErrors.subject = 'Please select a subject';
        if (!formData.message.trim() || formData.message.trim().length < 10) newErrors.message = 'Please enter your message (minimum 10 characters)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            setSuccess(true);
            setFormData({ name: '', email: '', mobile: '', category: '', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1>Contact Us</h1>
                <p>Have a question or want to partner with us? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>
            <div className="contact-section">
                <div className="contact-form">
                    {success && (
                        <div className="success-message">✓ Thank you for your message! We'll get back to you within 24 hours.</div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="required">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} />
                                {errors.name && <div className="error-message">{errors.name}</div>}
                            </div>
                            <div className="form-group">
                                <label className="required">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} />
                                {errors.mobile && <div className="error-message">{errors.mobile}</div>}
                            </div>
                            <div className="form-group">
                                <label className="required">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">Select category</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="support">Technical Support</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="betting">Betting Inquiry</option>
                                    <option value="media">Media & Press</option>
                                    <option value="business">Business Inquiry</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.category && <div className="error-message">{errors.category}</div>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="required">Subject</label>
                            <select name="subject" value={formData.subject} onChange={handleChange}>
                                <option value="">Select subject</option>
                                <option value="account">Account Issues</option>
                                <option value="payment">Payment/Billing</option>
                                <option value="app">Mobile App</option>
                                <option value="predictions">Predictions & Tips</option>
                                <option value="live-scores">Live Scores</option>
                                <option value="partnership-proposal">Partnership Proposal</option>
                                <option value="advertisement">Advertisement</option>
                                <option value="bug-report">Bug Report</option>
                                <option value="feature-request">Feature Request</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.subject && <div className="error-message">{errors.subject}</div>}
                        </div>
                        <div className="form-group">
                            <label className="required">Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us more about your inquiry..." />
                            {errors.message && <div className="error-message">{errors.message}</div>}
                        </div>
                        <button type="submit" className="submit-btn">Send Message</button>
                    </form>
                </div>

                <div className="contact-info">
                    <h3>Get In Touch</h3>
                    <div className="info-item">
                        <div className="icon">📧</div>
                        <h4>Email Support</h4>
                        <p>info@sportsbuz.com<br />Response within 24 hours</p>
                    </div>
                    <div className="info-item">
                        <div className="icon">⚡</div>
                        <h4>Quick Response</h4>
                        <p>Our team is available to help you with any questions or concerns</p>
                    </div>
                    <div className="info-item">
                        <div className="icon">🤝</div>
                        <h4>Partnerships</h4>
                        <p>Interested in collaborating? We welcome new partnership opportunities</p>
                    </div>
                    <div className="info-item">
                        <div className="icon">🏆</div>
                        <h4>Expert Support</h4>
                        <p>Get help from our sports betting and analysis experts</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
