import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../utils/auth';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const res = signupUser(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate('/diagnose');
  }

  return (
    <div className="card">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} className="form">
        <label className="form__label">Name</label>
        <input className="form__input" name="name" value={form.name} onChange={onChange} placeholder="Your name" />

        <label className="form__label">Email</label>
        <input className="form__input" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" />

        <label className="form__label">Password</label>
        <input className="form__input" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" />

        {error && <div className="alert alert--error">{error}</div>}

        <button className="btn btn--primary" type="submit">Sign up</button>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

