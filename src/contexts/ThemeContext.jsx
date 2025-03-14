import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const { currentUser } = useAuth();
  // Initialize darkMode from localStorage or user preferences
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference if no saved theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Load theme preference from user data when they log in
  useEffect(() => {
    if (currentUser?.preferences?.darkMode !== undefined) {
      setDarkMode(currentUser.preferences.darkMode);
      localStorage.setItem('theme', currentUser.preferences.darkMode ? 'dark' : 'light');
    }
  }, [currentUser]);

  // Update HTML class and localStorage when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    
    // Save to localStorage
    localStorage.setItem('theme', value ? 'dark' : 'light');
    
    // Save to Firestore if user is logged in
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          'preferences.darkMode': value
        });
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  const value = {
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
} 