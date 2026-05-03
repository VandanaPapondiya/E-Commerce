import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useUser();

  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Product form
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", quantity: "", categoryId: "", imageUrl: "" });
  const [productFormError, setProductFormError] = useState("");

  // Coupon form
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discountType: "PERCENT", discountValue: "", usageLimit: "", expiryDate: "", active: true });

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/products");
      return;
    }

    Promise.all([
      axios.get("http://localhost:8080/api/reports/sales"),
      axios.get("http://localhost:8080/api/orders/all"),
      axios.get("http://localhost:8080/api/products"),
      axios.get("http://localhost:8080/api/users"),
      axios.get("http://localhost:8080/api/categories"),
      axios.get("http://localhost:8080/api/coupons")
    ])
      .then(([reportRes, ordersRes, productsRes, usersRes, categoriesRes, couponsRes]) => {
        setReport(reportRes.data);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setUsers(usersRes.data);
        setCategories(categoriesRes.data);
        setCoupons(couponsRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load admin data.");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOrderStatus = (orderId, status) => {
    axios.put(`http://localhost:8080/api/orders/${orderId}/status?status=${status}`)
      .then(res => {
        setOrders(prev => prev.map(o => o.orderId === orderId || o.id === orderId
          ? { ...o, status }
          : o
        ));
        setSuccess("Order status updated!");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(() => setError("Failed to update order status."));
  };

  const deleteProduct = (productId) => {
    if (!window.confirm("Delete this product?")) return;
    axios.delete(`http://localhost:8080/api/products/${productId}`)
      .then(() => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setSuccess("Product deleted.");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(() => setError("Failed to delete product."));
  };

  const addProduct = (e) => {
    e.preventDefault();
    setProductFormError("");
    if (!newProduct.name || !newProduct.price || !newProduct.quantity || !newProduct.categoryId) {
      setProductFormError("Name, price, quantity, and category are required.");
      return;
    }
    axios.post("http://localhost:8080/api/products/add", {
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity),
      categoryId: parseInt(newProduct.categoryId),
      imageUrl: newProduct.imageUrl
    })
      .then(res => {
        setProducts(prev => [...prev, res.data]);
        setNewProduct({ name: "", description: "", price: "", quantity: "", categoryId: "", imageUrl: "" });
        setSuccess("Product added successfully!");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(() => setProductFormError("Failed to add product."));
  };

  const deleteUser = (userId) => {
    if (!window.confirm("Delete this user?")) return;
    axios.delete(`http://localhost:8080/api/users/${userId}`)
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setSuccess("User deleted.");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(() => setError("Failed to delete user."));
  };

  const createCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) return;
    axios.post("http://localhost:8080/api/coupons/create", {
      ...newCoupon,
      code: newCoupon.code.toUpperCase(),
      discountValue: parseFloat(newCoupon.discountValue),
      usageLimit: parseInt(newCoupon.usageLimit) || 0
    })
      .then(res => {
        setCoupons(prev => [...prev, res.data]);
        setNewCoupon({ code: "", discountType: "PERCENT", discountValue: "", usageLimit: "", expiryDate: "", active: true });
        setSuccess("Coupon created!");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(() => setError("Failed to create coupon."));
  };

  const deleteCoupon = (couponId) => {
    axios.delete(`http://localhost:8080/api/coupons/${couponId}`)
      .then(() => {
        setCoupons(prev => prev.filter(c => c.id !== couponId));
        setSuccess("Coupon deleted.");
        setTimeout(() => setSuccess(""), 2000);
      })
      .catch(() => setError("Failed to delete coupon."));
  };

  if (loading) return <div className="container mt-5"><h3>Loading admin panel...</h3></div>;

  // Revenue chart data
  const revenueChartData = report?.revenueByDate
    ? Object.entries(report.revenueByDate).slice(-14).map(([date, revenue]) => ({
        date: date.slice(5),
        revenue: Math.round(revenue)
      }))
    : [];

  const statusColors = {
    PLACED: "primary", CONFIRMED: "info", SHIPPED: "warning",
    OUT_FOR_DELIVERY: "secondary", DELIVERED: "success", CANCELLED: "danger"
  };

  return (
    <div className="container-fluid mt-3">
      <h2 className="mb-3 fw-bold">⚙️ Admin Dashboard</h2>

      {error && <ErrorMessage message={error} type="danger" onClose={() => setError("")} />}
      {success && <ErrorMessage message={success} type="success" onClose={() => setSuccess("")} autoClose />}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {["dashboard", "orders", "products", "users", "coupons"].map(tab => (
          <li key={tab} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "dashboard" && "📊 "}
              {tab === "orders" && "📦 "}
              {tab === "products" && "🛍️ "}
              {tab === "users" && "👥 "}
              {tab === "coupons" && "🏷️ "}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && report && (
        <div>
          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            {[
              { label: "Total Orders", value: report.totalOrders, color: "primary", icon: "📦" },
              { label: "Total Revenue", value: `₹${report.totalRevenue?.toFixed(2)}`, color: "success", icon: "💰" },
              { label: "Delivered", value: report.deliveredOrders, color: "info", icon: "✅" },
              { label: "Cancelled", value: report.cancelledOrders, color: "danger", icon: "❌" },
              { label: "Total Users", value: report.totalUsers, color: "warning", icon: "👥" },
              { label: "Total Products", value: report.totalProducts, color: "secondary", icon: "🛍️" }
            ].map(stat => (
              <div key={stat.label} className="col-6 col-md-2">
                <div className={`card text-white bg-${stat.color} shadow-sm text-center p-2`}>
                  <div style={{ fontSize: "1.5rem" }}>{stat.icon}</div>
                  <div className="fw-bold">{stat.value}</div>
                  <small>{stat.label}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          {revenueChartData.length > 0 && (
            <div className="card p-3 mb-4 shadow-sm">
              <h5 className="fw-bold">📈 Revenue (Last 14 Days)</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(val) => [`₹${val}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#28a745" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Products */}
          {report.topProducts && report.topProducts.length > 0 && (
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold">🏆 Top Products by Revenue</h5>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={report.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" />
                  <YAxis />
                  <Tooltip formatter={(val) => [`₹${val}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          <h5 className="fw-bold mb-3">All Orders ({orders.length})</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-sm">
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>User ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.orderId || order.id}>
                    <td>#{order.orderId || order.id}</td>
                    <td>{order.userId}</td>
                    <td>₹{order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge bg-${statusColors[order.status] || "secondary"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-"}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={e => updateOrderStatus(order.orderId || order.id, e.target.value)}
                        style={{ minWidth: "130px" }}
                      >
                        {["PLACED","CONFIRMED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <div className="row">
            {/* Add Product Form */}
            <div className="col-md-4">
              <div className="card p-3 mb-3 shadow-sm">
                <h6 className="fw-bold">➕ Add New Product</h6>
                {productFormError && <div className="alert alert-danger py-1 small">{productFormError}</div>}
                <form onSubmit={addProduct}>
                  <input className="form-control mb-2" placeholder="Product Name *"
                    value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <textarea className="form-control mb-2" placeholder="Description" rows={2}
                    value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  <input className="form-control mb-2" type="number" placeholder="Price *" min="0" step="0.01"
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  <input className="form-control mb-2" type="number" placeholder="Stock Quantity *" min="0"
                    value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} />
                  <select className="form-select mb-2" value={newProduct.categoryId}
                    onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}>
                    <option value="">Select Category *</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input className="form-control mb-2" placeholder="Image URL (optional)"
                    value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                  <button type="submit" className="btn btn-success w-100">Add Product</button>
                </form>
              </div>
            </div>

            {/* Products List */}
            <div className="col-md-8">
              <h6 className="fw-bold mb-2">All Products ({products.length})</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.category?.name || "-"}</td>
                        <td>₹{p.price}</td>
                        <td>
                          <span className={p.quantity > 0 ? "text-success" : "text-danger"}>
                            {p.quantity}
                          </span>
                        </td>
                        <td>{p.averageRating > 0 ? `★ ${p.averageRating?.toFixed(1)}` : "-"}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <h5 className="fw-bold mb-3">Users ({users.length})</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-sm">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username || "-"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === "ADMIN" ? "bg-danger" : "bg-primary"}`}>
                        {user.role || "USER"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === "coupons" && (
        <div className="row">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm mb-3">
              <h6 className="fw-bold">➕ Create Coupon</h6>
              <form onSubmit={createCoupon}>
                <input className="form-control mb-2" placeholder="Coupon Code *" maxLength={20}
                  value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
                <select className="form-select mb-2" value={newCoupon.discountType}
                  onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})}>
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
                <input className="form-control mb-2" type="number" placeholder="Discount Value *" min="0" step="0.01"
                  value={newCoupon.discountValue} onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})} />
                <input className="form-control mb-2" type="number" placeholder="Usage Limit (0 = unlimited)" min="0"
                  value={newCoupon.usageLimit} onChange={e => setNewCoupon({...newCoupon, usageLimit: e.target.value})} />
                <input className="form-control mb-2" type="date" placeholder="Expiry Date"
                  value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
                <button type="submit" className="btn btn-success w-100">Create Coupon</button>
              </form>
            </div>
          </div>

          <div className="col-md-8">
            <h6 className="fw-bold mb-2">All Coupons ({coupons.length})</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Used/Limit</th>
                    <th>Expiry</th>
                    <th>Active</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td><code>{c.code}</code></td>
                      <td>{c.discountType}</td>
                      <td>{c.discountType === "PERCENT" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                      <td>{c.usedCount}/{c.usageLimit || "∞"}</td>
                      <td>{c.expiryDate || "-"}</td>
                      <td>
                        <span className={`badge ${c.active ? "bg-success" : "bg-secondary"}`}>
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCoupon(c.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
