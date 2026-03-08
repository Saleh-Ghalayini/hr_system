import { useEffect, useState } from "react";
import { request } from "../common/request";

const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await request({
          method: "GET",
          path: "admin/courses",
        });
        setCourses(Array.isArray(response.data) ? response.data : []);
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
