import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useGlobalData } from '../Context/ApiContext';
import contactTranslations from './contactTranslations.json';

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
    const [isTranslating, setIsTranslating] = useState(false);
    
    const { settings, language, debugTranslateText } = useGlobalData();
    const contact = settings?.[0] || {};
    const previousLanguage = useRef(null);

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
        contactDescription: 'Have questions or need assistance? Fill out the form below and our team will get back to you as soon as possible.',
        selectCountry: '-- Select Country --',
        selectSubject: '-- Select Subject --',
        subjects: {
            generalInquiry: 'General Inquiry',
            technicalSupport: 'Technical Support',
            salesPricing: 'Sales & Pricing',
            partnershipOpportunities: 'Partnership Opportunities',
            mediaPress: 'Media & Press',
            bugReport: 'Bug Report',
            featureRequest: 'Feature Request',
            accountIssues: 'Account Issues',
            billingQuestions: 'Billing Questions',
            other: 'Other'
        },
        countries: {
            unitedStates: 'United States',
            canada: 'Canada',
            unitedKingdom: 'United Kingdom',
            germany: 'Germany',
            france: 'France',
            spain: 'Spain',
            italy: 'Italy',
            australia: 'Australia',
            japan: 'Japan',
            china: 'China',
            india: 'India',
            brazil: 'Brazil',
            mexico: 'Mexico',
            netherlands: 'Netherlands',
            sweden: 'Sweden',
            norway: 'Norway',
            denmark: 'Denmark',
            belgium: 'Belgium',
            switzerland: 'Switzerland',
            austria: 'Austria',
            portugal: 'Portugal',
            ireland: 'Ireland',
            southKorea: 'South Korea',
            singapore: 'Singapore',
            newZealand: 'New Zealand',
            southAfrica: 'South Africa',
            argentina: 'Argentina',
            chile: 'Chile',
            israel: 'Israel',
            uae: 'UAE',
            saudiArabia: 'Saudi Arabia',
            other: 'Other'
        }
    });

    // Helper function to get translation from JSON or API
    const getTranslation = async (text, targetLanguage) => {
        const languageData = contactTranslations.find(
            item => item.hreflang === targetLanguage
        );

        if (languageData && languageData.translatedText) {
            const keyMapping = {
                'Contact Us': 'contactUs',
                'Get in touch': 'getInTouch',
                'First Name': 'firstName',
                'Last Name': 'lastName',
                'Email': 'email',
                'Telegram ID': 'telegram',
                'Company (Optional)': 'company',
                'Job Title (Optional)': 'jobTitle',
                'Country': 'country',
                'Subject': 'subject',
                'Message': 'message',
                'How did you hear about us? (Optional)': 'howDidYouHear',
                'Subscribe to our newsletter': 'newsletter',
                'Submit': 'submit',
                'Submitting...': 'submitting',
                'Thank you! Your message has been sent successfully.': 'successMessage',
                'First name is required': 'firstNameRequired',
                'Last name is required': 'lastNameRequired',
                'Email is required': 'emailRequired',
                'Please enter a valid email address': 'emailInvalid',
                'Telegram ID is required': 'telegramRequired',
                'Please select a subject': 'subjectRequired',
                'Message is required': 'messageRequired',
                'Message must be at least 10 characters': 'messageLength',
                'Contact Info': 'contactInfo',
                'Email Label': 'emailLabel',
                'Response within 24 hours': 'responseTime',
                'Telegram Label': 'telegramLabel',
                '24/7 Support': 'telegramSupport',
                'Office Hours': 'officeHours',
                'Monday - Friday, 9am - 6pm': 'workingHours',
                'Address': 'address',
                'Colombo, Sri Lanka': 'addressDetails',
                'Follow Us': 'followUs',
                'Have questions or need assistance? Fill out the form below and our team will get back to you as soon as possible.': 'contactDescription',
                '-- Select Country --': 'selectCountry',
                '-- Select Subject --': 'selectSubject'
            };

            const jsonKey = keyMapping[text];
            if (jsonKey && languageData.translatedText[jsonKey]) {
                return languageData.translatedText[jsonKey];
            }
        }

        return await debugTranslateText(text, 'en', targetLanguage);
    };

    // Translate UI labels when language changes
    useEffect(() => {
        const translateLabels = async () => {
            if (previousLanguage.current === language) return;
            setIsTranslating(true);
            previousLanguage.current = language;

            try {
                // Get language data from JSON
                const languageData = contactTranslations.find(
                    item => item.hreflang === language
                );

                if (languageData && languageData.translatedText) {
                    // Use translations from JSON file directly
                    setTranslatedText({
                        contactUs: languageData.translatedText.contactUs,
                        getInTouch: languageData.translatedText.getInTouch,
                        firstName: languageData.translatedText.firstName,
                        lastName: languageData.translatedText.lastName,
                        email: languageData.translatedText.email,
                        telegram: languageData.translatedText.telegram,
                        company: languageData.translatedText.company,
                        jobTitle: languageData.translatedText.jobTitle,
                        country: languageData.translatedText.country,
                        subject: languageData.translatedText.subject,
                        message: languageData.translatedText.message,
                        howDidYouHear: languageData.translatedText.howDidYouHear,
                        newsletter: languageData.translatedText.newsletter,
                        submit: languageData.translatedText.submit,
                        submitting: languageData.translatedText.submitting,
                        successMessage: languageData.translatedText.successMessage,
                        firstNameRequired: languageData.translatedText.firstNameRequired,
                        lastNameRequired: languageData.translatedText.lastNameRequired,
                        emailRequired: languageData.translatedText.emailRequired,
                        emailInvalid: languageData.translatedText.emailInvalid,
                        telegramRequired: languageData.translatedText.telegramRequired,
                        subjectRequired: languageData.translatedText.subjectRequired,
                        messageRequired: languageData.translatedText.messageRequired,
                        messageLength: languageData.translatedText.messageLength,
                        contactInfo: languageData.translatedText.contactInfo,
                        emailLabel: languageData.translatedText.emailLabel,
                        responseTime: languageData.translatedText.responseTime,
                        telegramLabel: languageData.translatedText.telegramLabel,
                        telegramSupport: languageData.translatedText.telegramSupport,
                        officeHours: languageData.translatedText.officeHours,
                        workingHours: languageData.translatedText.workingHours,
                        address: languageData.translatedText.address,
                        addressDetails: languageData.translatedText.addressDetails,
                        followUs: languageData.translatedText.followUs,
                        contactDescription: languageData.translatedText.contactDescription,
                        selectCountry: languageData.translatedText.selectCountry,
                        selectSubject: languageData.translatedText.selectSubject,
                        subjects: languageData.translatedText.subjects || translatedText.subjects,
                        countries: languageData.translatedText.countries || translatedText.countries
                    });
                } else {
                    // Fallback to API translation if JSON not found
                    const [
                        contactUs, getInTouch, firstName, lastName, email, telegram,
                        company, jobTitle, country, subject, message, howDidYouHear,
                        newsletter, submit, submitting, successMessage, firstNameRequired,
                        lastNameRequired, emailRequired, emailInvalid, telegramRequired,
                        subjectRequired, messageRequired, messageLength, contactInfo,
                        emailLabel, responseTime, telegramLabel, telegramSupport,
                        officeHours, workingHours, address, addressDetails, followUs,
                        contactDescription, selectCountry, selectSubject
                    ] = await Promise.all([
                        getTranslation('Contact Us', language),
                        getTranslation('Get in touch', language),
                        getTranslation('First Name', language),
                        getTranslation('Last Name', language),
                        getTranslation('Email', language),
                        getTranslation('Telegram ID', language),
                        getTranslation('Company (Optional)', language),
                        getTranslation('Job Title (Optional)', language),
                        getTranslation('Country', language),
                        getTranslation('Subject', language),
                        getTranslation('Message', language),
                        getTranslation('How did you hear about us? (Optional)', language),
                        getTranslation('Subscribe to our newsletter', language),
                        getTranslation('Submit', language),
                        getTranslation('Submitting...', language),
                        getTranslation('Thank you! Your message has been sent successfully.', language),
                        getTranslation('First name is required', language),
                        getTranslation('Last name is required', language),
                        getTranslation('Email is required', language),
                        getTranslation('Please enter a valid email address', language),
                        getTranslation('Telegram ID is required', language),
                        getTranslation('Please select a subject', language),
                        getTranslation('Message is required', language),
                        getTranslation('Message must be at least 10 characters', language),
                        getTranslation('Contact Info', language),
                        getTranslation('Email Label', language),
                        getTranslation('Response within 24 hours', language),
                        getTranslation('Telegram Label', language),
                        getTranslation('24/7 Support', language),
                        getTranslation('Office Hours', language),
                        getTranslation('Monday - Friday, 9am - 6pm', language),
                        getTranslation('Address', language),
                        getTranslation('Colombo, Sri Lanka', language),
                        getTranslation('Follow Us', language),
                        getTranslation('Have questions or need assistance? Fill out the form below and our team will get back to you as soon as possible.', language),
                        getTranslation('-- Select Country --', language),
                        getTranslation('-- Select Subject --', language)
                    ]);

                    setTranslatedText(prev => ({
                        ...prev,
                        contactUs, getInTouch, firstName, lastName, email, telegram,
                        company, jobTitle, country, subject, message, howDidYouHear,
                        newsletter, submit, submitting, successMessage, firstNameRequired,
                        lastNameRequired, emailRequired, emailInvalid, telegramRequired,
                        subjectRequired, messageRequired, messageLength, contactInfo,
                        emailLabel, responseTime, telegramLabel, telegramSupport,
                        officeHours, workingHours, address, addressDetails, followUs,
                        contactDescription, selectCountry, selectSubject
                    }));
                }
            } finally {
                setIsTranslating(false);
            }
        };

        translateLabels();
    }, [language, debugTranslateText]);

    // Check for dark mode on mount and listen for changes
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
        };

        checkDarkMode();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkDarkMode();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

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

    // Get translated categories from translatedText.countries
    const getTranslatedCategories = () => {
        if (!translatedText.countries) return [];
        return Object.values(translatedText.countries);
    };

    // Get translated subjects from translatedText.subjects
    const getTranslatedSubjects = () => {
        if (!translatedText.subjects) return [];
        return Object.values(translatedText.subjects);
    };

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
            outline: 'none',
            boxSizing: 'border-box'
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
            backgroundSize: '16px',
            boxSizing: 'border-box'
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
            resize: 'vertical',
            boxSizing: 'border-box'
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
            cursor: 'pointer',
            textDecoration: 'none'
        },
        row: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            flexDirection: isMobile ? 'column' : 'row'
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

                            {/* <div style={styles.row}>
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
                            </div> */}

                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="category">{translatedText.country}</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">{translatedText.selectCountry}</option>
                                    {getTranslatedCategories().map((category, index) => (
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
                                    <option value="">{translatedText.selectSubject}</option>
                                    {getTranslatedSubjects().map((subject, index) => (
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
{/* 
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
                            </div> */}

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