import { useState, useEffect } from 'react';
import timetable from '../data/timetable.json';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

const initializeAttendance = () => {
  const initial = {};
  const ignoredSubjects = ['BREAK', 'LUNCH', 'LIBRARY', 'AICTE ACTIVITIES'];
  
  Object.values(timetable.schedule).forEach(daySchedule => {
    daySchedule.forEach(period => {
      const subject = period.subject;
      if (!ignoredSubjects.includes(subject) && !initial[subject]) {
        initial[subject] = { attended: 0, missed: 0, cancelled: 0 };
      }
    });
  });
  return initial;
};

export const useAttendance = () => {
  const { token, logout } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (!token) {
      setAttendance(null);
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/attendance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        if (!data.attendance || Object.keys(data.attendance).length === 0) {
          setAttendance(initializeAttendance());
          setHistory([]);
        } else {
          setAttendance(data.attendance);
          setHistory(data.history || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setAttendance(initializeAttendance());
        setLoading(false);
      });
  }, [token, logout]);

  // Sync to backend whenever history changes
  useEffect(() => {
    if (loading || !attendance || !token) return;

    fetch(`${API_BASE}/api/attendance`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ history }) // Simplified to only send history array for DB sync
    }).catch(err => console.error('Failed to sync changes:', err));
  }, [history, loading, token]);

  const markAttendance = (date, subject, periodId, status) => {
    if (loading || !attendance) return;

    const existingRecordIndex = history.findIndex(
      h => h.date === date && h.periodId === periodId && h.subject === subject
    );

    let previousStatus = null;
    let newHistory = [...history];

    if (existingRecordIndex >= 0) {
      previousStatus = newHistory[existingRecordIndex].status;
      if (previousStatus === status) return; 
      
      if (status) {
        newHistory[existingRecordIndex].status = status;
      } else {
        newHistory.splice(existingRecordIndex, 1);
      }
    } else {
      if (status) {
        newHistory.push({ date, subject, periodId, status });
      }
    }

    setHistory(newHistory);

    setAttendance(prev => {
      const updated = { ...prev };
      if (!updated[subject]) return prev;
      
      const subjectData = { ...updated[subject] };

      if (previousStatus && subjectData[previousStatus] !== undefined) {
        subjectData[previousStatus] = Math.max(0, subjectData[previousStatus] - 1);
      }
      if (status && subjectData[status] !== undefined) {
        subjectData[status] += 1;
      }
      
      updated[subject] = subjectData;
      return updated;
    });
  };

  const getPercentageForSubject = (subject) => {
    if (!attendance || !attendance[subject]) return 0;
    const { attended, missed } = attendance[subject];
    const total = attended + missed;
    return total === 0 ? 0 : Math.round((attended / total) * 100);
  };

  const getOverallPercentage = () => {
    if (!attendance) return 0;
    let totalAttended = 0;
    let totalMissed = 0;

    Object.values(attendance).forEach(data => {
      totalAttended += data.attended;
      totalMissed += data.missed;
    });

    const total = totalAttended + totalMissed;
    return total === 0 ? 0 : Math.round((totalAttended / total) * 100);
  };

  const getBunkStatus = (subject) => {
    if (!attendance || !attendance[subject]) return { canBunk: 0, needsToAttend: 0 };
    const { attended, missed } = attendance[subject];
    const target = 0.75;
    const currentTotal = attended + missed;
    if (currentTotal === 0) return { canBunk: 0, needsToAttend: 0 };

    let canBunk = Math.floor((attended / target) - currentTotal);
    let needsToAttend = Math.ceil((target * currentTotal - attended) / (1 - target));

    if (canBunk < 0) canBunk = 0;
    if (needsToAttend < 0) needsToAttend = 0;

    return { canBunk, needsToAttend };
  };

  const getPredictedAttendance = (subject, futureClasses = 10, attendRate = 0.8) => {
     if (!attendance || !attendance[subject]) return 0;
     const { attended, missed } = attendance[subject];
     const futureAttended = Math.round(futureClasses * attendRate);
     const total = attended + missed + futureClasses;
     return Math.round(((attended + futureAttended) / total) * 100);
  };

  return {
    attendance: attendance || {},
    history,
    loading,
    markAttendance,
    getPercentageForSubject,
    getOverallPercentage,
    getBunkStatus,
    getPredictedAttendance,
    timetable
  };
};
