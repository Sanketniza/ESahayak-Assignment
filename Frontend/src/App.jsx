
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NewBuyerPage from './pages/NewBuyerPage'
import BuyersListPage from './pages/BuyersListPage'
import BuyerDetailPage from './pages/BuyerDetailPage'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivateRoute from './components/common/PrivateRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/buyers/new" element={<NewBuyerPage />} />
              <Route path="/buyers" element={<BuyersListPage />} />
              <Route path="/buyers/:id" element={<BuyerDetailPage />} />
              <Route path="/buyers/:id/edit" element={<BuyerDetailPage mode="edit" />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App;
