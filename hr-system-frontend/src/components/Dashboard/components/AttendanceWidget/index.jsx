import React from 'react';
import './style.css';

const AttendanceWidget = ({ attendanceToday, totalEmployees }) => {
  const present  = attendanceToday.length;
  const onTime   = attendanceToday.filter(a => a?.time_in_status === 'On-time').length;
  const late     = attendanceToday.filter(a => a?.time_in_status === 'Late').length;
  const absent   = Math.max(0, totalEmployees - present);
  const rate     = totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0;

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="att-widget">
      <div className="att-widget-header">
        <div>
          <h3 className="att-widget-title">Today's Attendance</h3>
          <p className="att-widget-date">{today}</p>
        </div>
        <div className="att-rate-badge" style={{ '--rate-color': rate >= 80 ? '#069855' : rate >= 60 ? '#d39c1d' : '#d62525' }}>
          {rate}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="att-progress-track">
        <div className="att-progress-fill att-fill-ontime"  style={{ width: `${totalEmployees > 0 ? (onTime  / totalEmployees) * 100 : 0}%` }} />
        <div className="att-progress-fill att-fill-late"    style={{ width: `${totalEmployees > 0 ? (late   / totalEmployees) * 100 : 0}%` }} />
        <div className="att-progress-fill att-fill-absent"  style={{ width: `${totalEmployees > 0 ? (absent / totalEmployees) * 100 : 0}%` }} />
      </div>

      {/* Stats row */}
      <div className="att-stats">
        <div className="att-stat">
          <div className="att-stat-dot" style={{ background: '#069855' }} />
          <div>
            <div className="att-stat-num">{onTime}</div>
            <div className="att-stat-lbl">On-time</div>
          </div>
        </div>
        <div className="att-stat">
          <div className="att-stat-dot" style={{ background: '#d39c1d' }} />
          <div>
            <div className="att-stat-num">{late}</div>
            <div className="att-stat-lbl">Late</div>
          </div>
        </div>
        <div className="att-stat">
          <div className="att-stat-dot" style={{ background: '#d62525' }} />
          <div>
            <div className="att-stat-num">{absent}</div>
            <div className="att-stat-lbl">Absent</div>
          </div>
        </div>
        <div className="att-stat">
          <div className="att-stat-dot" style={{ background: '#142f5a' }} />
          <div>
            <div className="att-stat-num">{totalEmployees}</div>
            <div className="att-stat-lbl">Total</div>
          </div>
        </div>
      </div>

      {/* Mini employee list (first 6 present) */}
      {attendanceToday.length > 0 && (
        <div className="att-who">
          <p className="att-who-label">Checked in</p>
          <div className="att-avatars">
            {attendanceToday.slice(0, 7).map((a, i) => {
              const initials = (a.full_name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
              const isLate = a.time_in_status === 'Late';
              return (
                <div
                  key={i}
                  className="att-avatar"
                  title={`${a.full_name} · ${a.check_in ?? '?'} · ${a.time_in_status ?? ''}`}
                  style={{ background: isLate ? '#fef3c7' : '#e6f5ee', color: isLate ? '#92400e' : '#065f46' }}
                >
                  {initials}
                </div>
              );
            })}
            {attendanceToday.length > 7 && (
              <div className="att-avatar att-avatar-more">+{attendanceToday.length - 7}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceWidget;
