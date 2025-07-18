import React, { useState } from 'react';
import JoinTelegramButton from '@/components/JoinTelegram/JoinTelegramButton';
import CustomAxios from '../utilities/CustomAxios';

const ContactUsPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        telegram: '',
        company: '',
        jobTitle: '',
        category: '',
        subject: '',
        message: '',
        howDidYouHear: '',
        newsletter: false
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy',
        'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Netherlands', 'Sweden',
        'Norway', 'Denmark', 'Belgium', 'Switzerland', 'Austria', 'Portugal', 'Ireland',
        'South Korea', 'Singapore', 'New Zealand', 'South Africa', 'Argentina', 'Chile',
        'Israel', 'UAE', 'Saudi Arabia', 'Other'
    ];

    const subjects = [
        'General Inquiry',
        'Technical Support',
        'Sales & Pricing',
        'Partnership Opportunities',
        'Media & Press',
        'Bug Report',
        'Feature Request',
        'Account Issues',
        'Billing Questions',
        'Other'
    ];

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.telegram.trim()) {
            newErrors.telegram = 'Telegram ID is required';
        }

        if (!formData.subject) newErrors.subject = 'Please select a subject';
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            // Create FormData object for multipart/form-data
            const formDataToSend = new FormData();
            
            // Combine first name and last name into a single name field
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
            formDataToSend.append('name', fullName);
            
            formDataToSend.append('email', formData.email);
            formDataToSend.append('contact_number', formData.telegram);
            // formDataToSend.append('company', formData.company);
            // formDataToSend.append('job_title', formData.jobTitle);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('subject', formData.subject);
            formDataToSend.append('message', formData.message);
            // formDataToSend.append('how_did_you_hear', formData.howDidYouHear);
            // formDataToSend.append('newsletter', formData.newsletter);

            const response = await CustomAxios.post('/contact-forms/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // If we get here, the request was successful
            setSuccess(true);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                telegram: '',
                company: '',
                jobTitle: '',
                category: '',
                subject: '',
                message: '',
                howDidYouHear: '',
                newsletter: false
            });

            // Hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);

        } catch (error) {
            console.error('Form submission failed:', error);

            if (error.response && error.response.data) {
                // Handle specific field errors if returned by API
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    // Show generic error
                    setErrors({ submit: 'Failed to send message. Please try again.' });
                }
            } else {
                // Network error or other issues
                setErrors({ submit: 'Network error. Please check your connection and try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const styles = {
        pageContainer: {
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            padding: '20px 0'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '50px',
            padding: '40px 0'
        },
        title: {
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '16px',
            position: 'relative'
        },
        titleUnderline: {
            width: '100px',
            height: '4px',
            backgroundColor: '#3498db',
            margin: '0 auto',
            borderRadius: '2px',
            marginBottom: '20px'
        },
        subtitle: {
            fontSize: '1.2rem',
            color: '#6c757d',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
        },
        mainContent: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '60px',
            alignItems: 'start'
        },
        formContainer: {
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
        },
        formTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '30px'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
        },
        formGroup: {
            marginBottom: '24px'
        },
        formGroupFull: {
            gridColumn: '1 / -1',
            marginBottom: '24px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#2c3e50',
            fontSize: '0.95rem'
        },
        required: {
            color: '#e74c3c'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backgroundColor: '#fff',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            color: 'black'
        },
        inputFocus: {
            borderColor: '#3498db',
            boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
        },
        inputError: {
            borderColor: '#e74c3c',
            backgroundColor: '#fdf2f2'
        },
        textarea: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backgroundColor: '#fff',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '120px',
            boxSizing: 'border-box',
            color: 'black'
        },
        select: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backgroundColor: '#fff',
            fontFamily: 'inherit',
            appearance: 'none',
            backgroundImage: "url(\"data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            paddingRight: '40px',
            boxSizing: 'border-box',
            color: 'black'
        },
        checkboxContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px'
        },
        checkbox: {
            width: '18px',
            height: '18px',
            accentColor: '#3498db'
        },
        checkboxLabel: {
            fontSize: '0.95rem',
            color: '#2c3e50',
            cursor: 'pointer'
        },
        errorMessage: {
            color: '#e74c3c',
            fontSize: '0.875rem',
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        submitButton: {
            backgroundColor: '#3498db',
            color: 'white',
            padding: '14px 32px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            marginTop: '10px'
        },
        submitButtonHover: {
            backgroundColor: '#2980b9',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(52, 152, 219, 0.3)'
        },
        submitButtonDisabled: {
            backgroundColor: '#bdc3c7',
            cursor: 'not-allowed',
            transform: 'none'
        },
        successMessage: {
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center',
            fontWeight: '500'
        },
        contactInfo: {
            backgroundColor: 'white',
            padding: '40px 30px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef',
            height: 'fit-content',
            position: 'sticky',
            top: '20px'
        },
        contactInfoTitle: {
            fontSize: '1.4rem',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '30px'
        },
        contactItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
        },
        contactIcon: {
            fontSize: '1.5rem',
            minWidth: '30px'
        },
        contactDetails: {
            flex: 1
        },
        contactTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '5px'
        },
        contactText: {
            fontSize: '0.9rem',
            color: '#6c757d',
            lineHeight: '1.4'
        },
        mobileStyles: {
            '@media (max-width: 768px)': {
                mainContent: {
                    gridTemplateColumns: '1fr',
                    gap: '30px'
                },
                formGrid: {
                    gridTemplateColumns: '1fr',
                    gap: '0'
                },
                formContainer: {
                    padding: '30px 20px'
                },
                contactInfo: {
                    position: 'relative',
                    top: 'auto'
                },
                title: {
                    fontSize: '2.5rem'
                }
            }
        }
    };

    const [focusedField, setFocusedField] = useState('');
    const [hoveredButton, setHoveredButton] = useState(false);

    const getInputStyle = (fieldName) => {
        let style = { ...styles.input };
        if (errors[fieldName]) style = { ...style, ...styles.inputError };
        if (focusedField === fieldName) style = { ...style, ...styles.inputFocus };
        return style;
    };

    const getSelectStyle = (fieldName) => {
        let style = { ...styles.select };
        if (errors[fieldName]) style = { ...style, ...styles.inputError };
        if (focusedField === fieldName) style = { ...style, ...styles.inputFocus };
        return style;
    };

    const getTextareaStyle = () => {
        let style = { ...styles.textarea };
        if (errors.message) style = { ...style, ...styles.inputError };
        if (focusedField === 'message') style = { ...style, ...styles.inputFocus };
        return style;
    };

    const getButtonStyle = () => {
        let style = { ...styles.submitButton };
        if (isSubmitting) style = { ...style, ...styles.submitButtonDisabled };
        else if (hoveredButton) style = { ...style, ...styles.submitButtonHover };
        return style;
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <div style={styles.hero}> </div>

                <div style={styles.mainContent}>
                    <div style={styles.formContainer}>
                        <h2 style={styles.formTitle}>Send us a message</h2>

                        {success && (
                            <div style={styles.successMessage}>
                                ✓ Thank you for your message! We'll get back to you within 24 hours.
                            </div>
                        )}

                        {errors.submit && (
                            <div style={styles.errorMessage}>
                                ⚠️ {errors.submit}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        First Name <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('firstName')}
                                        onBlur={() => setFocusedField('')}
                                        style={getInputStyle('firstName')}
                                        placeholder="Enter your first name"
                                    />
                                    {errors.firstName && (
                                        <div style={styles.errorMessage}>
                                            ⚠️ {errors.firstName}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Last Name <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('lastName')}
                                        onBlur={() => setFocusedField('')}
                                        style={getInputStyle('lastName')}
                                        placeholder="Enter your last name"
                                    />
                                    {errors.lastName && (
                                        <div style={styles.errorMessage}>
                                            ⚠️ {errors.lastName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Email Address <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField('')}
                                        style={getInputStyle('email')}
                                        placeholder="Enter your email address"
                                    />
                                    {errors.email && (
                                        <div style={styles.errorMessage}>
                                            ⚠️ {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Telegram ID <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="telegram"
                                        value={formData.telegram}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('telegram')}
                                        onBlur={() => setFocusedField('')}
                                        style={getInputStyle('telegram')}
                                        placeholder="Enter your Telegram ID (e.g., @username)"
                                    />
                                    {errors.telegram && (
                                        <div style={styles.errorMessage}>
                                            ⚠️ {errors.telegram}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('category')}
                                        onBlur={() => setFocusedField('')}
                                        style={getSelectStyle('category')}
                                    >
                                        <option value="">Select your category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category} style={{ color: '#6c757d' }}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Subject <span style={styles.required}>*</span>
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('subject')}
                                        onBlur={() => setFocusedField('')}
                                        style={getSelectStyle('subject')}
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects.map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                    {errors.subject && (
                                        <div style={styles.errorMessage}>
                                            ⚠️ {errors.subject}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={styles.formGroupFull}>
                                <label style={styles.label}>
                                    Message <span style={styles.required}>*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('message')}
                                    onBlur={() => setFocusedField('')}
                                    style={getTextareaStyle()}
                                    placeholder="Tell us more about your inquiry..."
                                    rows={5}
                                />
                                {errors.message && (
                                    <div style={styles.errorMessage}>
                                        ⚠️ {errors.message}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={getButtonStyle()}
                                onMouseEnter={() => setHoveredButton(true)}
                                onMouseLeave={() => setHoveredButton(false)}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    <div style={styles.contactInfo}>
                        <h3 style={styles.contactInfoTitle}>Get in touch</h3>

                        <div style={styles.contactItem}>
                            <div style={styles.contactIcon}>📧</div>
                            <div style={styles.contactDetails}>
                                <div style={styles.contactTitle}>Email</div>
                                <div style={styles.contactText}>
                                    contact@company.com<br />
                                    Response within 24 hours
                                </div>
                            </div>
                        </div>

                        <div style={styles.contactItem}>
                            <div style={styles.contactIcon}>🕐</div>
                            <div style={styles.contactDetails}>
                                <div style={styles.contactTitle}>Business Hours</div>
                                <div style={styles.contactText}>
                                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                                    Saturday: 10:00 AM - 4:00 PM<br />
                                    Sunday: Closed
                                </div>
                            </div>
                        </div>
                        <JoinTelegramButton />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;