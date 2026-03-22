import React, { useEffect, useState } from "react";
import axios from "../Api/axiosConfig";

function AdminOrders(){

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/orders/all")
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));
  }, []);

  const updateStatus = (orderId, status) => {

    axios.put(`http://localhost:8080/api/orders/${orderId}/status?status=${status}`)
      .then(() => {
        alert("Status Updated");
      })
      .catch(err => console.log(err));
  };

  return(
    <div>
      <h2>All Orders (Admin)</h2>

      {orders.map(order => (
        <div key={order.id} style={{border:"1px solid", margin:"10px", padding:"10px"}}>

          <p>Order ID: {order.id}</p>
          <p>Status: {order.status}</p>

          <button onClick={() => updateStatus(order.id, "SHIPPED")}>
            Ship
          </button>

          <button onClick={() => updateStatus(order.id, "DELIVERED")}>
            Deliver
          </button>

        </div>
      ))}

    </div>
  );
}

export default AdminOrders;