import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Loading from '../components/common/Loading';
import ReviewList from '../components/dashboard/ReviewList';

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

export default function AllGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupReviews, setSelectedGroupReviews] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch groups
        const groupsQuery = query(
          collection(db, 'groups'),
          orderBy('createdAt', 'desc')
        );
        const groupsSnapshot = await getDocs(groupsQuery);
        const groupsData = groupsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setGroups(groupsData);

        // Fetch students for counting group members
        const studentsQuery = query(collection(db, 'users'));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter groups based on search term
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort groups
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    
    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

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

  if (loading) return <Loading />;

  return (
    <motion.div
      className="p-6 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Groups</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Groups Grid */}
      {sortedGroups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No groups found</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {sortedGroups.map(group => (
            <motion.div
              key={group.id}
              variants={itemVariants}
              className="border p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg">{group.name}</h3>
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
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <p className="font-medium">Created</p>
                  <p>{new Date(group.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Members</p>
                  <p>{students.filter(s => s.groupId === group.id).length}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Review Modal */}
      {selectedGroupReviews && (
        <ReviewList
          group={selectedGroupReviews}
          onClose={() => setSelectedGroupReviews(null)}
        />
      )}
    </motion.div>
  );
} 