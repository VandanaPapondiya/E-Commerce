import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";

function Checkout(){

  const navigate = useNavigate();
  const { userId } = useUser();

  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if(userId) {
      axios.get(`http://localhost:8080/api/cart/${userId}`)
        .then(res => setCart(res.data))
        .catch(() => setError("Failed to load cart"));
    }
  }, [userId]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    if (!address.street || !address.city || !address.state || !address.postalCode || !address.phone) {
      setError("Please fill all address fields");
      return false;
    }
    return true;
  };

  const rawTotal = cart
    ? cart.items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0)
    : 0;

  const finalTotal = couponResult?.valid
    ? couponResult.finalAmount
    : rawTotal;

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponResult(null);
    axios.get(`http://localhost:8080/api/coupons/validate?code=${encodeURIComponent(couponCode)}&cartTotal=${rawTotal}`)
      .then(res => {
        setCouponResult(res.data);
        if (!res.data.valid) setError(res.data.message);
        else setError("");
      })
      .catch(() => {
        setCouponResult({ valid: false, message: "Failed to validate coupon." });
        setError("Failed to validate coupon.");
      })
      .finally(() => setCouponLoading(false));
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
  };

  const handlePlaceOrder = () => {
    if (!validateAddress()) return;

    setLoading(true);
    setError("");

    // Use the correct order endpoint
    axios.post("http://localhost:8080/api/orders/place", { userId })
      .then(res => {
        const orderId = res.data?.orderId || res.data?.id || res.data;
        navigate(`/payment/${orderId}`);
      })
      .catch(err => {
        setError("Failed to place order: " + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  };

  if(!cart) {
    return <div className="container mt-5"><h3>Loading checkout...</h3></div>;
  }

  if(!cart.items || cart.items.length === 0) {
    return (
      <div className="container mt-5">
        <h3>Your cart is empty</h3>
        <button className="btn btn-primary" onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return(
    <div className="container mt-4">
      <h2 className="mb-4">🧾 Checkout</h2>

      {error && <div className="alert alert-danger alert-dismissible">
        {error}
        <button type="button" className="btn-close" onClick={() => setError("")}></button>
      </div>}

      <div className="row">

        {/* Order Summary */}
        <div className="col-md-6">
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map(item => (
                    <tr key={item.product.id}>
                      <td>{item.product.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.product.price}</td>
                      <td>₹{(item.quantity * item.product.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <hr />
              <div className="d-flex justify-content-between mb-1">
                <span>Subtotal:</span>
                <span>₹{rawTotal.toFixed(2)}</span>
              </div>

              {/* Coupon Section */}
              <div className="mt-3">
                <label className="form-label fw-semibold">🏷️ Coupon Code</label>
                {couponResult?.valid ? (
                  <div>
                    <div className="alert alert-success py-2 d-flex justify-content-between align-items-center mb-1">
                      <span>✓ Coupon applied! Saved ₹{couponResult.discountValue?.toFixed(2)}</span>
                      <button className="btn btn-sm btn-outline-danger" onClick={removeCoupon}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total:</span>
                <span className="text-success">₹{finalTotal.toFixed(2)}</span>
              </div>
              {couponResult?.valid && (
                <small className="text-muted">
                  Original: <s>₹{rawTotal.toFixed(2)}</s>
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Delivery Address</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Street Address *</label>
                  <input type="text" className="form-control" name="street"
                    value={address.street} onChange={handleAddressChange} placeholder="Enter street address" />
                </div>
                <div className="mb-3">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-control" name="city"
                    value={address.city} onChange={handleAddressChange} placeholder="Enter city" />
                </div>
                <div className="row">
                  <div className="col mb-3">
                    <label className="form-label">State *</label>
                    <input type="text" className="form-control" name="state"
                      value={address.state} onChange={handleAddressChange} placeholder="Enter state" />
                  </div>
                  <div className="col mb-3">
                    <label className="form-label">Postal Code *</label>
                    <input type="text" className="form-control" name="postalCode"
                      value={address.postalCode} onChange={handleAddressChange} placeholder="Postal code" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number *</label>
                  <input type="tel" className="form-control" name="phone"
                    value={address.phone} onChange={handleAddressChange} placeholder="Enter phone number" />
                </div>
              </form>

              <div className="d-flex gap-2">
                <button className="btn btn-secondary flex-grow-1"
                  onClick={() => navigate("/cart")} disabled={loading}>
                  ← Back to Cart
                </button>
                <button className="btn btn-success flex-grow-1"
                  onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "Processing..." : "Place Order →"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
