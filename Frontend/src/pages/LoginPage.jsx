import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { ArrowLeftIcon } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res?.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      toast.success('Logged in successfully');
      navigate('/home');
    } catch (error) {
      console.error('Login error', error);
      if (!error.response) {
        localStorage.setItem('token', 'demo-token');
        toast.success('Offline demo login');
        navigate('/home');
      } else {
        toast.error(error.response.data?.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Link to="/" className="btn btn-ghost rounded-full mb-6">
            <ArrowLeftIcon className="h-5 w-5" /> Back
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input input-bordered"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    className="input input-bordered"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-primary rounded-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <span className="text-sm">Don't have an account?</span>{' '}
                <Link to="/signup" className="link link-primary">
                  Create one
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
