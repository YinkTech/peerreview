import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Modal from '../common/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewList({ group, onClose, onDeleteReview }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    async function fetchReviews() {
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('groupId', '==', group.id)
        );
        const snapshot = await getDocs(reviewsQuery);
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsData);

        // Fetch user names for reviewed users
        const reviewedUserIds = [...new Set(reviewsData.map(review => review.reviewedUserId))];
        const userNamesMap = {};
        
        for (const userId of reviewedUserIds) {
          if (userId) {
            try {
              const userQuery = query(
                collection(db, 'users'),
                where('__name__', '==', userId)
              );
              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                userNamesMap[userId] = userData.fullName || userData.email || 'Unknown User';
              }
            } catch (error) {
              console.error('Error fetching user name for ID:', userId, error);
              userNamesMap[userId] = 'Unknown User';
            }
          }
        }
        
        setUserNames(userNamesMap);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [group.id]);

  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Reviewer Name',
      'Reviewed User',
      'Date',
      'Attendance',
      'Punctuality',
      'Quality of Contribution',
      'Level of Participation',
      'Collaboration',
      'Overall Performance',
      'Learning Environment',
      'Areas for Improvement',
      'Suggestions for Future Sessions',
      'Additional Feedback'
    ];

    const csvContent = [
      headers.join(','),
      ...reviews.map(review => [
        `"${review.reviewerName || ''}"`,
        `"${userNames[review.reviewedUserId] || 'Unknown User'}"`,
        `"${new Date(review.createdAt).toLocaleDateString()}"`,
        `"${review.attendance || ''}"`,
        `"${review.punctuality || ''}"`,
        `"${review.qualityOfContribution || ''}"`,
        `"${review.levelOfParticipation || ''}"`,
        `"${review.collaboration || ''}"`,
        `"${review.overallContribution || ''}"`,
        `"${review.environment || ''}"`,
        `"${(review.areasForImprovement || '').replace(/"/g, '""')}"`,
        `"${(review.suggestions || '').replace(/"/g, '""')}"`,
        `"${(review.feedback || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reviews_${group.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reviews for {group.name}</h3>
              <div className="flex items-center space-x-2">
                {reviews.length > 0 && (
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Export to Excel
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            
            {loading ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {reviews.map(review => (
                  <div key={review.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">
                          By: {review.reviewerName}
                          <br />
                          Reviewing: {userNames[review.reviewedUserId] || 'Unknown User'}
                          <br />
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteReview(review.id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <p className="font-medium">Attendance</p>
                        <p>{review.attendance}</p>
                      </div>
                      <div>
                        <p className="font-medium">Punctuality</p>
                        <p>{review.punctuality}</p>
                      </div>
                      <div>
                        <p className="font-medium">Learning Environment</p>
                        <p>{review.environment}</p>
                      </div>
                      <div>
                        <p className="font-medium">Overall Performance</p>
                        <p>{review.overallContribution}</p>
                      </div>
                      <div>
                        <p className="font-medium">Quality of Contribution</p>
                        <p>{review.qualityOfContribution}/5</p>
                      </div>
                      <div>
                        <p className="font-medium">Level of Participation</p>
                        <p>{review.levelOfParticipation}/5</p>
                      </div>
                      <div>
                        <p className="font-medium">Collaboration</p>
                        <p>{review.collaboration}/5</p>
                      </div>
                    </div>
                    {review.feedback && (
                      <div className="mt-2">
                        <p className="font-medium">Areas for Improvement:</p>
                        <p className="text-gray-700">{review.areasForImprovement}</p>
                      </div>
                    )}
                    {review.feedback && (
                      <div className="mt-2">
                        <p className="font-medium">Suggestions for Future Sessions:</p>
                        <p className="text-gray-700">{review.suggestions}</p>
                      </div>
                    )}
                    {review.feedback && (
                      <div className="mt-2">
                        <p className="font-medium">Additional Feedback:</p>
                        <p className="text-gray-700">{review.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 