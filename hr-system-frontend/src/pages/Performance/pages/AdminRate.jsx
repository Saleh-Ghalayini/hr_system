import Input from "../../../components/Input";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { toast } from "react-toastify";

const AdminRate = () => {
  const [comment, setComment] = useState("");
  const [users, setUsers] = useState([]);
  const [rateValue, setValue] = useState({
    teamwork: 5,
    communication: 5,
    problemhandling: 5,
    collaboration: 5,
    creativity: 5,
    reliability: 5,
  });
  const [userid, setUserId] = useState(null);

  const rateEmploye = async (userID) => {
    try {
      const response = await request({
        method: "POST",
        path: "performance/rate-employee",
        data: {
          user_id: userID,
          type_ids: [1, 2, 3, 4, 5, 6],
          rate: [
            rateValue.teamwork,
            rateValue.communication,
            rateValue.problemhandling,
            rateValue.collaboration,
            rateValue.creativity,
            rateValue.reliability,
          ],
          comment: comment,
        },
      });
      if (response.success) {
        toast.success("Employee rated successfully!");
        setUserId(null);
        setComment("");
      }
    } catch (error) {
      toast.error("Failed to submit rating.");
    }
  };

  const getUsers = async () => {
    try {
      const response = await request({
        method: "GET",
        path: "admin/users",
      });
      setUsers(Array.isArray(response.data) ? response.data : (response.data?.data ?? []));
    } catch {
      toast.error("Failed to load users.");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="users-container flex flex-dir-row p-1">
      <div className="users-container">
        {users.map((user) => (
          <div key={user.id} className="user-border">
            <div
              className="user flex flex-dir-row align-center"
              onClick={() => {
                const next = userid === user.id ? null : user.id;
                setUserId(next);
                if (next !== null) {
                  setValue({ teamwork: 5, communication: 5, problemhandling: 5, collaboration: 5, creativity: 5, reliability: 5 });
                  setComment("");
                }
              }}
            >
              <div className="user-image">
                <img src="/logo.png" alt="User avatar" />
              </div>
              <div className="name">
                {user.first_name} {user.last_name}
              </div>
              <div className="position">{user.position}</div>
              <div className="email">{user.email}</div>
            </div>
            <div
              className={`performance-form flex flex-dir-row flex-wrap ${
                userid === user.id ? "" : "display-none"
              }`}
            >
              <Input
                label={"Team Work"}
                type={"number"}
                value={rateValue.teamwork}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  setValue({ ...rateValue, teamwork: val });
                }}
                placeholder={"Rate 1~10"}
              />
              <Input
                label={"Communication"}
                type={"number"}
                value={rateValue.communication}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  setValue({ ...rateValue, communication: val });
                }}
                placeholder={"Rate 1~10"}
              />
              <Input
                label={"Problem Handling"}
                type={"number"}
                value={rateValue.problemhandling}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  setValue({ ...rateValue, problemhandling: val });
                }}
                placeholder={"Rate 1~10"}
              />
              <Input
                label={"Collaboration"}
                type={"number"}
                value={rateValue.collaboration}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  setValue({ ...rateValue, collaboration: val });
                }}
                placeholder={"Rate 1~10"}
              />
              <Input
                label={"Creativity"}
                type={"number"}
                value={rateValue.creativity}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  setValue({ ...rateValue, creativity: val });
                }}
                placeholder={"Rate 1~10"}
              />
              <Input
                label={"Reliability"}
                type={"number"}
                value={rateValue.reliability}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  setValue({ ...rateValue, reliability: val });
                }}
                placeholder={"Rate 1~10"}
              />
              <Input
                label={"Comment"}
                type={"text"}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={"Add a comment"}
              />
            </div>
            <Button
              className={`btn ${userid === user.id ? "" : "display-none"}`}
              text={"Rate"}
              onClick={() => rateEmploye(user.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRate;
