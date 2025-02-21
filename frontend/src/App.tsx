import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Home from "./pages/Home";
import { AuthProvider, useAuth } from "./context/AuthContext";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/home"
            element={
              // add all private routes here
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
