import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/buyers');
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-card rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Or <Link to="/register" className="text-primary font-medium">create a new account</Link></p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive p-3 text-sm text-destructive-foreground">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground text-left">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-ring"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground text-left">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-ring"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;