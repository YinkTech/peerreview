// src/pages/Review.jsx
import React from 'react';
import ReviewForm from '../components/review/ReviewForm';
import Navbar from '../components/common/Navbar';

export default function Review() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-6">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Submit Review</h2>
            <ReviewForm />
          </div>
        </div>
      </div>
    </div>
  );
}