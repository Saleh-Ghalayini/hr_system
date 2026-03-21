import { useState, useEffect } from 'react';
import { request } from '../../../common/request';

const useDashboardSummary = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request({ method: 'GET', path: 'admin/dashboard/summary' });
        if (response?.success) {
          setData(response.data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return [data, loading, error];
};

export default useDashboardSummary;
