'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

// Apple-style color palette
const appleBlue: MantineColorsTuple = [
    '#e5f4ff',
    '#cde2ff',
    '#9bc2ff',
    '#64a0ff',
    '#3984fe',
    '#1d72fe',
    '#0071e3', // Apple primary blue
    '#0058b0',
    '#004d9e',
    '#00428c'
];

export const appleTheme = createTheme({
    primaryColor: 'appleBlue',
    colors: {
        appleBlue,
        dark: [
            '#d5d7e0',
            '#acaebf',
            '#8c8fa3',
            '#666980',
            '#4d4f66',
            '#34354a',
            '#2b2c3d',
            '#1d1e30', // Apple dark surface
            '#0c0d1a',
            '#000000'  // Pure black (Apple style)
        ],
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    headings: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        fontWeight: '600',
    },
    radius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
    },
    defaultRadius: 'md',
    cursorType: 'pointer',
    other: {
        // Apple-specific tokens
        glassBackground: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        glassHover: 'rgba(255, 255, 255, 0.08)',
        textPrimary: '#f5f5f7',
        textSecondary: '#86868b',
        positive: '#30d158',
        negative: '#ff453a',
        warning: '#ffd60a',
    },
});

// Design tokens for components
export const designTokens = {
    colors: {
        background: '#000000',
        surface: 'rgba(255, 255, 255, 0.05)',
        surfaceHover: 'rgba(255, 255, 255, 0.08)',
        surfaceBorder: 'rgba(255, 255, 255, 0.1)',
        text: '#f5f5f7',
        textSecondary: '#86868b',
        accent: '#0071e3',
        positive: '#30d158',
        negative: '#ff453a',
        warning: '#ffd60a',
    },
    gradients: {
        positive: 'linear-gradient(135deg, #30d158, #28a745)',
        negative: 'linear-gradient(135deg, #ff453a, #dc3545)',
        accent: 'linear-gradient(135deg, #0071e3, #005bb5)',
        surface: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    },
};
