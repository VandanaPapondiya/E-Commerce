import React, { useEffect, useState } from "react";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

function StatusTimeline({ status }) {
  const currentIndex = STATUS_STEPS.indexOf(status);
  const isCancelled = status === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="d-flex align-items-center gap-2 my-2">
        <span className="badge bg-danger px-3 py-2">✖ Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center my-2 flex-wrap gap-1">
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <React.Fragment key={step}>
            <div
              className={`text-center px-2 py-1 rounded small fw-semibold`}
              style={{
                backgroundColor: isCompleted ? "#28a745" : "#e9ecef",
                color: isCompleted ? "white" : "#6c757d",
                border: isCurrent ? "2px solid #155724" : "2px solid transparent",
                minWidth: "80px",
                fontSize: "0.7rem"
              }}
            >
              {isCompleted ? "✓ " : ""}{step.replace(/_/g, " ")}
            </div>
            {index < STATUS_STEPS.length - 1 && (
              <div style={{
                height: "2px",
                width: "20px",
                backgroundColor: index < currentIndex ? "#28a745" : "#e9ecef"
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderHistory() {

  const { userId } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8080/api/orders/user/${userId}`)
        .then(res => {
          // Sort newest first
          const sorted = [...res.data].sort((a, b) =>
            new Date(b.orderDate) - new Date(a.orderDate)
          );
          setOrders(sorted);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load orders.");
          setLoading(false);
        });
    }
  }, [userId]);

  const cancelOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    axios.put(`http://localhost:8080/api/orders/${orderId}/cancel`)
      .then(res => {
        setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      })
      .catch(() => setError("Failed to cancel order."));
  };

  if (loading) return <div className="container mt-5"><h3>Loading orders...</h3></div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">📦 My Orders</h2>

      {error && <ErrorMessage message={error} type="danger" onClose={() => setError("")} />}

      {orders.length === 0 ? (
        <div className="alert alert-info">
          No orders found. <a href="/products">Start Shopping</a>
        </div>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            className="card mb-3 shadow-sm"
          >
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <strong>Order #</strong>{order.id}
                <span className="text-muted ms-3 small">
                  {order.orderDate ? new Date(order.orderDate).toLocaleString() : ""}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <strong className="text-success">₹{order.totalAmount?.toFixed(2)}</strong>
                {(order.status === "PLACED" || order.status === "CONFIRMED") && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => cancelOrder(order.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="card-body">
              {/* Status Timeline */}
              <StatusTimeline status={order.status} />

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3">
                  <strong className="small">Items:</strong>
                  <div className="table-responsive mt-2">
                    <table className="table table-sm table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map(item => (
                          <tr key={item.id}>
                            <td>{item.product?.name || "Product"}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price}</td>
                            <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;