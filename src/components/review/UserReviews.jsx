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
      <div className="text-center py-4 text-gray-600">
        No reviews have been submitted about you yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-lg shadow p-6 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Anonymous Review
              </h3>
              <p className="text-sm text-gray-500">
                Submitted on {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(review)
              .filter(([key]) => ['qualityOfContribution', 'levelOfParticipation', 'collaboration', 'overallContribution'].includes(key))
              .map(([category, rating]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`text-xl ${
                          index < rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
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
              <h4 className="font-medium text-gray-900 mb-2">
                Feedback
              </h4>
              <p className="text-gray-700">
                {review.feedback}
              </p>
            </div>
          )}

          {review.areasForImprovement && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Areas for Improvement
              </h4>
              <p className="text-gray-700">
                {review.areasForImprovement}
              </p>
            </div>
          )}

          {review.suggestions && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Suggestions for Future Sessions
              </h4>
              <p className="text-gray-700">
                {review.suggestions}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 