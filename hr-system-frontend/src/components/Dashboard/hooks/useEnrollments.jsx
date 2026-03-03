import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";

const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await dashboardService.getEnrollments();
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err);
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