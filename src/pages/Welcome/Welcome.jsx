import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";
import logo from "../../assets/logo2.png";

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <img
          src={logo}
          alt="Margalla Travels"
          className="welcome-logo"
        />

        <h1>Management System</h1>

        <div className="loading">
          <span className="loading-spinner"></span>
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;