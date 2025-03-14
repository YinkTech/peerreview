// src/contexts/ReviewContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

const ReviewContext = createContext();

export function useReview() {
  return useContext(ReviewContext);
}

export function ReviewProvider({ children }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitReview(reviewData) {
    setLoading(true);
    setError('');
    try {
      // Check if user has a groupId
      if (!reviewData.groupId) {
        throw new Error('You must be assigned to a group to submit reviews');
      }

      console.log('Submitting review:', reviewData);

      const reviewRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        timestamp: Timestamp.now(),
        createdAt: new Date().toISOString(),
        status: 'submitted'
      });

      console.log('Review submitted successfully:', reviewRef.id);
      return reviewRef.id;
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getGroupReviews(groupId) {
    if (!groupId) return [];
    
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('groupId', '==', groupId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching group reviews:', error);
      return [];
    }
  }

  const value = {
    submitReview,
    getGroupReviews,
    error,
    loading
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}