// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import Loading from '../components/common/Loading';

export default function Dashboard() {
  const { userRole, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
     
      <div className="pt-6">
        {userRole === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      </div>
    </div>
  );
}