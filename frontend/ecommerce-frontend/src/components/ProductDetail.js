import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";

function StarRating({ rating, interactive = false, onSelect }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            color: star <= Math.round(rating) ? "#f5a623" : "#ccc",
            fontSize: "1.3rem",
            cursor: interactive ? "pointer" : "default"
          }}
          onClick={() => interactive && onSelect && onSelect(star)}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, username } = useUser();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Review form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Wishlist
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    // Track recently viewed
    if (product) {
      try {
        const key = "recentlyViewed";
        let rv = JSON.parse(localStorage.getItem(key) || "[]");
        rv = rv.filter(p => p.id !== product.id);
        rv.unshift({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
        rv = rv.slice(0, 6);
        localStorage.setItem(key, JSON.stringify(rv));
      } catch {}
    }
  }, [product]);

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:8080/api/products/${id}`),
      axios.get(`http://localhost:8080/api/reviews/product/${id}`)
    ])
      .then(([productRes, reviewsRes]) => {
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product details.");
        setLoading(false);
      });

    // Check wishlist
    if (userId) {
      axios.get(`http://localhost:8080/api/wishlist/${userId}`)
        .then(res => {
          const ids = (res.data.products || []).map(p => p.id);
          setInWishlist(ids.includes(Number(id)));
        })
        .catch(() => {});
    }
  }, [id, userId]);

  const addToCart = () => {
    if (!userId) { navigate("/"); return; }
    axios.post(`http://localhost:8080/api/cart/add?userId=${userId}&productId=${id}&quantity=1`)
      .then(() => {
        setSuccess("Added to cart!");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(err => setError(err.response?.data?.message || "Failed to add to cart."));
  };

  const toggleWishlist = () => {
    if (!userId) { navigate("/"); return; }
    if (inWishlist) {
      axios.delete(`http://localhost:8080/api/wishlist/remove?userId=${userId}&productId=${id}`)
        .then(() => setInWishlist(false))
        .catch(() => setError("Failed to update wishlist."));
    } else {
      axios.post(`http://localhost:8080/api/wishlist/add?userId=${userId}&productId=${id}`)
        .then(() => {
          setInWishlist(true);
          setSuccess("Added to wishlist!");
          setTimeout(() => setSuccess(""), 2000);
        })
        .catch(() => setError("Failed to update wishlist."));
    }
  };

  const submitReview = () => {
    if (!userId) { navigate("/"); return; }
    if (!newComment.trim()) { setError("Please write a comment."); return; }

    setSubmittingReview(true);
    axios.post("http://localhost:8080/api/reviews/add", {
      userId,
      username: username || "User",
      productId: Number(id),
      rating: newRating,
      comment: newComment.trim()
    })
      .then(res => {
        setReviews(prev => [res.data, ...prev]);
        setNewComment("");
        setNewRating(5);
        setSuccess("Review submitted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        // Refresh product to get updated rating
        axios.get(`http://localhost:8080/api/products/${id}`)
          .then(r => setProduct(r.data))
          .catch(() => {});
      })
      .catch(err => setError(err.response?.data?.message || "Failed to submit review."))
      .finally(() => setSubmittingReview(false));
  };

  if (loading) return <div className="container mt-5"><h3>Loading product...</h3></div>;
  if (!product) return <div className="container mt-5"><div className="alert alert-danger">Product not found.</div></div>;

  return (
    <div className="container mt-4">
      {error && <ErrorMessage message={error} type="danger" onClose={() => setError("")} />}
      {success && <ErrorMessage message={success} type="success" onClose={() => setSuccess("")} autoClose />}

      <button className="btn btn-link p-0 mb-3" onClick={() => navigate("/products")}>
        ← Back to Products
      </button>

      <div className="row">
        {/* Product Image */}
        <div className="col-md-5 mb-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="img-fluid rounded shadow"
              style={{ maxHeight: "400px", width: "100%", objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="bg-light rounded d-flex align-items-center justify-content-center shadow"
                 style={{ height: "300px", fontSize: "5rem" }}>
              🛒
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="col-md-7">
          <h2 className="fw-bold">{product.name}</h2>

          {product.category && (
            <span className="badge bg-secondary mb-2">{product.category.name}</span>
          )}

          <div className="mb-2">
            <StarRating rating={product.averageRating || 0} />
            <span className="text-muted ms-2">
              {product.reviewCount > 0
                ? `${product.averageRating?.toFixed(1)} / 5 (${product.reviewCount} reviews)`
                : "No reviews yet"}
            </span>
          </div>

          <h3 className="text-success fw-bold">₹{product.price}</h3>

          <p className="text-muted mt-2">{product.description}</p>

          <div className="mb-3">
            {product.quantity > 0 ? (
              <span className="badge bg-success fs-6">✔ In Stock ({product.quantity} available)</span>
            ) : (
              <span className="badge bg-danger fs-6">✖ Out of Stock</span>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-lg"
              onClick={addToCart}
              disabled={product.quantity === 0}
            >
              🛒 Add to Cart
            </button>
            <button
              className={`btn btn-lg ${inWishlist ? "btn-danger" : "btn-outline-danger"}`}
              onClick={toggleWishlist}
            >
              {inWishlist ? "♥ Wishlisted" : "♡ Wishlist"}
            </button>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Reviews Section */}
      <div className="row">
        <div className="col-md-8">
          <h4 className="fw-bold mb-3">Customer Reviews</h4>

          {/* Add Review Form */}
          {userId && (
            <div className="card p-3 mb-4 shadow-sm">
              <h6 className="fw-bold">Write a Review</h6>
              <div className="mb-2">
                <label className="form-label">Your Rating</label>
                <div>
                  <StarRating rating={newRating} interactive onSelect={setNewRating} />
                  <span className="ms-2 text-muted">{newRating}/5</span>
                </div>
              </div>
              <div className="mb-2">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={submitReview}
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {/* Review List */}
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="card p-3 mb-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{review.username || "Anonymous"}</strong>
                    <div>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <small className="text-muted">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                  </small>
                </div>
                <p className="mt-2 mb-0">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
