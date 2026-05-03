import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";

const RECENTLY_VIEWED_KEY = "recentlyViewed";
const MAX_RECENTLY_VIEWED = 6;
const PAGE_SIZE = 8;

function StarRating({ rating }) {
  return (
    <span style={{ color: "#f5a623" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}>{star <= Math.round(rating) ? "★" : "☆"}</span>
      ))}
      <small className="text-muted ms-1">({rating > 0 ? rating.toFixed(1) : "No ratings"})</small>
    </span>
  );
}

function ProductList() {

  const navigate = useNavigate();
  const { userId } = useUser();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Wishlist tracking
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:8080/api/products"),
      axios.get("http://localhost:8080/api/categories")
    ])
      .then(([productsRes, categoriesRes]) => {
        setAllProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });

    // Load recently viewed from localStorage
    try {
      const rv = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      setRecentlyViewed(rv);
    } catch {}

    // Load wishlist
    if (userId) {
      axios.get(`http://localhost:8080/api/wishlist/${userId}`)
        .then(res => {
          const ids = new Set((res.data.products || []).map(p => p.id));
          setWishlistIds(ids);
        })
        .catch(() => {});
    }
  }, [userId]);

  // Derived: filtered + paginated products
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || (p.category && p.category.id === Number(selectedCategory));
    const matchesMin = !minPrice || p.price >= Number(minPrice);
    const matchesMax = !maxPrice || p.price <= Number(maxPrice);
    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const addToCart = (productId) => {
    setError("");
    setSuccess("");
    if (!userId) {
      navigate("/");
      return;
    }
    axios.post(`http://localhost:8080/api/cart/add?userId=${userId}&productId=${productId}&quantity=1`)
      .then(() => {
        setSuccess("Product added to cart!");
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to add product to cart.");
      });
  };

  const toggleWishlist = (productId) => {
    if (!userId) { navigate("/"); return; }

    if (wishlistIds.has(productId)) {
      axios.delete(`http://localhost:8080/api/wishlist/remove?userId=${userId}&productId=${productId}`)
        .then(() => {
          setWishlistIds(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        })
        .catch(() => setError("Failed to update wishlist."));
    } else {
      axios.post(`http://localhost:8080/api/wishlist/add?userId=${userId}&productId=${productId}`)
        .then(() => {
          setWishlistIds(prev => new Set([...prev, productId]));
          setSuccess("Added to wishlist!");
          setTimeout(() => setSuccess(""), 2000);
        })
        .catch(() => setError("Failed to update wishlist."));
    }
  };

  const viewProduct = (product) => {
    // Track recently viewed
    try {
      let rv = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      rv = rv.filter(p => p.id !== product.id);
      rv.unshift({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
      rv = rv.slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(rv));
      setRecentlyViewed(rv);
    } catch {}
    navigate(`/products/${product.id}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  if (loading) return <div className="container mt-5"><h3>Loading products...</h3></div>;

  return (
    <div className="container mt-4">

      {error && <ErrorMessage message={error} type="danger" onClose={() => setError("")} />}
      {success && <ErrorMessage message={success} type="success" onClose={() => setSuccess("")} autoClose={true} />}

      <h2 className="mb-3">🛍️ Products</h2>

      {/* Search & Filters */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-2 align-items-end">

          <div className="col-md-4">
            <label className="form-label fw-semibold">🔍 Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); handleFilterChange(); }}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); handleFilterChange(); }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">Min Price (₹)</label>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              value={minPrice}
              onChange={e => { setMinPrice(e.target.value); handleFilterChange(); }}
              min="0"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">Max Price (₹)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Any"
              value={maxPrice}
              onChange={e => { setMaxPrice(e.target.value); handleFilterChange(); }}
              min="0"
            />
          </div>

          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

        </div>
        <small className="text-muted mt-2">
          Showing {filteredProducts.length} of {allProducts.length} products
        </small>
      </div>

      {/* Product Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="alert alert-info">No products found matching your filters.</div>
      ) : (
        <div className="row">
          {paginatedProducts.map(product => (
            <div className="col-md-3 mb-4" key={product.id}>
              <div className="card shadow-sm h-100">

                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center"
                       style={{ height: "180px", fontSize: "3rem" }}>
                    🛒
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  <h6 className="card-title fw-bold">{product.name}</h6>
                  <p className="text-success fw-bold mb-1">₹{product.price}</p>
                  <div className="mb-1">
                    <StarRating rating={product.averageRating || 0} />
                  </div>
                  <p className="text-muted small flex-grow-1" style={{ overflow: "hidden", maxHeight: "40px" }}>
                    {product.description}
                  </p>
                  <p className="small text-muted mb-2">
                    {product.quantity > 0
                      ? <span className="text-success">✔ In Stock ({product.quantity})</span>
                      : <span className="text-danger">✖ Out of Stock</span>
                    }
                  </p>

                  <div className="d-flex gap-1 mt-auto">
                    <button
                      className="btn btn-primary btn-sm flex-grow-1"
                      onClick={() => addToCart(product.id)}
                      disabled={product.quantity === 0}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      className={`btn btn-sm ${wishlistIds.has(product.id) ? "btn-danger" : "btn-outline-danger"}`}
                      onClick={() => toggleWishlist(product.id)}
                      title={wishlistIds.has(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      ♥
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => viewProduct(product)}
                      title="View Details"
                    >
                      👁
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-3">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold">🕐 Recently Viewed</h5>
          <div className="d-flex gap-3 flex-wrap">
            {recentlyViewed.map(item => (
              <div
                key={item.id}
                className="card p-2 shadow-sm"
                style={{ width: "130px", cursor: "pointer" }}
                onClick={() => navigate(`/products/${item.id}`)}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name}
                       style={{ height: "60px", objectFit: "cover" }}
                       className="card-img-top mb-1"
                       onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="text-center" style={{ fontSize: "2rem" }}>🛒</div>
                )}
                <small className="fw-semibold text-truncate">{item.name}</small>
                <small className="text-success">₹{item.price}</small>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductList;