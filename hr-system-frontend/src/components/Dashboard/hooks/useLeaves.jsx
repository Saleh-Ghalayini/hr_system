import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

const useLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const data = await dashboardService.getLeaveRequests();
        setLeaves(data);
      } catch (err) {
        setError(err);
        console.error('Error fetching leaves:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  return [leaves, loading, error];
};

export default useLeaves; 