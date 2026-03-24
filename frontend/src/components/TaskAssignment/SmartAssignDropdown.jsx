import React from 'react';
import { 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ChevronDown,
  Info
} from 'lucide-react';
import './SmartAssignDropdown.css';

const SmartAssignDropdown = ({ workers, onSelect, currentSelected }) => (
  <div className="smart-dropdown-wrapper">
    <div className="dropdown-label">
      Assign To <span className="smart-tag">Powered by Balancer</span>
    </div>
    <div className="worker-list-grid">
      {workers.map(worker => {
        const isSelected = currentSelected === worker.id;
        return (
          <div 
            key={worker.id} 
            className={`worker-select-card ${isSelected ? 'selected' : ''} ${worker.isOverloaded ? 'overloaded' : ''}`}
            onClick={() => onSelect(worker)}
          >
            <div className="worker-header">
              <div className="worker-initials">
                {worker.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="worker-name-info">
                <span className="worker-name">{worker.name}</span>
                <span className="worker-subtext">{worker.activeTaskCount} tasks active</span>
              </div>
              {worker.isRecommended && (
                <div className="recommend-badge" title="High Availability">
                  <CheckCircle size={14} /> Recommended
                </div>
              )}
              {worker.isOverloaded && (
                <div className="warning-badge" title="Worker is Overloaded">
                  <AlertTriangle size={14} />
                </div>
              )}
            </div>
            
            <div className="score-viz-wrapper">
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${worker.availabilityScore}%`,
                    backgroundColor: worker.availabilityScore > 70 ? '#10b981' : worker.availabilityScore > 40 ? '#f59e0b' : '#ef4444'
                  }}
                ></div>
              </div>
              <span className="score-text">{worker.availabilityScore}% Fit</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default SmartAssignDropdown;
