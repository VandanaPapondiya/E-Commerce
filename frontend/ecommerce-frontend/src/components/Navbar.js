import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Navbar() {

  const navigate = useNavigate();
  const { isLoggedIn, logout, isAdmin, username } = useUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4 py-2">
      <Link to={isLoggedIn ? "/products" : "/"} className="navbar-brand text-white fw-bold fs-5">
        🛒 MyStore
      </Link>

      <div className="d-flex align-items-center gap-2 flex-wrap">

        {isLoggedIn && (
          <>
            <Link to="/products" className="btn btn-outline-light btn-sm">
              Products
            </Link>

            <Link to="/cart" className="btn btn-outline-light btn-sm">
              🛒 Cart
            </Link>

            <Link to="/wishlist" className="btn btn-outline-light btn-sm">
              ♥ Wishlist
            </Link>

            <Link to="/orders" className="btn btn-outline-light btn-sm">
              📦 Orders
            </Link>

            <Link to="/profile" className="btn btn-outline-light btn-sm">
              👤 Profile
            </Link>

            {isAdmin && isAdmin() && (
              <Link to="/admin" className="btn btn-warning btn-sm fw-bold">
                ⚙️ Admin
              </Link>
            )}
          </>
        )}

        {!isLoggedIn ? (
          <Link to="/" className="btn btn-outline-light btn-sm">
            Login
          </Link>
        ) : (
          <div className="d-flex align-items-center gap-2">
            {username && (
              <span className="text-white-50 small">Hi, {username}</span>
            )}
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;