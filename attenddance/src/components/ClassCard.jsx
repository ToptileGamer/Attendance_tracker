import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const ClassCard = ({ period, status, onMark }) => {
  const isIgnored = ['BREAK', 'LUNCH', 'LIBRARY', 'AICTE ACTIVITIES'].includes(period.subject);
  
  if (isIgnored) {
    return (
      <div className="class-card">
        <div className="class-info">
          <span className="class-time">{period.time}</span>
          <span className="class-subject" style={{ color: 'var(--text-secondary)' }}>{period.subject}</span>
          {period.type && <span className="class-type">{period.type}</span>}
        </div>
      </div>
    );
  }

  const handleMark = (newStatus) => {
    // Toggle off if same status clicked
    if (status === newStatus) {
      onMark(null);
    } else {
      onMark(newStatus);
    }
  };

  return (
    <div className={`class-card ${status ? `period-${status}` : ''}`}>
      <div className="class-info">
        <span className="class-time">{period.time}</span>
        <span className="class-subject">{period.subject}</span>
        <span className="class-type">{period.type}</span>
      </div>
      
      <div className="class-actions">
        <button 
          className={`btn btn-icon btn-attend ${status === 'attended' ? 'active' : ''}`}
          onClick={() => handleMark('attended')}
          title="Attended"
        >
          <CheckCircle2 size={20} />
        </button>
        <button 
          className={`btn btn-icon btn-miss ${status === 'missed' ? 'active' : ''}`}
          onClick={() => handleMark('missed')}
          title="Missed"
        >
          <XCircle size={20} />
        </button>
        <button 
          className={`btn btn-icon btn-cancel ${status === 'cancelled' ? 'active' : ''}`}
          onClick={() => handleMark('cancelled')}
          title="Cancelled / Holiday"
        >
          <AlertCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default ClassCard;
