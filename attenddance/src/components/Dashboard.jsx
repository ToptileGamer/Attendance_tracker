import React, { useState, useEffect } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import ClassCard from './ClassCard';
import AIInsights from './AIInsights';
import { Calendar } from 'lucide-react';

const Dashboard = () => {
  const { markAttendance, timetable, history } = useAttendance();
  const [selectedDay, setSelectedDay] = useState('MON');
  const [currentDateKey, setCurrentDateKey] = useState('');

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  useEffect(() => {
    const date = new Date();
    const localDateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    handleDateChange(localDateStr);
  }, []);

  const handleDateChange = (dateString) => {
    if (!dateString) return;
    setCurrentDateKey(dateString);
    
    // Javascript creates dates at UTC 00:00 when parsing 'YYYY-MM-DD', 
    // so we need to properly extract the local weekday.
    const [year, month, day] = dateString.split('-');
    const dateObj = new Date(year, month - 1, day);
    const dayIndex = dateObj.getDay(); // 0 = Sun, 1 = Mon
    
    let targetDay = 'MON';
    if (dayIndex >= 1 && dayIndex <= 6) {
      targetDay = days[dayIndex - 1];
    }
    setSelectedDay(targetDay);
  };

  const currentSchedule = timetable.schedule[selectedDay] || [];

  return (
    <div className="main-grid">
      <div className="schedule-section">
        <div className="glass-panel">
          <div className="header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="header-title">
              <Calendar size={28} color="var(--accent-color)" />
              Daily Schedule
            </h2>
            <div className="date-picker-wrapper">
               <input 
                 type="date" 
                 className="premium-date-picker" 
                 value={currentDateKey}
                 onChange={(e) => handleDateChange(e.target.value)}
                 required
               />
            </div>
          </div>
          
          <div className="day-selector">
            {days.map(day => (
              <div
                key={day}
                className={`day-pill ${selectedDay === day ? 'active' : ''}`}
                style={{ cursor: 'default' }}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="schedule-list">
            {currentSchedule.length === 0 ? (
              <p>No classes scheduled for {selectedDay}.</p>
            ) : (
              currentSchedule.map(period => {
                const record = history.find(h => h.date === currentDateKey && h.periodId === period.id);
                const status = record ? record.status : null;
                
                return (
                  <ClassCard
                    key={period.id}
                    period={period}
                    status={status}
                    date={currentDateKey}
                    onMark={(newStatus) => markAttendance(currentDateKey, period.subject, period.id, newStatus)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="insights-section">
        <AIInsights />
      </div>
    </div>
  );
};

export default Dashboard;
