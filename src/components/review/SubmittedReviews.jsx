import React, { useState, useEffect } from 'react';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function SubmittedReviews() {
  const { getReviewsByUser } = useReview();
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser?.groupId || !currentUser?.uid) return;

      try {
        setLoading(true);
        const submittedReviews = await getReviewsByUser(currentUser.uid, currentUser.groupId);
        setReviews(submittedReviews);
      } catch (err) {
        console.error('Error fetching submitted reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentUser?.groupId, currentUser?.uid, getReviewsByUser]);

  if (loading) {
    return <div className="text-center py-4">Loading your reviews...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-gray-600">
        You haven't submitted any reviews yet.
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-900">
              {review.reviewedUserName || 'User'}
            </h4>
            <span className="text-sm text-gray-500">
              {formatDate(review.timestamp || review.createdAt)}
            </span>
          </div>

          {review.attendance === 'no' ? (
            <div className="bg-red-50 text-red-600 p-2 rounded mb-3">
              Marked as absent
            </div>
          ) : (
            <>
              {/* Ratings */}
              <div className="space-y-2 mb-3">
                {Object.entries(review)
                  .filter(([key]) => [
                    'qualityOfContribution', 
                    'levelOfParticipation', 
                    'collaboration', 
                    'overallContribution'
                  ].includes(key) && review[key])
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < value ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Attendance */}
              {review.areasForImprovement && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Attendance:</span>{' '}
                  <span className="text-sm text-gray-600">
                    {review.attendance}
                  </span>
                </div>
              )}
              {/* Punctuality */}
              {review.areasForImprovement && (
                <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">Punctuality:</span>{' '}
                <span className="text-sm text-gray-600">
                  {review.punctuality}
                </span> 
                </div>
              )}

              {/* Environment */}
              {review.environment && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Environment:</span>{' '}
                  <span className="text-sm text-gray-600">
                    {review.environment.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              {/* Areas for improvement */}
              {review.areasForImprovement && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">
                    Areas for improvement:
                  </h5>
                  <p className="text-sm text-gray-600">{review.areasForImprovement}</p>
                </div>
              )}

              {/* Suggestions */}
              {review.suggestions && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">
                    Suggestions:
                  </h5>
                  <p className="text-sm text-gray-600">{review.suggestions}</p>
                </div>
              )}

              {/* Additional feedback */}
              {review.feedback && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">
                    Additional feedback:
                  </h5>
                  <p className="text-sm text-gray-600">{review.feedback}</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
} 