import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const res = loginUser(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    const redirectTo = location.state?.from?.pathname || '/diagnose';
    navigate(redirectTo);
  }

  return (
    <div className="card">
      <h1>Welcome back</h1>
      <form onSubmit={handleSubmit} className="form">
        <label className="form__label">Email</label>
        <input className="form__input" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" />

        <label className="form__label">Password</label>
        <input className="form__input" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" />

        {error && <div className="alert alert--error">{error}</div>}

        <button className="btn btn--primary" type="submit">Log in</button>
        <p className="muted">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

