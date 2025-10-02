import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useGlobalData } from '../Context/ApiContext';

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
    const { settings, language, translateText } = useGlobalData();
    const contact = settings?.[0] || {};
    
    // Add translation state
    const [translatedText, setTranslatedText] = useState({
        contactUs: 'Contact Us',
        getInTouch: 'Get in touch',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        telegram: 'Telegram ID',
        company: 'Company (Optional)',
        jobTitle: 'Job Title (Optional)',
        country: 'Country',
        subject: 'Subject',
        message: 'Message',
        howDidYouHear: 'How did you hear about us? (Optional)',
        newsletter: 'Subscribe to our newsletter',
        submit: 'Submit',
        submitting: 'Submitting...',
        successMessage: 'Thank you! Your message has been sent successfully.',
        firstNameRequired: 'First name is required',
        lastNameRequired: 'Last name is required',
        emailRequired: 'Email is required',
        emailInvalid: 'Please enter a valid email address',
        telegramRequired: 'Telegram ID is required',
        subjectRequired: 'Please select a subject',
        messageRequired: 'Message is required',
        messageLength: 'Message must be at least 10 characters',
        contactInfo: 'Contact Info',
        emailLabel: 'Email',
        responseTime: 'Response within 24 hours',
        telegramLabel: 'Telegram',
        telegramSupport: '24/7 Support',
        officeHours: 'Office Hours',
        workingHours: 'Monday - Friday, 9am - 6pm',
        address: 'Address',
        addressDetails: 'Colombo, Sri Lanka',
        followUs: 'Follow Us',
        contactDescription: 'Have questions or need assistance? Fill out the form below and our team will get back to you as soon as possible.'
    });
    
    useEffect(() => {
        const translateLabels = async () => {
            try {
                // Translate each text individually
                const translations = {
                    contactUs: await translateText('Contact Us', 'en', language),
                    getInTouch: await translateText('Get in touch', 'en', language),
                    firstName: await translateText('First Name', 'en', language),
                    lastName: await translateText('Last Name', 'en', language),
                    email: await translateText('Email', 'en', language),
                    telegram: await translateText('Telegram ID', 'en', language),
                    company: await translateText('Company (Optional)', 'en', language),
                    jobTitle: await translateText('Job Title (Optional)', 'en', language),
                    country: await translateText('Country', 'en', language),
                    subject: await translateText('Subject', 'en', language),
                    message: await translateText('Message', 'en', language),
                    howDidYouHear: await translateText('How did you hear about us? (Optional)', 'en', language),
                    newsletter: await translateText('Subscribe to our newsletter', 'en', language),
                    submit: await translateText('Submit', 'en', language),
                    submitting: await translateText('Submitting...', 'en', language),
                    successMessage: await translateText('Thank you! Your message has been sent successfully.', 'en', language),
                    firstNameRequired: await translateText('First name is required', 'en', language),
                    lastNameRequired: await translateText('Last name is required', 'en', language),
                    emailRequired: await translateText('Email is required', 'en', language),
                    emailInvalid: await translateText('Please enter a valid email address', 'en', language),
                    telegramRequired: await translateText('Telegram ID is required', 'en', language),
                    subjectRequired: await translateText('Please select a subject', 'en', language),
                    messageRequired: await translateText('Message is required', 'en', language),
                    messageLength: await translateText('Message must be at least 10 characters', 'en', language),
                    contactInfo: await translateText('Contact Info', 'en', language),
                    emailLabel: await translateText('Email', 'en', language),
                    responseTime: await translateText('Response within 24 hours', 'en', language),
                    telegramLabel: await translateText('Telegram', 'en', language),
                    telegramSupport: await translateText('24/7 Support', 'en', language),
                    officeHours: await translateText('Office Hours', 'en', language),
                    workingHours: await translateText('Monday - Friday, 9am - 6pm', 'en', language),
                    address: await translateText('Address', 'en', language),
                    addressDetails: await translateText('Colombo, Sri Lanka', 'en', language),
                    followUs: await translateText('Follow Us', 'en', language),
                    contactDescription: await translateText('Have questions or need assistance? Fill out the form below and our team will get back to you as soon as possible.', 'en', language)
                };

                // Update translations in state
                setTranslatedText(prev => ({
                    ...prev,
                    ...translations
                }));

                // Cache translations
                localStorage.setItem('contactPageTranslations', JSON.stringify({
                    language,
                    translations
                }));

            } catch (error) {
                console.error('Error translating contact page labels:', error);
            }
        };

        // Check for cached translations first
        const cachedTranslations = localStorage.getItem('contactPageTranslations');
        if (cachedTranslations) {
            try {
                const parsed = JSON.parse(cachedTranslations);
                if (parsed.language === language) {
                    setTranslatedText(prev => ({
                        ...prev,
                        ...parsed.translations
                    }));
                } else {
                    // Language changed, update translations
                    translateLabels();
                }
            } catch (error) {
                console.error('Error parsing cached translations:', error);
                translateLabels();
            }
        } else {
            translateLabels();
        }
    }, [language, translateText]);

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

        if (!formData.firstName.trim()) newErrors.firstName = translatedText.firstNameRequired;
        if (!formData.lastName.trim()) newErrors.lastName = translatedText.lastNameRequired;

        if (!formData.email.trim()) {
            newErrors.email = translatedText.emailRequired;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = translatedText.emailInvalid;
        }

        if (!formData.telegram.trim()) {
            newErrors.telegram = translatedText.telegramRequired;
        }

        if (!formData.subject) newErrors.subject = translatedText.subjectRequired;
        if (!formData.message.trim()) {
            newErrors.message = translatedText.messageRequired;
        } else if (formData.message.trim().length < 10) {
            newErrors.message = translatedText.messageLength;
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
            console.error('Error submitting form:', error);
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
                borderColor: '#444444',
                inputBackground: '#3a3a3a',
                inputBorder: '#555555',
                inputFocus: '#4a90e2',
                buttonBackground: '#3182ce',
                buttonHover: '#2b6cb0',
                successBackground: '#2d3748',
                successText: '#68d391',
                successBorder: '#38a169',
                errorColor: '#fc8181',
                contactItemBackground: '#2d2d2d'
            };
        } else {
            return {
                background: '#f8f9fa',
                cardBackground: '#ffffff',
                textPrimary: '#333333',
                textSecondary: '#666666',
                borderColor: '#e2e8f0',
                inputBackground: '#ffffff',
                inputBorder: '#cbd5e0',
                inputFocus: '#3182ce',
                buttonBackground: '#3182ce',
                buttonHover: '#2b6cb0',
                successBackground: '#f0fff4',
                successText: '#38a169',
                successBorder: '#c6f6d5',
                errorColor: '#e53e3e',
                contactItemBackground: '#f7fafc'
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
            fontWeight: '700',
            marginBottom: '20px',
            color: colors.textPrimary,
            transition: 'color 0.3s ease'
        },
        description: {
            fontSize: '1.1rem',
            maxWidth: '800px',
            margin: '0 auto',
            color: colors.textSecondary,
            transition: 'color 0.3s ease'
        },
        formContainer: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '30px',
            marginBottom: '50px'
        },
        formColumn: {
            flex: isMobile ? '1' : '2',
            backgroundColor: colors.cardBackground,
            padding: isMobile ? '30px 20px' : '40px',
            borderRadius: '12px',
            boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${colors.borderColor}`,
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
        },
        contactColumn: {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: colors.textPrimary,
            transition: 'color 0.3s ease'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.inputBorder}`,
            backgroundColor: colors.inputBackground,
            color: colors.textPrimary,
            transition: 'border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease',
            outline: 'none'
        },
        inputFocus: {
            borderColor: colors.inputFocus,
            boxShadow: `0 0 0 1px ${colors.inputFocus}`
        },
        select: {
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.inputBorder}`,
            backgroundColor: colors.inputBackground,
            color: colors.textPrimary,
            transition: 'border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23${isDarkMode ? 'ffffff' : '333333'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 16px center',
            backgroundSize: '16px'
        },
        textarea: {
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.inputBorder}`,
            backgroundColor: colors.inputBackground,
            color: colors.textPrimary,
            transition: 'border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease',
            outline: 'none',
            minHeight: '150px',
            resize: 'vertical'
        },
        error: {
            color: colors.errorColor,
            fontSize: '0.875rem',
            marginTop: '5px'
        },
        checkboxContainer: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
        },
        checkbox: {
            marginRight: '10px',
            width: '18px',
            height: '18px',
            accentColor: colors.buttonBackground
        },
        checkboxLabel: {
            fontSize: '0.95rem',
            color: colors.textSecondary,
            transition: 'color 0.3s ease'
        },
        submitButton: {
            backgroundColor: colors.buttonBackground,
            color: 'white',
            border: 'none',
            padding: '14px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            marginTop: '10px'
        },
        submitButtonHover: {
            backgroundColor: colors.buttonHover,
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
            transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
        },
        contactInfo: {
            backgroundColor: colors.cardBackground,
            padding: '30px',
            borderRadius: '12px',
            boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${colors.borderColor}`,
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
        },
        contactInfoTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '20px',
            color: colors.textPrimary,
            transition: 'color 0.3s ease'
        },
        contactItem: {
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '20px',
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
            color: colors.textSecondary,
            fontSize: '0.95rem',
            lineHeight: '1.5'
        },
        socialLinks: {
            display: 'flex',
            gap: '15px',
            marginTop: '10px'
        },
        socialIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: colors.buttonBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem',
            transition: 'transform 0.3s ease, background-color 0.3s ease',
            cursor: 'pointer'
        },
        socialIconHover: {
            transform: 'translateY(-3px)',
            backgroundColor: colors.buttonHover
        },
        row: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px'
        },
        column: {
            flex: 1
        }
    };

    const ContactInfoSection = () => (
        <div style={styles.contactInfo}>
            <h3 style={styles.contactInfoTitle}>{translatedText.getInTouch}</h3>

            <div style={styles.contactItem}>
                <div style={styles.contactIcon}>📧</div>
                <div style={styles.contactDetails}>
                    <div style={styles.contactTitle}>{translatedText.emailLabel}</div>
                    <div style={styles.contactText}>
                        {contact.email}<br />
                        {translatedText.responseTime}
                    </div>
                </div>
            </div>

            <div style={styles.contactItem}>
                <div style={styles.contactIcon}>💬</div>
                <div style={styles.contactDetails}>
                    <div style={styles.contactTitle}>{translatedText.telegramLabel}</div>
                    <div style={styles.contactText}>
                        {contact.telegram_link ? contact.telegram_link.replace('https://t.me/', '@') : '@sportsbuz'}<br />
                        {translatedText.telegramSupport}
                    </div>
                    <JoinTelegramButton />
                </div>
            </div>

            <div style={styles.contactItem}>
                <div style={styles.contactIcon}>🕒</div>
                <div style={styles.contactDetails}>
                    <div style={styles.contactTitle}>{translatedText.officeHours}</div>
                    <div style={styles.contactText}>
                        {translatedText.workingHours}
                    </div>
                </div>
            </div>

            <div style={styles.contactItem}>
                <div style={styles.contactIcon}>📍</div>
                <div style={styles.contactDetails}>
                    <div style={styles.contactTitle}>{translatedText.address}</div>
                    <div style={styles.contactText}>
                        {translatedText.addressDetails}
                    </div>
                </div>
            </div>

            <div style={styles.contactItem}>
                <div style={styles.contactDetails}>
                    <div style={styles.contactTitle}>{translatedText.followUs}</div>
                    <div style={styles.socialLinks}>
                        {contact.facebook_link && (
                            <a href={contact.facebook_link} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>f</a>
                        )}
                        {contact.twitter_link && (
                            <a href={contact.twitter_link} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>t</a>
                        )}
                        {contact.instagram_link && (
                            <a href={contact.instagram_link} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>i</a>
                        )}
                        {contact.youtube_link && (
                            <a href={contact.youtube_link} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>y</a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>{translatedText.contactUs}</h1>
                    <p style={styles.description}>{translatedText.contactDescription}</p>
                </div>

                <div style={styles.formContainer}>
                    <div style={styles.formColumn}>
                        {success && (
                            <div style={styles.successMessage}>
                                {translatedText.successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={styles.row}>
                                <div style={styles.column}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label} htmlFor="firstName">{translatedText.firstName}</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            style={styles.input}
                                            placeholder="John"
                                        />
                                        {errors.firstName && <div style={styles.error}>{errors.firstName}</div>}
                                    </div>
                                </div>
                                <div style={styles.column}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label} htmlFor="lastName">{translatedText.lastName}</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            style={styles.input}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <div style={styles.error}>{errors.lastName}</div>}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="email">{translatedText.email}</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="john.doe@example.com"
                                />
                                {errors.email && <div style={styles.error}>{errors.email}</div>}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="telegram">{translatedText.telegram}</label>
                                <input
                                    type="text"
                                    id="telegram"
                                    name="telegram"
                                    value={formData.telegram}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="@username"
                                />
                                {errors.telegram && <div style={styles.error}>{errors.telegram}</div>}
                            </div>

                            <div style={styles.row}>
                                <div style={styles.column}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label} htmlFor="company">{translatedText.company}</label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            style={styles.input}
                                            placeholder="Company Name"
                                        />
                                    </div>
                                </div>
                                <div style={styles.column}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label} htmlFor="jobTitle">{translatedText.jobTitle}</label>
                                        <input
                                            type="text"
                                            id="jobTitle"
                                            name="jobTitle"
                                            value={formData.jobTitle}
                                            onChange={handleChange}
                                            style={styles.input}
                                            placeholder="Your Position"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="category">{translatedText.country}</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">-- Select Country --</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                                {errors.category && <div style={styles.error}>{errors.category}</div>}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="subject">{translatedText.subject}</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">-- Select Subject --</option>
                                    {subjects.map((subject, index) => (
                                        <option key={index} value={subject}>{subject}</option>
                                    ))}
                                </select>
                                {errors.subject && <div style={styles.error}>{errors.subject}</div>}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="message">{translatedText.message}</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    style={styles.textarea}
                                    placeholder="How can we help you?"
                                ></textarea>
                                {errors.message && <div style={styles.error}>{errors.message}</div>}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="howDidYouHear">{translatedText.howDidYouHear}</label>
                                <input
                                    type="text"
                                    id="howDidYouHear"
                                    name="howDidYouHear"
                                    value={formData.howDidYouHear}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Google, Social Media, Friend, etc."
                                />
                            </div>

                            <div style={styles.checkboxContainer}>
                                <input
                                    type="checkbox"
                                    id="newsletter"
                                    name="newsletter"
                                    checked={formData.newsletter}
                                    onChange={handleChange}
                                    style={styles.checkbox}
                                />
                                <label htmlFor="newsletter" style={styles.checkboxLabel}>{translatedText.newsletter}</label>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    ...styles.submitButton,
                                    ...(isSubmitting ? styles.submitButtonDisabled : {})
                                }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? translatedText.submitting : translatedText.submit}
                            </button>
                        </form>
                    </div>

                    <div style={styles.contactColumn}>
                        <ContactInfoSection />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;