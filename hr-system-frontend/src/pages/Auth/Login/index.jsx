import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import "./style.css";

const Login = () => {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="wrapper">
      <div className="container login">
      <h1 className="blue">Login</h1>

        <Input
          type="text"
          value={email}
          label="Email"
          className= "input-login label"
          placeholder="Example@gmail.com"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          value={password}
          label="Password"
          className= "input-login label"
          placeholder="User@134"
          onChange={(e) => setPassword(e.target.value)}
        />

      <div className="remember-forgot small-text">
        <div className="remember">
          <label className="blue"><input type="checkbox" className="checkbox" />Remember me</label>
        </div>
        <a className="blue" href="#">Forgot password?</a>
      </div>

      <Button className="login-btn" text="Log in" onClick={handleSubmit} />
    </div>
    </div>
  );
};

export default Login;
