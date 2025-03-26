// src/components/review/ReviewSummary.jsx
import React from 'react';

export default function ReviewSummary({ reviews }) {
  const calculateAverages = () => {
    if (!reviews.length) return null;
    
    const totals = reviews.reduce((acc, review) => ({
      qualityOfContribution: acc.qualityOfContribution + review.qualityOfContribution,
      levelOfParticipation: acc.levelOfParticipation + review.levelOfParticipation,
      collaboration: acc.collaboration + review.collaboration,
      overallContribution: acc.overallContribution + review.overallContribution
    }), { 
      qualityOfContribution: 0, 
      levelOfParticipation: 0,
      collaboration: 0,
      overallContribution: 0
    });

    return {
      qualityOfContribution: (totals.qualityOfContribution / reviews.length).toFixed(1),
      levelOfParticipation: (totals.levelOfParticipation / reviews.length).toFixed(1),
      collaboration: (totals.collaboration / reviews.length).toFixed(1),
      overallContribution: (totals.overallContribution / reviews.length).toFixed(1)
    };
  };

  const getAttendanceStats = () => {
    if (!reviews.length) return null;
    
    const attendanceCounts = reviews.reduce((acc, review) => {
      acc[review.attendance] = (acc[review.attendance] || 0) + 1;
      return acc;
    }, {});

    return {
      present: attendanceCounts.yes || 0,
      absent: attendanceCounts.no || 0,
      total: reviews.length
    };
  };

  const getPunctualityStats = () => {
    if (!reviews.length) return null;
    
    const punctualityCounts = reviews.reduce((acc, review) => {
      acc[review.punctuality] = (acc[review.punctuality] || 0) + 1;
      return acc;
    }, {});

    return {
      punctual: punctualityCounts.yes || 0,
      unpunctual: punctualityCounts.no || 0,
      total: reviews.length
    };
  };

  const getEnvironmentStats = () => {
    if (!reviews.length) return null;
    
    const environmentCounts = reviews.reduce((acc, review) => {
      acc[review.environment] = (acc[review.environment] || 0) + 1;
      return acc;
    }, {});

    return environmentCounts;
  };

  const averages = calculateAverages();
  const attendanceStats = getAttendanceStats();
  const punctualityStats = getPunctualityStats();
  const environmentStats = getEnvironmentStats();

  if (!averages) return <p>No reviews available</p>;

  const environmentLabels = {
    very_conducive: 'Very Conducive',
    conducive: 'Conducive',
    ok: 'OK',
    distractive: 'Distractive',
    noisy_background: 'Noisy Background'
  };

  return (
    <div className="space-y-6">
      {/* Attendance and Punctuality Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">Attendance</h4>
          <div className="space-y-1">
            <p>Present: {attendanceStats.present}</p>
            <p>Absent: {attendanceStats.absent}</p>
            <p>Total Reviews: {attendanceStats.total}</p>
          </div>
        </div>
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">Punctuality</h4>
          <div className="space-y-1">
            <p>Punctual: {punctualityStats.punctual}</p>
            <p>Unpunctual: {punctualityStats.unpunctual}</p>
            <p>Total Reviews: {punctualityStats.total}</p>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded text-center">
          <h4 className="font-medium">Quality of Contribution</h4>
          <p className="text-2xl">{averages.qualityOfContribution}</p>
        </div>
        <div className="p-4 border rounded text-center">
          <h4 className="font-medium">Level of Participation</h4>
          <p className="text-2xl">{averages.levelOfParticipation}</p>
        </div>
        <div className="p-4 border rounded text-center">
          <h4 className="font-medium">Collaboration</h4>
          <p className="text-2xl">{averages.collaboration}</p>
        </div>
        <div className="p-4 border rounded text-center">
          <h4 className="font-medium">Overall Performance</h4>
          <p className="text-2xl">{averages.overallContribution}</p>
        </div>
      </div>

      {/* Learning Environment */}
      <div className="p-4 border rounded">
        <h4 className="font-medium mb-2">Learning Environment</h4>
        <div className="space-y-2">
          {Object.entries(environmentStats).map(([key, count]) => (
            <div key={key} className="flex justify-between items-center">
              <span>{environmentLabels[key]}</span>
              <span className="text-gray-600">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Areas for Improvement */}
      <div className="p-4 border rounded">
        <h4 className="font-medium mb-2">Areas for Improvement</h4>
        <div className="space-y-2">
          {reviews
            .filter(review => review.areasForImprovement)
            .slice(0, 5)
            .map((review, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <p className="text-sm">{review.areasForImprovement}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.timestamp.toDate()).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Suggestions for Future Sessions */}
      <div className="p-4 border rounded">
        <h4 className="font-medium mb-2">Suggestions for Future Sessions</h4>
        <div className="space-y-2">
          {reviews
            .filter(review => review.suggestions)
            .slice(0, 5)
            .map((review, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <p className="text-sm">{review.suggestions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.timestamp.toDate()).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Additional Feedback */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">Additional Feedback</h4>
        <div className="space-y-2">
          {reviews
            .filter(review => review.feedback)
            .slice(0, 5)
            .map((review, index) => (
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