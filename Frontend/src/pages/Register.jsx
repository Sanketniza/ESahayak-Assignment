import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Form validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string().min(6, 'Password must be at least 6 characters')
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ['passwordConfirm']
});

const Register = () => {
  const { register: registerUser, error, setError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });
  
  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      await registerUser(data);
      navigate('/buyers');
    } catch {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-card rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Create a new account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Or <Link to="/login" className="text-primary font-medium">sign in to your existing account</Link></p>
        </div>

        {error && <div className="mb-4 rounded-md bg-destructive p-3 text-sm text-destructive-foreground">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground text-left">Full Name</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-ring"
              placeholder="Your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground text-left">Email address</label>
            <input id="email" type="email" {...register('email')} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-ring" placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground text-left">Password</label>
            <input id="password" type="password" {...register('password')} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-ring" placeholder="********" />
            {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground text-left">Confirm Password</label>
            <input id="passwordConfirm" type="password" {...register('passwordConfirm')} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-ring" placeholder="********" />
            {errors.passwordConfirm && <p className="mt-1 text-sm text-destructive">{errors.passwordConfirm.message}</p>}
          </div>

          <div>
            <button type="submit" disabled={submitting} className={`w-full flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;