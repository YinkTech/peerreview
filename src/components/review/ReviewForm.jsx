// src/components/review/ReviewForm.jsx
import React, { useState } from 'react';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

export default function ReviewForm() {
  const { submitReview, loading, error: reviewError } = useReview();
  const { currentUser } = useAuth();
  const [ratings, setRatings] = useState({
    participation: 3,
    punctuality: 3,
    teamwork: 3
  });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Don't render anything if user is not assigned to a group
  if (!currentUser?.groupId || currentUser.groupId === 'new') {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Double-check group assignment before submitting
    if (!currentUser?.groupId || currentUser.groupId === 'new') {
      setError('You must be assigned to a group to submit reviews');
      return;
    }

    try {
      await submitReview({
        ...ratings,
        feedback,
        reviewerId: currentUser.uid,
        groupId: currentUser.groupId,
        reviewerName: currentUser.fullName || currentUser.email,
        anonymous: true
      });

      setSuccess(true);
      setFeedback('');
      // Reset ratings to default
      setRatings({
        participation: 3,
        punctuality: 3,
        teamwork: 3
      });
      
      setTimeout(() => setSuccess(false), 3000); // Clear success message after 3 seconds
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to submit review');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded-md border border-green-200">
          Review submitted successfully!
        </div>
      )}
      {reviewError && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md border border-red-200">
          {reviewError}
        </div>
      )}

      {Object.entries(ratings).map(([category, value]) => (
        <div key={category} className="space-y-2">
          <label className="block capitalize">{category}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={value}
            onChange={(e) => setRatings(prev => ({
              ...prev,
              [category]: parseInt(e.target.value)
            }))}
            className="w-full"
          />
          <div className="text-sm text-gray-600">Rating: {value}/5</div>
        </div>
      ))}

      <div className="space-y-2">
        <label className="block">Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Additional feedback..."
          className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
          rows="4"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading || !currentUser?.groupId}
        className={`w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}