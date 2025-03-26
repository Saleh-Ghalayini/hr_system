import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";

const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await dashboardService.getCourses();
        console.log('Courses API Response:', response);
        
        if (Array.isArray(response)) {
          setCourses(response);
        } else if (response && response.data) {
          if (Array.isArray(response.data)) {
            setCourses(response.data);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setCourses(response.data.data);
          } else {
            console.error('Unexpected courses response structure:', response);
            setError(new Error('Invalid courses response structure'));
            setCourses([]);
          }
        } else {
          console.error('No valid courses data in response:', response);
          setError(new Error('No valid courses data received'));
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error);
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