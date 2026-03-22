import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Navbar(){

  const { isLoggedIn, logout } = useUser();

  return(
    <nav className="navbar navbar-dark bg-dark px-4">
      <h3 className="text-white">🛒 MyStore</h3>

      <div>

        {isLoggedIn && (
          <>
            <Link to="/products" className="btn btn-outline-light me-2">
              Products
            </Link>

            <Link to="/cart" className="btn btn-outline-light me-2">
              Cart
            </Link>

            <Link to="/orders" className="btn btn-outline-light me-2">
              Orders
            </Link>

            <Link to="/profile" className="btn btn-outline-light me-2">
              Profile
            </Link>
          </>
        )}

        {!isLoggedIn ? (
          <Link to="/" className="btn btn-outline-light">
            Login
          </Link>
        ) : (
          <button
            className="btn btn-danger"
            onClick={logout}
          >
            Logout
          </button>
        )}

      </div>
    </nav>
  );
}

export default Navbar;