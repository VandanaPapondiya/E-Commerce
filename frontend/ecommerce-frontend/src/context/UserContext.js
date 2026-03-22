import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
        console.log("User restored from localStorage:", userData);
      } catch (error) {
        console.error("Failed to restore user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  }, []);

  const login = (userData) => {
    console.log("Login called with userData:", userData);

    // Store token
    localStorage.setItem("token", userData.token || userData);

    // Try to extract user info from JWT if available
    let userInfo = {
      userId: userData.userId || 1,
      username: userData.username || "User"
    };

    // If userData is just a token string, try to decode it
    if (typeof userData === "string") {
      try {
        const decoded = jwtDecode(userData);
        console.log("Decoded JWT:", decoded);
        userInfo = {
          userId: decoded.sub || decoded.userId || decoded.id || 1,
          username: decoded.username || decoded.preferred_username || "User"
        };
      } catch (error) {
        console.log("Could not decode JWT, using default user info");
        // Default to userId: 1 if token decode fails
        userInfo = { userId: 1, username: "User" };
      }
    }

    // Save user info to localStorage
    localStorage.setItem("user", JSON.stringify(userInfo));

    // Update state
    setUser(userInfo);
    setIsLoggedIn(true);

    console.log("Login successful, user:", userInfo);
  };

  const logout = () => {
    console.log("Logout called");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        userId: user?.userId,
        username: user?.username,
        login,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
