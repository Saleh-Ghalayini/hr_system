import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";

const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await dashboardService.getEnrollments();
        console.log('Enrollments API Response:', response);
        
        if (Array.isArray(response)) {
          setEnrollments(response);
        } else if (response && response.data) {
          if (Array.isArray(response.data)) {
            setEnrollments(response.data);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setEnrollments(response.data.data);
          } else {
            console.error('Unexpected enrollments response structure:', response);
            setError(new Error('Invalid enrollments response structure'));
            setEnrollments([]);
          }
        } else {
          console.error('No valid enrollments data in response:', response);
          setError(new Error('No valid enrollments data received'));
          setEnrollments([]);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setError(error);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return [enrollments, loading, error];
};

export default useEnrollments; 