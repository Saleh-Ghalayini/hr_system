import Input from "../../../components/Input";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
const AdminRate = () => {
  const [comment, setComment] = useState("");
  const [users, setUsers] = useState([]);
  const [rateValue, setValue] = useState({
    teamwork: 5,
    comunication: 5,
    problemhandling: 5,
    collaboration: 5,
    creativity: 5,
    reliability: 5,
  });
  const [userid, setUserId] = useState(null);
  const rateEmploye = async (userID) => {
    const token = localStorage.getItem("token");
    const response = await request({
      method: "POST",
      path: "admin/rateemployee",
      data: {
        user_id: userID,
        type_ids: [1, 2, 3, 4, 5, 6],
        rate: [
          rateValue.teamwork,
          rateValue.comunication,
          rateValue.problemhandling,
          rateValue.collaboration,
          rateValue.creativity,
          rateValue.reliability,
        ],
        comment: comment,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.success) {
      console.log(response);
    }
  };
  const getUsers = async () => {
    const token = localStorage.getItem("token");
    const response = await request({
      method: "GET",
      path: "admin/getallusers",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUsers(response);
    console.log(response);
  };
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="users-container flex flex-dir-row p-1">
      <div className="users-container">
        {users.map((user) => {
          return (
            <>
              <div className="user-border">
                <div
                  className="user flex flex-dir-row align-center "
                  onClick={() => {
                    setUserId(userid == user.id ? null : user.id);
                  }}
                >
                  <div className="user-image">
                    <img src="/logo.png" alt="" />
                  </div>
                  <div className="name">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="position">{user.position}</div>
                  <div className="email">{user.email}</div>
                  <div className="phone-number">{user.phone_number}</div>
                </div>
                <div
                  className={`performance-form flex flex-dir-row flex-wrap ${
                    userid == user.id ? "" : "display-none"
                  }`}
                >
                  <Input
                    label={"Team Work"}
                    type={"number"}
                    value={rateValue.teamwork}
                    onChange={(e) => {
                      e.target.value > 10
                        ? (e.target.value = 10)
                        : e.target.value;
                      setValue({
                        ...rateValue,
                        teamwork: e.target.value,
                      });
                    }}
                    placeholder={"Rate 1~10"}
                  />
                  <Input
                    label={"Communication"}
                    type={"number"}
                    value={rateValue.comunication}
                    onChange={(e) => {
                      e.target.value > 10
                        ? (e.target.value = 10)
                        : e.target.value;
                      setValue({
                        ...rateValue,
                        comunication: e.target.value,
                      });
                    }}
                    placeholder={"Rate 1~10"}
                  />
                  <Input
                    label={"Problem Handiling"}
                    type={"number"}
                    value={rateValue.problemhandling}
                    onChange={(e) => {
                      e.target.value > 10
                        ? (e.target.value = 10)
                        : e.target.value;
                      setValue({
                        ...rateValue,
                        problemhandling: e.target.value,
                      });
                    }}
                    placeholder={"Rate 1~10"}
                  />
                  <Input
                    label={"Collaboration"}
                    type={"number"}
                    value={rateValue.collaboration}
                    onChange={(e) => {
                      e.target.value > 10
                        ? (e.target.value = 10)
                        : e.target.value;
                      setValue({
                        ...rateValue,
                        collaboration: e.target.value,
                      });
                    }}
                    placeholder={"Rate 1~10"}
                  />
                  <Input
                    label={"Creativity"}
                    type={"number"}
                    value={rateValue.creativity}
                    onChange={(e) => {
                      e.target.value > 10
                        ? (e.target.value = 10)
                        : e.target.value;
                      setValue({
                        ...rateValue,
                        creativity: e.target.value,
                      });
                    }}
                    placeholder={"Rate 1~10"}
                  />
                  <Input
                    label={"Reliability"}
                    type={"number"}
                    value={rateValue.reliability}
                    onChange={(e) => {
                      e.target.value > 10
                        ? (e.target.value = 10)
                        : e.target.value;
                      setValue({
                        ...rateValue,
                        reliability: e.target.value,
                      });
                    }}
                    placeholder={"Rate 1~10"}
                  />
                  <Input
                    label={"Comment"}
                    type={"text"}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                    }}
                    placeholder={"Add you comment"}
                  />
                </div>
                <Button
                  className={`btn ${userid == user.id ? "" : "display-none"}`}
                  text={"Rate"}
                  onClick={() => {
                    rateEmploye(user.id);
                  }}
                />
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
};

export default AdminRate;
