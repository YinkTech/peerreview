// src/components/review/ReviewSummary.jsx
import React from 'react';

export default function ReviewSummary({ reviews }) {
  const calculateAverages = () => {
    if (!reviews.length) return null;
    
    const totals = reviews.reduce((acc, review) => ({
      participation: acc.participation + review.participation,
      punctuality: acc.punctuality + review.punctuality,
      teamwork: acc.teamwork + review.teamwork
    }), { participation: 0, punctuality: 0, teamwork: 0 });

    return {
      participation: (totals.participation / reviews.length).toFixed(1),
      punctuality: (totals.punctuality / reviews.length).toFixed(1),
      teamwork: (totals.teamwork / reviews.length).toFixed(1)
    };
  };

  const averages = calculateAverages();

  if (!averages) return <p>No reviews available</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(averages).map(([category, value]) => (
          <div key={category} className="text-center p-4 border rounded">
            <h4 className="font-medium capitalize">{category}</h4>
            <p className="text-2xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h4 className="font-medium mb-2">Recent Feedback</h4>
        <div className="space-y-2">
          {reviews.slice(0, 5).map((review, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <p className="text-sm">{review.feedback}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(review.timestamp.toDate()).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}