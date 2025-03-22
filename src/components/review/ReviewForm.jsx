// src/components/review/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  // Don't render anything if user is not assigned to a group
  if (!currentUser?.groupId || currentUser.groupId === 'new') {
    return null;
  }

  useEffect(() => {
    // Fetch group members when component mounts
    const fetchGroupMembers = async () => {
      try {
        setIsLoadingMembers(true);
        // Query users collection for members in the same group
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('groupId', '==', currentUser.groupId));
        const querySnapshot = await getDocs(q);
        
        // Convert the query snapshot to an array of user objects
        const members = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter out the current user from the list
        setGroupMembers(members.filter(member => member.id !== currentUser.uid));
      } catch (err) {
        console.error('Error fetching group members:', err);
        setError('Failed to load group members');
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchGroupMembers();
  }, [currentUser.groupId, currentUser.uid]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedUser) {
      setError('Please select a user to review');
      return;
    }

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
        reviewedUserId: selectedUser,
        groupId: currentUser.groupId,
        reviewerName: currentUser.fullName || currentUser.email,
        anonymous: true
      });

      setSuccess(true);
      setFeedback('');
      setSelectedUser('');
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

  if (isLoadingMembers) {
    return <div className="text-center py-4">Loading group members...</div>;
  }

  if (groupMembers.length === 0) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        There are no other members in your group to review at this time.
      </div>
    );
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

      <div className="space-y-2">
        <label className="block">Select User to Review</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
        >
          <option value="">Choose a user...</option>
          {groupMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName || member.email}
            </option>
          ))}
        </select>
      </div>

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
        disabled={loading || !currentUser?.groupId || !selectedUser}
        className={`w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}