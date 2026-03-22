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

  useEffect(() => {
    if(userId) {
      axios.get(`http://localhost:8080/api/cart/${userId}`)
        .then(res => setCart(res.data))
        .catch(err => {
          setError("Failed to load cart");
          console.log(err);
        });
    }
  }, [userId]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAddress = () => {
    if (!address.street || !address.city || !address.state || !address.postalCode || !address.phone) {
      setError("Please fill all address fields");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = () => {
    if (!validateAddress()) return;

    setLoading(true);
    setError("");

    const orderData = {
      userId: userId,
      items: cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: cart.items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0),
      shippingAddress: address,
      status: "PENDING"
    };

    axios.post("http://localhost:8080/api/orders/create", orderData)
      .then(res => {
        // Redirect to payment page
        navigate(`/payment/${res.data.id || res.data}`);
      })
      .catch(err => {
        setError("Failed to create order: " + (err.response?.data?.message || err.message));
        console.log(err);
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

  const total = cart.items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

  return(
    <div className="container mt-4">
      <h2 className="mb-4">Checkout</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">

        {/* Order Summary */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h4>Order Summary</h4>
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
                      <td>₹{item.quantity * item.product.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total Amount:</strong>
                <strong className="text-success">₹{total}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Delivery Address</h4>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    placeholder="Enter state"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    placeholder="Enter postal code"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </form>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-secondary flex-grow-1"
                  onClick={() => navigate("/cart")}
                  disabled={loading}
                >
                  Back to Cart
                </button>
                <button
                  className="btn btn-success flex-grow-1"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Place Order"}
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