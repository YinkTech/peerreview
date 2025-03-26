// src/components/review/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export default function ReviewForm() {
  const { submitReview, loading, error: reviewError } = useReview();
  const { currentUser } = useAuth();
  const [ratings, setRatings] = useState({
    qualityOfContribution: 3,
    levelOfParticipation: 3,
    collaboration: 3,
    overallContribution: 3
  });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [reviewedToday, setReviewedToday] = useState([]);
  const [attendance, setAttendance] = useState('yes');
  const [punctuality, setPunctuality] = useState('yes');
  const [environment, setEnvironment] = useState('very_conducive');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [suggestions, setSuggestions] = useState('');

  // Don't render anything if user is not assigned to a group
  if (!currentUser?.groupId || currentUser.groupId === 'new') {
    return null;
  }

  useEffect(() => {
    // Fetch group members when component mounts
    const fetchGroupMembers = async () => {
      try {
        setIsLoadingMembers(true);
        setError('');

        console.log('Fetching group members for group:', currentUser.groupId);

        // Query users collection for members in the same group
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('groupId', '==', currentUser.groupId));
        const querySnapshot = await getDocs(q);
        
        // Convert the query snapshot to an array of user objects
        const members = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('Found group members:', members.length);

        // Filter out the current user from the list
        const filteredMembers = members.filter(member => member.id !== currentUser.uid);
        setGroupMembers(filteredMembers);

        // Check which users have been reviewed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log('Fetching today\'s reviews for user:', currentUser.uid);
        
        // First get all reviews for the current user
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(
          reviewsRef,
          where('reviewerId', '==', currentUser.uid)
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter reviews from today in memory
        const todayReviews = reviews.filter(review => {
          const reviewDate = review.timestamp?.toDate() || new Date(review.createdAt);
          return reviewDate >= today;
        });

        const reviewedUserIds = todayReviews.map(review => review.reviewedUserId);
        
        console.log('Found reviews for today:', reviewedUserIds.length);
        setReviewedToday(reviewedUserIds);
      } catch (err) {
        console.error('Error in fetchGroupMembers:', err);
        setError(`Failed to load group members: ${err.message}`);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    if (currentUser?.groupId && currentUser.groupId !== 'new') {
      fetchGroupMembers();
    }
  }, [currentUser?.groupId, currentUser?.uid]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate all required fields
    if (!selectedUser) {
      setError('Please select a user to review');
      return;
    }

    if (!attendance) {
      setError('Please answer the attendance question');
      return;
    }

    // If attendance is "no", only submit attendance
    if (attendance === 'no') {
      try {
        console.log('Submitting attendance-only review for user:', selectedUser);
        
        await submitReview({
          reviewerId: currentUser.uid,
          reviewedUserId: selectedUser,
          groupId: currentUser.groupId,
          reviewerName: currentUser.fullName || currentUser.email,
          anonymous: true,
          attendance: 'no'
        });

        setSuccess(true);
        setSelectedUser('');
        setAttendance('yes');
        
        // Update the reviewedToday list
        setReviewedToday(prev => [...prev, selectedUser]);
        
        setTimeout(() => setSuccess(false), 3000); // Clear success message after 3 seconds
      } catch (err) {
        console.error('Error in handleSubmit:', err);
        setError(err.message || 'Failed to submit review');
      }
      return;
    }

    // For attendance "yes", validate all other fields
    if (!punctuality || !environment) {
      setError('Please answer all attendance and environment questions');
      return;
    }

    if (!ratings.qualityOfContribution || !ratings.levelOfParticipation || 
        !ratings.collaboration || !ratings.overallContribution) {
      setError('Please provide all ratings');
      return;
    }

    if (!areasForImprovement.trim()) {
      setError('Please provide areas for improvement');
      return;
    }

    if (!suggestions.trim()) {
      setError('Please provide suggestions for future sessions');
      return;
    }

    // Double-check group assignment before submitting
    if (!currentUser?.groupId || currentUser.groupId === 'new') {
      setError('You must be assigned to a group to submit reviews');
      return;
    }

    try {
      console.log('Submitting full review for user:', selectedUser);
      
      await submitReview({
        ...ratings,
        feedback,
        reviewerId: currentUser.uid,
        reviewedUserId: selectedUser,
        groupId: currentUser.groupId,
        reviewerName: currentUser.fullName || currentUser.email,
        anonymous: true,
        attendance,
        punctuality,
        environment,
        areasForImprovement,
        suggestions
      });

      setSuccess(true);
      setFeedback('');
      setSelectedUser('');
      // Reset all form fields
      setRatings({
        qualityOfContribution: 3,
        levelOfParticipation: 3,
        collaboration: 3,
        overallContribution: 3
      });
      setAttendance('yes');
      setPunctuality('yes');
      setEnvironment('very_conducive');
      setAreasForImprovement('');
      setSuggestions('');
      
      // Update the reviewedToday list
      setReviewedToday(prev => [...prev, selectedUser]);
      
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

  // Filter out users that have already been reviewed today
  const availableMembers = groupMembers.filter(member => !reviewedToday.includes(member.id));

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
        <label className="block">Select User to Review <span className="text-red-500">*</span></label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
          required
        >
          <option value="">Choose a user...</option>
          {availableMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName || member.email}
            </option>
          ))}
        </select>
        {availableMembers.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            You have already submitted reviews for all available group members today.
          </p>
        )}
      </div>

      {/* Attendance Question */}
      <div className="space-y-2">
        <label className="block">Was your colleague in Attendance today? <span className="text-red-500">*</span></label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="yes"
              checked={attendance === 'yes'}
              onChange={(e) => setAttendance(e.target.value)}
              className="mr-2"
              required
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="no"
              checked={attendance === 'no'}
              onChange={(e) => setAttendance(e.target.value)}
              className="mr-2"
              required
            />
            No
          </label>
        </div>
      </div>

      {/* Only show other fields if attendance is "yes" */}
      {attendance === 'yes' && (
        <>
          {/* Punctuality Question */}
          <div className="space-y-2">
            <label className="block">
              Was your colleague Punctual today? (Joined before or within 5 minutes of start time) <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="yes"
                  checked={punctuality === 'yes'}
                  onChange={(e) => setPunctuality(e.target.value)}
                  className="mr-2"
                  required
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="no"
                  checked={punctuality === 'no'}
                  onChange={(e) => setPunctuality(e.target.value)}
                  className="mr-2"
                  required
                />
                No
              </label>
            </div>
          </div>

          {/* Quality of Contribution */}
          <div className="space-y-2">
            <label className="block">Quality of Contribution <span className="text-red-500">*</span></label>
            <input
              type="range"
              min="1"
              max="5"
              value={ratings.qualityOfContribution}
              onChange={(e) => setRatings(prev => ({
                ...prev,
                qualityOfContribution: parseInt(e.target.value)
              }))}
              className="w-full"
              required
            />
            <div className="text-sm text-gray-600">Rating: {ratings.qualityOfContribution}/5</div>
          </div>

          {/* Level of Participation */}
          <div className="space-y-2">
            <label className="block">Level of Participation <span className="text-red-500">*</span></label>
            <input
              type="range"
              min="1"
              max="5"
              value={ratings.levelOfParticipation}
              onChange={(e) => setRatings(prev => ({
                ...prev,
                levelOfParticipation: parseInt(e.target.value)
              }))}
              className="w-full"
              required
            />
            <div className="text-sm text-gray-600">Rating: {ratings.levelOfParticipation}/5</div>
          </div>

          {/* Collaboration */}
          <div className="space-y-2">
            <label className="block">How effectively did your peer collaborate with the team today? <span className="text-red-500">*</span></label>
            <input
              type="range"
              min="1"
              max="5"
              value={ratings.collaboration}
              onChange={(e) => setRatings(prev => ({
                ...prev,
                collaboration: parseInt(e.target.value)
              }))}
              className="w-full"
              required
            />
            <div className="text-sm text-gray-600">
              Rating: {ratings.collaboration}/5 ({ratings.collaboration === 1 ? 'Not effective' : ratings.collaboration === 5 ? 'Highly effective' : 'Moderate'})
            </div>
          </div>

          {/* Overall Contribution */}
          <div className="space-y-2">
            <label className="block">How would you rate your peer's overall performance today? <span className="text-red-500">*</span></label>
            <input
              type="range"
              min="1"
              max="5"
              value={ratings.overallContribution}
              onChange={(e) => setRatings(prev => ({
                ...prev,
                overallContribution: parseInt(e.target.value)
              }))}
              className="w-full"
              required
            />
            <div className="text-sm text-gray-600">
              Rating: {ratings.overallContribution}/5 ({ratings.overallContribution === 1 ? 'Poor' : ratings.overallContribution === 5 ? 'Excellent' : 'Average'})
            </div>
          </div>

          {/* Learning Environment */}
          <div className="space-y-2">
            <label className="block">How conducive is your colleague's environment to learning? <span className="text-red-500">*</span></label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
              required
            >
              <option value="">Select an option...</option>
              <option value="very_conducive">Very Conducive</option>
              <option value="conducive">Conducive</option>
              <option value="ok">OK</option>
              <option value="distractive">Distractive</option>
              <option value="noisy_background">Noisy Background</option>
            </select>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-2">
            <label className="block">Areas for Improvement <span className="text-red-500">*</span></label>
            <textarea
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
              placeholder="Can you identify any areas where your peer could improve, particularly in terms of teamwork or communication?"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
              rows="3"
              required
            />
          </div>

          {/* Suggestions for Future Sessions */}
          <div className="space-y-2">
            <label className="block">Suggestions for Future Sessions <span className="text-red-500">*</span></label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="What suggestions would you offer your peer to enhance their participation or support the team in upcoming sessions?"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
              rows="3"
              required
            />
          </div>

          {/* Additional Feedback */}
          <div className="space-y-2">
            <label className="block">Additional Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any additional feedback..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
              rows="3"
            />
          </div>
        </>
      )}

      <Button 
        type="submit" 
        disabled={loading || !currentUser?.groupId || !selectedUser || availableMembers.length === 0}
        className={`w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}