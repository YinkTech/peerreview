import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Try to get from localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Load user preferences when auth state changes
  useEffect(() => {
    async function loadUserPreferences() {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.preferences?.darkMode !== undefined) {
              setDarkMode(userData.preferences.darkMode);
              localStorage.setItem('theme', userData.preferences.darkMode ? 'dark' : 'light');
            }
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }
      }
      setLoading(false);
    }

    loadUserPreferences();
  }, [currentUser]);

  // Update HTML class and localStorage when dark mode changes
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  }, [darkMode]);

  const toggleDarkMode = async (value) => {
    try {
      setDarkMode(value);
      localStorage.setItem('theme', value ? 'dark' : 'light');
      
      if (currentUser?.uid) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          'preferences.darkMode': value
        });
      }
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
} 