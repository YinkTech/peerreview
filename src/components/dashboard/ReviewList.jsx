import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Modal from '../common/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewList({ group, onClose, onDeleteReview }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [group.id]);

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
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
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
                          By: {review.anonymous ? 'Anonymous' : review.reviewerName}
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
                        <p className="font-medium">Participation</p>
                        <p>{review.participation}/5</p>
                      </div>
                      <div>
                        <p className="font-medium">Punctuality</p>
                        <p>{review.punctuality}/5</p>
                      </div>
                      <div>
                        <p className="font-medium">Teamwork</p>
                        <p>{review.teamwork}/5</p>
                      </div>
                    </div>
                    {review.feedback && (
                      <div className="mt-2">
                        <p className="font-medium">Feedback:</p>
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