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

  async function hasSubmittedReviewToday(reviewerId, reviewedUserId) {
    if (!reviewerId || !reviewedUserId) {
      console.error('Missing required parameters:', { reviewerId, reviewedUserId });
      throw new Error('Missing required parameters for review check');
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      console.log('Checking reviews for:', {
        reviewerId,
        reviewedUserId,
        today: today.toISOString()
      });

      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('reviewerId', '==', reviewerId),
        where('reviewedUserId', '==', reviewedUserId)
      );
      
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter reviews from today in memory
      const todayReviews = reviews.filter(review => {
        const reviewDate = review.timestamp?.toDate() || new Date(review.createdAt);
        return reviewDate >= today;
      });
      
      const hasSubmitted = todayReviews.length > 0;
      
      console.log('Review check result:', {
        hasSubmitted,
        count: todayReviews.length
      });
      
      return hasSubmitted;
    } catch (err) {
      console.error('Error in hasSubmittedReviewToday:', err);
      throw new Error(`Failed to check daily review limit: ${err.message}`);
    }
  }

  async function submitReview(reviewData) {
    if (!reviewData) {
      throw new Error('Review data is required');
    }

    setLoading(true);
    setError('');
    
    try {
      // Validate required fields
      const requiredFields = ['groupId', 'reviewerId', 'reviewedUserId'];
      const missingFields = requiredFields.filter(field => !reviewData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check if user has a groupId
      if (!reviewData.groupId) {
        throw new Error('You must be assigned to a group to submit reviews');
      }

      console.log('Submitting review with data:', {
        ...reviewData,
        timestamp: new Date().toISOString()
      });

      // Check if user has already submitted a review for this user today
      const hasSubmitted = await hasSubmittedReviewToday(
        reviewData.reviewerId,
        reviewData.reviewedUserId
      );

      if (hasSubmitted) {
        throw new Error('You have already submitted a review for this user today');
      }

      const reviewRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        timestamp: Timestamp.now(),
        createdAt: new Date().toISOString(),
        status: 'submitted'
      });

      console.log('Review submitted successfully:', reviewRef.id);
      return reviewRef.id;
    } catch (err) {
      console.error('Error in submitReview:', err);
      const errorMessage = err.message || 'Failed to submit review';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function getGroupReviews(groupId) {
    if (!groupId) {
      console.warn('getGroupReviews called without groupId');
      return [];
    }
    
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('groupId', '==', groupId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error in getGroupReviews:', error);
      return [];
    }
  }

  async function getUserReviews(userId, groupId) {
    if (!userId || !groupId) {
      console.warn('getUserReviews called with missing parameters:', { userId, groupId });
      return [];
    }
    
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('groupId', '==', groupId),
        where('reviewedUserId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error in getUserReviews:', error);
      return [];
    }
  }

  async function getReviewsByUser(reviewerId, groupId) {
    if (!reviewerId || !groupId) {
      console.warn('getReviewsByUser called with missing parameters:', { reviewerId, groupId });
      return [];
    }
    
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('groupId', '==', groupId),
        where('reviewerId', '==', reviewerId)
      );
      const querySnapshot = await getDocs(q);
      
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort reviews by timestamp, newest first
      return reviews.sort((a, b) => {
        const dateA = a.timestamp?.toDate() || new Date(a.createdAt);
        const dateB = b.timestamp?.toDate() || new Date(b.createdAt);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error in getReviewsByUser:', error);
      return [];
    }
  }

  const value = {
    submitReview,
    getGroupReviews,
    getUserReviews,
    getReviewsByUser,
    error,
    loading
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}