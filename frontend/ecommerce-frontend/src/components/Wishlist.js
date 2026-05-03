import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";

function Wishlist() {
  const navigate = useNavigate();
  const { userId } = useUser();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!userId) { navigate("/"); return; }
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchWishlist = () => {
    axios.get(`http://localhost:8080/api/wishlist/${userId}`)
      .then(res => {
        setWishlist(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load wishlist.");
        setLoading(false);
      });
  };

  const removeFromWishlist = (productId) => {
    axios.delete(`http://localhost:8080/api/wishlist/remove?userId=${userId}&productId=${productId}`)
      .then(() => {
        setWishlist(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
        }));
        setSuccess("Removed from wishlist.");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(() => setError("Failed to remove from wishlist."));
  };

  const addToCart = (productId) => {
    axios.post(`http://localhost:8080/api/cart/add?userId=${userId}&productId=${productId}&quantity=1`)
      .then(() => {
        setSuccess("Added to cart!");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(err => setError(err.response?.data?.message || "Failed to add to cart."));
  };

  if (loading) return <div className="container mt-5"><h3>Loading wishlist...</h3></div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">♥ My Wishlist</h2>

      {error && <ErrorMessage message={error} type="danger" onClose={() => setError("")} />}
      {success && <ErrorMessage message={success} type="success" onClose={() => setSuccess("")} autoClose />}

      {(!wishlist || !wishlist.products || wishlist.products.length === 0) ? (
        <div className="alert alert-info">
          Your wishlist is empty. <a href="/products">Browse Products</a>
        </div>
      ) : (
        <div className="row">
          {wishlist.products.map(product => (
            <div className="col-md-3 mb-4" key={product.id}>
              <div className="card shadow-sm h-100">

                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="card-img-top"
                    style={{ height: "160px", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center"
                       style={{ height: "160px", fontSize: "3rem" }}>🛒</div>
                )}

                <div className="card-body d-flex flex-column">
                  <h6 className="fw-bold">{product.name}</h6>
                  <p className="text-success fw-bold">₹{product.price}</p>
                  <p className="text-muted small flex-grow-1" style={{ maxHeight: "40px", overflow: "hidden" }}>
                    {product.description}
                  </p>
                  <div className="d-flex gap-1 mt-2">
                    <button
                      className="btn btn-primary btn-sm flex-grow-1"
                      onClick={() => addToCart(product.id)}
                      disabled={product.quantity === 0}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      👁
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromWishlist(product.id)}
                      title="Remove from wishlist"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
