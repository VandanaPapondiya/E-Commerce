import React, { useEffect, useState } from "react";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";
import AddressForm from "./AddressForm";

function UserProfile() {
  const { userId, username } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchAddresses();
      fetchOrders();
    }
  }, [userId]);

  const fetchAddresses = () => {
    axios.get(`http://localhost:8080/api/addresses/${userId}`)
      .then(res => {
        setAddresses(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.log("Addresses not available yet", err);
        setLoading(false);
      });
  };

  const fetchOrders = () => {
    axios.get(`http://localhost:8080/api/orders/user/${userId}`)
      .then(res => {
        setOrders(res.data || []);
      })
      .catch(err => console.log(err));
  };

  const handleAddAddress = (addressData) => {
    axios.post("http://localhost:8080/api/addresses", {
      ...addressData,
      userId
    })
      .then(res => {
        setAddresses([...addresses, res.data]);
        setShowAddressForm(false);
        setError("");
      })
      .catch(err => {
        setError("Failed to add address: " + err.message);
      });
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      axios.delete(`http://localhost:8080/api/addresses/${addressId}`)
        .then(() => {
          setAddresses(addresses.filter(a => a.id !== addressId));
        })
        .catch(err => {
          setError("Failed to delete address: " + err.message);
        });
    }
  };

  if (loading) {
    return <div className="container mt-5"><h3>Loading profile...</h3></div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">👤 My Profile</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* User Info */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Account Information</h5>
        </div>
        <div className="card-body">
          <p><strong>Username:</strong> {username}</p>
          <p><strong>User ID:</strong> {userId}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Saved Addresses</h5>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowAddressForm(!showAddressForm)}
          >
            {showAddressForm ? "Cancel" : "+ Add Address"}
          </button>
        </div>
        <div className="card-body">
          {showAddressForm && (
            <div className="mb-4 p-3 border rounded">
              <h6>Add New Address</h6>
              <AddressForm
                onSubmit={handleAddAddress}
                submitButtonText="Add Address"
              />
            </div>
          )}

          {addresses.length > 0 ? (
            <div className="row">
              {addresses.map(address => (
                <div key={address.id} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <p><strong>{address.street}</strong></p>
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>📞 {address.phone}</p>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No addresses saved yet. Add one above.</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h5>Recent Orders</h5>
        </div>
        <div className="card-body">
          {orders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>₹{order.totalAmount}</td>
                      <td>
                        <span className={`badge bg-${order.status === 'DELIVERED' ? 'success' : 'warning'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;