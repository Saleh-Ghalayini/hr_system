import { useEffect, useState } from "react";
import { request } from "../common/request";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await request({
          method: "GET",
          path: "admin/getallusers",
        });
        
        // Log the full response for debugging
        console.log('API Response:', response);
        
        // Check if response is an array
        if (Array.isArray(response)) {
          setUsers(response);
        } 
        // If response has a data property
        else if (response && response.data) {
          if (Array.isArray(response.data)) {
            setUsers(response.data);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setUsers(response.data.data);
          } else {
            console.error('Unexpected response structure:', response);
            setError(new Error('Invalid response structure'));
            setUsers([]);
          }
        } else {
          console.error('No valid data in response:', response);
          setError(new Error('No valid data received'));
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return [users, loading, error];
};

export default useUsers;
