import React from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const AIInsights = () => {
  const { attendance, getOverallPercentage, getPercentageForSubject, getBunkStatus, getPredictedAttendance } = useAttendance();

  const overall = getOverallPercentage();
  
  // Sort subjects to show at-risk ones first (lowest attendance)
  const subjects = Object.keys(attendance).sort((a, b) => {
    return getPercentageForSubject(a) - getPercentageForSubject(b);
  });

  return (
    <div className="ai-section">
      <div className="glass-panel">
        <div className="header">
          <h2 className="header-title">
            <Target size={28} color="var(--info-color)" />
            AI Insights
          </h2>
        </div>
        
        <div className="insight-card">
          <div className="insight-icon">
            <TrendingUp size={32} />
          </div>
          <div className="insight-content" style={{ flex: 1 }}>
            <h4>Overall Attendance</h4>
            <div className="huge-stat">{overall}%</div>
            
            <div className="progress-bar-container">
              <div 
                className={`progress-bar-fill ${overall < 75 ? 'danger' : ''}`} 
                style={{ width: `${overall}%` }}
              ></div>
            </div>
            
            <p style={{ marginTop: '1rem' }}>
              {overall >= 75 
                ? "You're on track! Keep it up to safely meet university requirements." 
                : "Warning: Your attendance is below the required 75%. Prioritize attending classes."}
            </p>
          </div>
        </div>
        
        <h3 style={{ marginTop: '2rem' }}>Subject Breakdown & Predictions</h3>
        <p>AI calculated safe-to-bunk margins to maintain 75% aggregate.</p>
        
        <div className="subjects-list">
          {subjects.length === 0 ? (
            <p>No subjects tracked yet.</p>
          ) : (
            subjects.map(sub => {
              const percent = getPercentageForSubject(sub);
              const { canBunk, needsToAttend } = getBunkStatus(sub);
              const predicted = getPredictedAttendance(sub, 10, 0.8); // predict based on next 10 classes at 80% attendance
              
              return (
                <div key={sub} className="subject-item">
                  <div className="subject-item-header">
                    <span className="subject-name" title={sub}>{sub.length > 15 ? sub.substring(0, 15) + '...' : sub}</span>
                    <span className="subject-percent" style={{ color: percent >= 75 ? 'var(--accent-color)' : 'var(--danger-color)' }}>
                      {percent}%
                    </span>
                  </div>
                  
                  <div style={{ marginTop: '0.5rem' }}>
                    {percent >= 75 ? (
                      <span className="safe-to-bunk-badge">
                        <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                        Safe to bunk: {canBunk}
                      </span>
                    ) : (
                      <span className="needs-attend-badge">
                        <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                        Need {needsToAttend} to reach 75%
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Predicted (next 10 classes): <strong>{predicted}%</strong>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
