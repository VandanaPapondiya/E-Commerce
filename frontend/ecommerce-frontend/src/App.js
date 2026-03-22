import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Login from "./components/Login";
import Register from "./components/Register";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Payment from "./components/Payment";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderHistory from "./components/OrderHistory";
import UserProfile from "./components/UserProfile";
import Navbar from "./components/Navbar";

function App(){
  return(
    <UserProvider>
      <BrowserRouter>

        <Navbar />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>

      </BrowserRouter>
    </UserProvider>
  );
}

export default App;