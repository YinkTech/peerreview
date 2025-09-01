// src/pages/Review.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserReviews from '../components/review/UserReviews';
import ReviewForm from '../components/review/ReviewForm';
import SubmittedReviews from '../components/review/SubmittedReviews';
import { motion } from 'framer-motion';

export default function Review() {
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('reviews-about-you');

  // If user is not a student, redirect to dashboard
  if (userRole !== 'student') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600">
          Only students can access the review system.
        </p>
      </div>
    );
  }

  // If user is not assigned to a group
  if (!currentUser?.groupId || currentUser.groupId === 'new') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          No Group Assigned
        </h2>
        <p className="text-gray-600">
          You need to be assigned to a group to access the review system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('reviews-about-you')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews-about-you'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reviews About You
          </button>
          <button
            onClick={() => setActiveTab('your-reviews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'your-reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Your Submitted Reviews
          </button>
          <button
            onClick={() => setActiveTab('submit-review')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'submit-review'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submit a Review
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'reviews-about-you' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Reviews About You
            </h2>
            <UserReviews />
          </motion.div>
        )}

        {activeTab === 'your-reviews' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Your Submitted Reviews
            </h2>
            <SubmittedReviews />
          </motion.div>
        )}

        {activeTab === 'submit-review' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Submit a Review
            </h2>
            <ReviewForm />
          </motion.div>
        )}
      </div>
    </div>
  );
}