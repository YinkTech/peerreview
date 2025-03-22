import React, { useState, useEffect } from 'react';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';

export default function UserReviews() {
  const { getUserReviews } = useReview();
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser?.groupId || !currentUser?.uid) return;

      try {
        setLoading(true);
        const userReviews = await getUserReviews(currentUser.uid, currentUser.groupId);
        setReviews(userReviews);
      } catch (err) {
        console.error('Error fetching user reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentUser?.groupId, currentUser?.uid, getUserReviews]);

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        No reviews have been submitted about you yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Anonymous Review
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Submitted on {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(review)
              .filter(([key]) => ['participation', 'punctuality', 'teamwork'].includes(key))
              .map(([category, rating]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`text-xl ${
                          index < rating
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {review.feedback && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Feedback
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {review.feedback}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 