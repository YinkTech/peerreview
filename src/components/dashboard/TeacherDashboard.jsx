// src/components/dashboard/TeacherDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../config/firebase';
import { collection, query, getDocs, doc, updateDoc, where, addDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import Loading from '../common/Loading';
import CreateGroupModal from './CreateGroupModal';
import { toast } from 'react-hot-toast';
import ReviewList from './ReviewList';
import { motion, AnimatePresence } from 'framer-motion';

const NOT_ASSIGNED_GROUP = {
  id: 'not-assigned',
  name: 'Not Assigned',
  averageParticipation: 'N/A',
  averagePunctuality: 'N/A',
  averageTeamwork: 'N/A',
  members: []
};

const UNASSIGNED_GROUP = {
  id: 'unassigned',
  name: 'Unassigned Students',
  averageParticipation: 'N/A',
  averagePunctuality: 'N/A',
  averageTeamwork: 'N/A',
  members: []
};

// Add these animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function TeacherDashboard() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedGroupReviews, setSelectedGroupReviews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  // Fetch both groups and their reviews
  const fetchGroupsWithReviews = async () => {
    try {
      // First get all groups
      const groupsSnapshot = await getDocs(collection(db, 'groups'));
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reviews: [] // Initialize empty reviews array
      }));

      // For each group, fetch their reviews
      for (let group of groupsData) {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('groupId', '==', group.id)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());

        // Calculate averages if there are reviews
        if (reviews.length > 0) {
          const averages = reviews.reduce((acc, review) => ({
            participation: acc.participation + (review.participation || 0),
            punctuality: acc.punctuality + (review.punctuality || 0),
            teamwork: acc.teamwork + (review.teamwork || 0)
          }), { participation: 0, punctuality: 0, teamwork: 0 });

          group.averageParticipation = (averages.participation / reviews.length).toFixed(1);
          group.averagePunctuality = (averages.punctuality / reviews.length).toFixed(1);
          group.averageTeamwork = (averages.teamwork / reviews.length).toFixed(1);
        }
      }

      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups and reviews:', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch groups with reviews
        await fetchGroupsWithReviews();

        // Fetch students
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student')
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || new Date().toISOString() // Fallback for older records
        }));
        setStudents(studentsData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateGroup = async (groupName) => {
    try {
      const newGroupRef = await addDoc(collection(db, 'groups'), {
        name: groupName,
        createdAt: new Date().toISOString(),
        averageParticipation: 0,
        averagePunctuality: 0,
        averageTeamwork: 0,
        members: []
      });

      const newGroup = {
        id: newGroupRef.id,
        name: groupName,
        averageParticipation: 0,
        averagePunctuality: 0,
        averageTeamwork: 0,
        members: []
      };

      setGroups(prevGroups => [...prevGroups, newGroup]);
      toast.success('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      const studentRef = doc(db, 'users', selectedStudent);
      
      if (selectedGroup === 'unassigned') {
        // Remove student from any group
        await updateDoc(studentRef, {
          groupId: null
        });
        
        toast.success('Student removed from group');
      } else if (!selectedGroup) {
        toast.error('Please select a group');
        return;
      } else {
        // Assign student to group
        await updateDoc(studentRef, {
          groupId: selectedGroup
        });

        toast.success('Student assigned to group');
      }

      // Update local state
      setStudents(students.map(student => 
        student.id === selectedStudent 
          ? { ...student, groupId: selectedGroup === 'unassigned' ? null : selectedGroup }
          : student
      ));

      // Reset selection
      setSelectedStudent('');
      setSelectedGroup('');
    } catch (error) {
      console.error('Error updating student assignment:', error);
      toast.error('Failed to update student assignment');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? All students will be unassigned.')) {
      return;
    }

    try {
      // First unassign all students in the group
      const groupStudents = students.filter(s => s.groupId === groupId);
      for (let student of groupStudents) {
        await updateDoc(doc(db, 'users', student.id), {
          groupId: null
        });
      }

      // Delete the group
      await deleteDoc(doc(db, 'groups', groupId));
      
      // Update local state
      setGroups(groups.filter(g => g.id !== groupId));
      setStudents(students.map(s => 
        s.groupId === groupId ? { ...s, groupId: null } : s
      ));

      toast.success('Group deleted successfully');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      await fetchGroupsWithReviews(); // Refresh the data
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const getUnassignedStudents = () => {
    return students.filter(student => !student.groupId);
  };

  // Add search and sort functions
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.fullName?.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });
  }, [students, searchTerm, sortOrder]);

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      // First delete all reviews by this student
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('reviewerId', '==', studentId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const deleteReviewPromises = reviewsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteReviewPromises);

      // Delete the user document from Firestore
      await deleteDoc(doc(db, 'users', studentId));
      
      // Try to delete the auth user if possible
      try {
        const auth = getAuth();
        // Note: This will only work if the user is recently authenticated
        // In a production app, you might want to use Admin SDK for this
        const user = auth.currentUser;
        if (user && user.uid === studentId) {
          await deleteUser(user);
        }
      } catch (authError) {
        console.error('Error deleting auth user:', authError);
        // Continue with the operation even if auth deletion fails
        // You might want to handle this differently in production
      }
      
      // Update local state
      setStudents(students.filter(student => student.id !== studentId));
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  if (loading) return <Loading />;

  return (
    <motion.div 
      className="p-6 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h2 className="text-2xl font-bold mb-6">Teacher Dashboard</h2>
      
      {/* Groups Section */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Groups
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            Create New Group
          </motion.button>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {/* Unassigned Students Card */}
          <motion.div 
            variants={itemVariants}
            className="border p-6 rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-700">{UNASSIGNED_GROUP.name}</h4>
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                {getUnassignedStudents().length} students
              </span>
            </div>
            <div className="mt-4">
              {getUnassignedStudents().map(student => (
                <div key={student.id} className="text-sm text-gray-600 py-1">
                  {student.fullName || student.email}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Regular Groups */}
          <AnimatePresence>
            {groups.map(group => (
              <motion.div
                key={group.id}
                variants={itemVariants}
                layout
                className="border p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-all duration-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{group.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedGroupReviews(group)}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      View Reviews
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Participation</p>
                    <p>{group.averageParticipation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Punctuality</p>
                    <p>{group.averagePunctuality || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Teamwork</p>
                    <p>{group.averageTeamwork || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Members: {students.filter(s => s.groupId === group.id).length}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Student Assignment Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-xl font-semibold mb-4">Assign Students to Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Select Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Choose a group...</option>
              <option value="unassigned" className="font-medium text-yellow-600">
                ⚠️ Remove from group
              </option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleAssignStudent}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={!selectedStudent || !selectedGroup}
        >
          Assign Student to Group
        </button>
      </motion.div>

      {/* Student List Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student List
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Sort dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <motion.div 
          className="overflow-hidden rounded-xl border"
          variants={containerVariants}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Group
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {student.fullName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {student.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {groups.find(g => g.id === student.groupId)?.name || (
                      <span className="text-yellow-600">Not Assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.groupId 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.groupId ? 'Assigned' : 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteStudent(student.id, student.fullName)}
                      className="text-red-600 hover:text-red-900 focus:outline-none"
                    >
                      <svg 
                        className="h-5 w-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      {selectedGroupReviews && (
        <ReviewList
          group={selectedGroupReviews}
          onClose={() => setSelectedGroupReviews(null)}
          onDeleteReview={handleDeleteReview}
        />
      )}
    </motion.div>
  );
}