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
          path: "admin/users",
        });
        const list = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
        setUsers(list);
      } catch (err) {
        setError(err);
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
