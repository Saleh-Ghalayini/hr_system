import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";

const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await dashboardService.getCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return [courses, loading, error];
};

export default useCourses; 