
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NewBuyerPage from './pages/NewBuyerPage'
import BuyersListPage from './pages/BuyersListPage'
import BuyerDetailPage from './pages/BuyerDetailPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buyers/new" element={<NewBuyerPage />} />
          <Route path="/buyers" element={<BuyersListPage />} />
          <Route path="/buyers/:id" element={<BuyerDetailPage />} />
          <Route path="/buyers/:id/edit" element={<BuyerDetailPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;
