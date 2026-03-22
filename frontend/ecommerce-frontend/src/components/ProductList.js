import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";


function ProductList(){

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { userId } = useUser();

  useEffect(()=>{
    axios.get("http://localhost:8080/api/products")
      .then(response=>{
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error=>{
        setError("Failed to load products. Please try again later.");
        console.error(error);
        setLoading(false);
      });
  },[]);

  const addToCart = (productId) => {
    setError("");
    setSuccess("");

    axios.post(`http://localhost:8080/api/cart/add?userId=${userId}&productId=${productId}&quantity=1`)
    .then(res=>{
      setSuccess(`Product added to cart!`);
      setTimeout(() => setSuccess(""), 3000);
    })
    .catch(err=>{
      setError("Failed to add product to cart. Please try again.");
      console.log(err);
    });

  };

  if (loading) {
    return <div className="container mt-5"><h3>Loading products...</h3></div>;
  }

  return(
    <div className="container mt-4">

      {error && (
        <ErrorMessage
          message={error}
          type="danger"
          onClose={() => setError("")}
        />
      )}

      {success && (
        <ErrorMessage
          message={success}
          type="success"
          onClose={() => setSuccess("")}
          autoClose={true}
        />
      )}

      <h2 className="mb-4">🛍️ Products</h2>

      {products.length === 0 ? (
        <div className="alert alert-info">No products available</div>
      ) : (
        <div className="row">

          {products.map(product =>(

            <div className="col-md-3 mb-4" key={product.id}>

              <div className="card shadow-sm p-3 h-100">

                <h5>{product.name}</h5>
                <p className="text-success fw-bold">₹ {product.price}</p>
                <p className="text-muted small">{product.description}</p>

                <button
                  className="btn btn-primary mt-auto"
                  onClick={()=>addToCart(product.id)}
                >
                  Add To Cart
                </button>

              </div>

            </div>

          ))}

        </div>
      )}
    </div>
  );
}

export default ProductList;