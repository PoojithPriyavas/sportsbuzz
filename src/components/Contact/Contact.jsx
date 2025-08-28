import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Mock components for demonstration
const JoinTelegramButton = () => (
    <div style={{
        backgroundColor: '#0088cc',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        marginTop: '20px',
        fontWeight: '600'
    }}>
        Join Our Telegram
    </div>
);

const CustomAxios = {
    post: (url, data, config) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.2) {
                    resolve({ data: { success: true } });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1000);
        });
    }
};

// Mock global data
const useGlobalData = () => ({
    settings: [{ email: 'contact@company.com' }]
});

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
    const [isMobile, setIsMobile] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { settings } = useGlobalData();
    const contact = settings?.[0] || {};

    // Check for dark mode on mount and listen for changes
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
        };

        // Initial check
        checkDarkMode();

        // Create observer to watch for class changes on document element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkDarkMode();
                }
            });
        });

        // Start observing
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Cleanup
        return () => observer.disconnect();
    }, []);

    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 991);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

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
            const formDataToSend = new FormData();
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
            formDataToSend.append('name', fullName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('contact_number', formData.telegram);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('subject', formData.subject);
            formDataToSend.append('message', formData.message);

            const response = await axios.post('https://admin.sportsbuz.com/api/contact-forms/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

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

            setTimeout(() => setSuccess(false), 5000);

        } catch (error) {
            console.error('Form submission failed:', error);

            if (error.response && error.response.data) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    setErrors({ submit: 'Failed to send message. Please try again.' });
                }
            } else {
                setErrors({ submit: 'Network error. Please check your connection and try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Theme-aware colors
    const getThemeColors = () => {
        if (isDarkMode) {
            return {
                background: '#1a1a1a',
                cardBackground: '#2d2d2d',
                textPrimary: '#ffffff',
                textSecondary: '#b0b0b0',
                borderColor: '#404040',
                inputBackground: '#383838',
                inputBorder: '#505050',
                inputBorderFocus: '#3498db',
                inputBorderError: '#e74c3c',
                errorBackground: '#4a2c2c',
                successBackground: '#2c4a2c',
                successBorder: '#4a6b4a',
                successText: '#8fbc8f',
                contactItemBackground: '#383838',
                placeholderColor: '#888888'
            };
        } else {
            return {
                background: '#f8f9fa',
                cardBackground: '#ffffff',
                textPrimary: '#2c3e50',
                textSecondary: '#6c757d',
                borderColor: '#e9ecef',
                inputBackground: '#fff',
                inputBorder: '#e9ecef',
                inputBorderFocus: '#3498db',
                inputBorderError: '#e74c3c',
                errorBackground: '#fdf2f2',
                successBackground: '#d4edda',
                successBorder: '#c3e6cb',
                successText: '#155724',
                contactItemBackground: '#f8f9fa',
                placeholderColor: '#666666'
            };
        }
    };

    const colors = getThemeColors();

    const styles = {
        pageContainer: {
            minHeight: '100vh',
            backgroundColor: colors.background,
            padding: '20px 0',
            color: colors.textPrimary,
            transition: 'background-color 0.3s ease, color 0.3s ease'
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
            fontSize: isMobile ? '2.5rem' : '3rem',
            fontWeight: 'bold',
            color: colors.textPrimary,
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
            color: colors.textSecondary,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
        },
        mainContent: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: isMobile ? '30px' : '60px',
            alignItems: 'start'
        },
        formContainer: {
            backgroundColor: colors.cardBackground,
            padding: isMobile ? '30px 20px' : '40px',
            borderRadius: '12px',
            boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${colors.borderColor}`,
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
        },
        formTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '30px'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '0' : '20px',
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
            color: colors.textPrimary,
            fontSize: '0.95rem'
        },
        required: {
            color: '#e74c3c'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            border: `2px solid ${colors.inputBorder}`,
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backgroundColor: colors.inputBackground,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            color: colors.textPrimary
        },
        inputFocus: {
            borderColor: colors.inputBorderFocus,
            boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
        },
        inputError: {
            borderColor: colors.inputBorderError,
            backgroundColor: colors.errorBackground
        },
        textarea: {
            width: '100%',
            padding: '12px 16px',
            border: `2px solid ${colors.inputBorder}`,
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backgroundColor: colors.inputBackground,
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '120px',
            boxSizing: 'border-box',
            color: colors.textPrimary
        },
        select: {
            width: '100%',
            padding: '12px 16px',
            border: `2px solid ${colors.inputBorder}`,
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backgroundColor: colors.inputBackground,
            fontFamily: 'inherit',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23fff' : '%23666'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            paddingRight: '40px',
            boxSizing: 'border-box',
            color: colors.textPrimary
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
            color: colors.textPrimary,
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
            backgroundColor: colors.successBackground,
            color: colors.successText,
            border: `1px solid ${colors.successBorder}`,
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center',
            fontWeight: '500',
            transition: 'all 0.3s ease'
        },
        contactInfo: {
            backgroundColor: colors.cardBackground,
            padding: isMobile ? '30px 20px' : '40px 30px',
            borderRadius: '12px',
            boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${colors.borderColor}`,
            height: 'fit-content',
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? 'auto' : '20px',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
        },
        contactInfoTitle: {
            fontSize: '1.4rem',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '30px'
        },
        contactItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: colors.contactItemBackground,
            borderRadius: '8px',
            border: `1px solid ${colors.borderColor}`,
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
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
            color: colors.textPrimary,
            marginBottom: '5px'
        },
        contactText: {
            fontSize: '0.9rem',
            color: colors.textSecondary,
            lineHeight: '1.4'
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

    const ContactInfoSection = () => (
        <div style={styles.contactInfo}>
            <h3 style={styles.contactInfoTitle}>Get in touch</h3>

            <div style={styles.contactItem}>
                <div style={styles.contactIcon}>📧</div>
                <div style={styles.contactDetails}>
                    <div style={styles.contactTitle}>Email</div>
                    <div style={styles.contactText}>
                        {contact.email}<br />
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
    );

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
                                            <option key={category} value={category} style={{ color: colors.textSecondary }}>{category}</option>
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

                    <ContactInfoSection />
                </div>
            </div>

            {/* Demo controls for testing */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: colors.cardBackground,
                padding: '15px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderColor}`,
                boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                transition: 'all 0.3s ease'
            }}>
                <button
                    onClick={() => {
                        if (document.documentElement.classList.contains('dark-theme')) {
                            document.documentElement.classList.remove('dark-theme');
                        } else {
                            document.documentElement.classList.add('dark-theme');
                        }
                    }}
                    style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Toggle Dark Mode
                </button>
                <div style={{ 
                    fontSize: '12px', 
                    color: colors.textSecondary, 
                    marginTop: '8px',
                    textAlign: 'center' 
                }}>
                    Demo: {isDarkMode ? 'Dark' : 'Light'} Mode
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;