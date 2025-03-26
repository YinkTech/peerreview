import React from 'react';
import Navbar from '../common/Navbar';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-20 pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
} 