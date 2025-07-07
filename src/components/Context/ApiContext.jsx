'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import CustomAxios from '../utilities/CustomAxios';
const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [blogCategories, setBlogCategories] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [sections, setSections] = useState([]);
    const [bestSections, setBestSections] = useState([]);

    const fetchBlogCategories = async () => {
        try {
            const response = await CustomAxios.get('/blog-categories');
            setBlogCategories(response.data);
        } catch (error) {
            console.error('Error fetching blog categories:', error);
        }
    };

    const fetchBlogs = async () => {
        try {
            const res = await CustomAxios.get('/get-blogs');
            setBlogs(res.data.results || []);
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        }
    };

    const fetchBettingApps = async () => {
        try {
            const response = await CustomAxios.get('/best-betting-headings', {
                params: { country_code: 'in', filter_by: 'current_month' },
            });

            const data = response.data;
            if (Array.isArray(data)) {
                setSections(data);
            } else {
                console.warn('Expected an array, but received:', data);
            }
        } catch (error) {
            console.error('Error fetching best betting headings:', error);
        }
    };
    const fetchBestBettingApps = async () => {
        try {
            const response = await CustomAxios.get('/best-betting-headings', {
                params: {
                    country_code: 'in',
                },
            });

            const data = response.data;

            if (Array.isArray(data)) {
                setBestSections(data);
            } else {
                console.warn('Expected an array, but received:', data);
            }
        } catch (error) {
            console.error('Error fetching best betting headings:', error);
        }
    };
    useEffect(() => {
        fetchBlogCategories();
        fetchBlogs();
        fetchBettingApps();
        fetchBestBettingApps()
    }, []);

    return (
        <DataContext.Provider
            value={{
                blogCategories,
                blogs,
                sections,
                bestSections
            }}>
            {children}
        </DataContext.Provider>
    );
};

export const useGlobalData = () => useContext(DataContext);
