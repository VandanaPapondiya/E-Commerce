import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Restore user session from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        // Verify token is not expired
        const decoded = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          // Token expired - clear storage
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          setUser(null);
          setIsLoggedIn(false);
          return;
        }
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  }, []);

  /**
   * Called after successful login.
   * Accepts a LoginResponse object from backend with:
   * { token, refreshToken, userId, username, email, role }
   */
  const login = (loginData) => {
    let token, userId, username, role, refreshToken;

    if (typeof loginData === "string") {
      // Legacy: just a token string
      token = loginData;
      try {
        const decoded = jwtDecode(token);
        userId = decoded.userId || decoded.sub || 1;
        username = decoded.sub || "User";
        role = decoded.role || "USER";
      } catch {
        userId = 1;
        username = "User";
        role = "USER";
      }
    } else {
      // New format: { token, refreshToken, userId, username, role }
      token = loginData.token;
      refreshToken = loginData.refreshToken;
      userId = loginData.userId;
      username = loginData.username;
      role = loginData.role || "USER";

      // Fallback: decode from token if fields missing
      if (!userId && token) {
        try {
          const decoded = jwtDecode(token);
          userId = decoded.userId || 1;
          username = username || decoded.sub || "User";
          role = role || decoded.role || "USER";
        } catch {}
      }
    }

    const userInfo = { userId, username, role };

    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(userInfo));

    setUser(userInfo);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  const isAdmin = () => {
    return user?.role === "ADMIN";
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        userId: user?.userId,
        username: user?.username,
        role: user?.role,
        isAdmin,
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
