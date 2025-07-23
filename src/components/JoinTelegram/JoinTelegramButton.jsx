'use client';
import React from 'react';
import styles from './JoinTelegramButton.module.css';
import { useGlobalData } from '../Context/ApiContext';

const JoinTelegramButton = () => {
    const createRipple = (event) => {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add(styles.ripple);

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    };
    const { settings } = useGlobalData();
    const contact = settings?.[0] || {};
    return (
        <div className={styles.wrapper}>
            <a
                href={contact.telegram_link}
                className={styles.telegramBtn}
                onClick={createRipple}
            >
                <svg className={styles.telegramIcon} viewBox="0 0 24 24">
                    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                </svg>
                <span className={styles.btnText}>Join Telegram</span>
            </a>
        </div>

    );
};

export default JoinTelegramButton;
