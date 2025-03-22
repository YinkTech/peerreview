// src/pages/Review.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/review/ReviewForm';
import UserReviews from '../components/review/UserReviews';

export default function Review() {
  const { currentUser, userRole } = useAuth();

  // If user is not a student, redirect to dashboard
  if (userRole !== 'student') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Only students can access the review system.
        </p>
      </div>
    );
  }

  // If user is not assigned to a group
  if (!currentUser?.groupId || currentUser.groupId === 'new') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          No Group Assigned
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You need to be assigned to a group to access the review system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Submit a Review
        </h2>
        <ReviewForm />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Reviews About You
        </h2>
        <UserReviews />
      </div>
    </div>
  );
}