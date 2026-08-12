import { useAuth } from "../../context/AuthContext";

function DriverDashboard() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Driver Dashboard</h1>

      <p>Welcome to the Margalla Travels Driver Dashboard.</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default DriverDashboard;