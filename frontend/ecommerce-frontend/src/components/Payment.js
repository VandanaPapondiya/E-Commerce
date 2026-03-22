import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import axios from "../Api/axiosConfig";
import { useUser } from "../context/UserContext";

// Initialize Stripe with proper error handling
const stripeKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey && stripeKey.startsWith('pk_')
  ? loadStripe(stripeKey)
  : Promise.resolve(null);

function PaymentContent() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { userId } = useUser();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe not loaded yet");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get payment intent from backend
      const { data: clientSecret } = await axios.post(
        `/api/payments/create-intent`,
        { orderId, userId }
      );

      // Confirm payment with card details
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name: "Customer" }
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setSuccess(true);
        // Redirect to confirmation page after 3 seconds
        setTimeout(() => {
          navigate(`/order-confirmation/${orderId}`);
        }, 3000);
      } else {
        setError("Payment processing failed");
      }
    } catch (err) {
      setError("Payment error: " + (err.response?.data?.message || err.message));
    }

    setLoading(false);
  };

  // Check if Stripe is configured
  if (!stripeKey || !stripeKey.startsWith('pk_')) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-warning">
              <div className="card-header bg-warning">
                <h5>⚠️ Stripe Configuration Required</h5>
              </div>
              <div className="card-body">
                <p>Stripe payment is not configured yet. To enable payments:</p>
                <ol>
                  <li>Get a test publishable key from <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">Stripe Dashboard</a></li>
                  <li>Add it to your <code>.env</code> file:
                    <pre className="bg-light p-2"><code>REACT_APP_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY</code></pre>
                  </li>
                  <li>Restart the development server</li>
                </ol>
                <p className="text-muted mt-3">For testing, you can use card: <strong>4242 4242 4242 4242</strong></p>
                <button
                  className="btn btn-secondary w-100 mt-3"
                  onClick={() => navigate("/checkout")}
                >
                  Back to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Complete Payment</h4>
            </div>
            <div className="card-body">
              {success ? (
                <div className="alert alert-success">
                  <h5>Payment Successful!</h5>
                  <p>Your order has been confirmed. Redirecting...</p>
                </div>
              ) : (
                <>
                  {error && <div className="alert alert-danger">{error}</div>}

                  <form onSubmit={handlePayment}>
                    <div className="mb-3">
                      <label className="form-label">Card Details</label>
                      <div className="form-control p-3" style={{ minHeight: "50px" }}>
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: "16px",
                                color: "#424770",
                                "::placeholder": {
                                  color: "#aab7c4"
                                }
                              },
                              invalid: {
                                color: "#fa755a"
                              }
                            }
                          }}
                        />
                      </div>
                      <small className="text-muted mt-2 d-block">
                        Use test card: 4242 4242 4242 4242 | Any future date | Any CVC
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success w-100 mb-2"
                      disabled={loading || !stripe}
                    >
                      {loading ? "Processing..." : "Complete Payment"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary w-100"
                      onClick={() => navigate("/checkout")}
                      disabled={loading}
                    >
                      Back to Checkout
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Payment() {
  const stripe = stripeKey && stripeKey.startsWith('pk_') ? stripePromise : null;

  return stripe ? (
    <Elements stripe={stripe}>
      <PaymentContent />
    </Elements>
  ) : (
    <PaymentContent />
  );
}

export default Payment;