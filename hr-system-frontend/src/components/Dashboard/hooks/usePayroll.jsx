import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

const usePayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await dashboardService.getPayroll();
        setPayroll(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return [payroll, loading, error];
};

export default usePayroll;
