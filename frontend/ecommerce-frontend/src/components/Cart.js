import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";

function Cart(){

  const navigate = useNavigate();
  const { userId } = useUser();
  const [cart, setCart] = useState(null);

  useEffect(()=>{
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userId]);

  const fetchCart = () => {
    axios.get(`http://localhost:8080/api/cart/${userId}`)
      .then(res => {
        setCart(res.data);
      })
      .catch(err => console.log(err));
  };

  const updateQuantity = (productId, quantity) => {

    if(quantity < 1) return;

    axios.post(`http://localhost:8080/api/cart/add?userId=${userId}&productId=${productId}&quantity=${quantity}`)
      .then(res=>{
        fetchCart();
      })
      .catch(err=>console.log(err));
  };

  const removeItem = (productId) => {
    axios.delete(`http://localhost:8080/api/cart/remove?userId=${userId}&productId=${productId}`)
      .then(()=>{
        fetchCart();
      })
      .catch(err=>console.log(err));
  };

  if(!cart) return <h3 className="text-center mt-5">Loading Cart...</h3>;

  return(
    <div className="container mt-4">

      <h2 className="mb-3">🛒 Your Cart</h2>

      {cart.items && cart.items.length > 0 ? (
        <>
          <table className="table table-bordered text-center">

            <thead className="table-dark">
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {cart.items.map(item =>(

                <tr key={item.product.id}>

                  <td>{item.product.name}</td>
                  <td>{item.product.price}</td>

                  <td>
                    <button className="btn btn-sm btn-danger me-2"
                      onClick={()=>updateQuantity(item.product.id, item.quantity - 1)}>
                      -
                    </button>

                    {item.quantity}

                    <button className="btn btn-sm btn-success ms-2"
                      onClick={()=>updateQuantity(item.product.id, item.quantity + 1)}>
                      +
                    </button>
                  </td>

                  <td>{item.quantity * item.product.price}</td>

                  <td>
                    <button className="btn btn-warning"
                      onClick={()=>removeItem(item.product.id)}>
                      Remove
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-secondary" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
            <button className="btn btn-success btn-lg" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <div className="alert alert-info">
          Your cart is empty. <a href="/products">Continue Shopping</a>
        </div>
      )}

    </div>
  );
}

export default Cart;