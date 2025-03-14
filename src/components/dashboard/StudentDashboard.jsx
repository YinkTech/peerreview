// src/components/dashboard/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReview } from '../../contexts/ReviewContext';
import ReviewForm from '../review/ReviewForm';
import ReviewSummary from '../review/ReviewSummary';
import { motion } from 'framer-motion';

// Add these animation variants at the top
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const { getGroupReviews } = useReview();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        if (!currentUser?.groupId) {
          setReviews([]);
          setLoading(false);
          return;
        }
        
        const groupReviews = await getGroupReviews(currentUser.groupId);
        setReviews(groupReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [currentUser, getGroupReviews]);

  // Show warning message for both new and unassigned students
  if (!currentUser?.groupId || currentUser?.groupId === 'new') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md w-full p-8"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg 
              className="mx-auto h-12 w-12 text-yellow-400 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Not Assigned to a Group
            </h3>
            <p className="text-yellow-700">
              You haven't been assigned to a group yet. Please contact your teacher to be assigned to a group.
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Only show the dashboard content for students with valid group assignments
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white"
      >
        <h2 className="text-3xl font-bold">Welcome back, {currentUser.fullName}!</h2>
        <p className="mt-2 text-blue-100">Track your progress and submit daily reviews</p>
      </motion.div>

      {currentUser?.groupId && currentUser.groupId !== 'new' && (
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold mb-6">Submit Daily Review</h3>
            <ReviewForm />
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold mb-6">Your Reviews</h3>
            {loading ? (
              <div className="flex justify-center">
                <motion.div
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            ) : reviews.length > 0 ? (
              <ReviewSummary reviews={reviews} />
            ) : (
              <p className="text-gray-600 text-center py-8">No reviews submitted yet.</p>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}