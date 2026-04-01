import React from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Diagnose from './pages/Diagnose';

function useAuthUser() {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function ProtectedRoute({ children }) {
  const user = useAuthUser();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function NavBar() {
  const user = useAuthUser();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('authUser');
    navigate('/login');
  }

  return (
    <nav className="nav">
      <div className="nav__brand">Plant Doctor</div>
      <div className="nav__links">
        {!user && (
          <>
            <Link to="/login" className="btn btn--link">Login</Link>
            <Link to="/signup" className="btn btn--outline">Sign up</Link>
          </>
        )}
        {user && (
          <>
            <Link to="/diagnose" className="btn btn--link">Diagnose</Link>
            <button className="btn btn--danger" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const user = useAuthUser();
  return (
    <div className="app">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to={user ? '/diagnose' : '/login'} replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/diagnose"
            element={
              <ProtectedRoute>
                <Diagnose />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">ai-wheat-disease-detection</footer>
    </div>
  );
}

