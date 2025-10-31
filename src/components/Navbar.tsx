import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg app-navbar navbar-dark">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">User Manager</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="small opacity-75">{user?.name}</span>
                <button className="btn btn-light btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className="btn btn-light btn-sm" to="/login">Login</NavLink>
                <NavLink className="btn btn-gradient btn-sm" to="/register">Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
