import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

const useAttendance = () => {
  const [today, setToday] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [todayData, trendData] = await Promise.all([
          dashboardService.getAttendanceToday(),
          dashboardService.getAttendanceTrend(),
        ]);
        setToday(Array.isArray(todayData) ? todayData : []);
        setTrend(Array.isArray(trendData) ? trendData : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return [today, trend, loading, error];
};

export default useAttendance;
