import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";

function OrderConfirmation() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { userId } = useUser();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId && userId) {
      axios.get(`http://localhost:8080/api/orders/user/${userId}`)
        .then(res => {
          const foundOrder = res.data.find(o => o.id === Number(orderId));
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError("Order not found");
          }
          setLoading(false);
        })
        .catch(err => {
          setError("Failed to load order: " + err.message);
          setLoading(false);
        });
    }
  }, [orderId, userId]);

  if (loading) {
    return (
      <div className="container mt-5">
        <h3>Loading order details...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate("/orders")}>
          View All Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-success">
            <div className="card-header bg-success text-white">
              <h4>✅ Order Confirmed!</h4>
            </div>
            <div className="card-body">
              <p>Thank you for your purchase. Your order has been successfully placed.</p>

              {order && (
                <>
                  <hr />
                  <h5>Order Details</h5>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Order ID:</strong> {order.id}</p>
                      <p><strong>Status:</strong> <span className="badge bg-info">{order.status}</span></p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Total Amount:</strong> <strong className="text-success">₹{order.totalAmount}</strong></p>
                      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <hr />
                  <h5>Ordered Items</h5>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                          <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items && order.items.map(item => (
                        <tr key={item.id}>
                          <td>{item.product?.name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.price}</td>
                          <td>₹{item.quantity * item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <hr />
              <p className="text-muted">
                You will receive a confirmation email shortly. Your order will be delivered within 5-7 business days.
              </p>

              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-primary flex-grow-1"
                  onClick={() => navigate("/orders")}
                >
                  View All Orders
                </button>
                <button
                  className="btn btn-secondary flex-grow-1"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;