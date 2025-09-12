
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NewBuyerPage from './pages/NewBuyerPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buyers/new" element={<NewBuyerPage />} />
          {/* Add more routes as they are implemented */}
          <Route path="/buyers" element={<div className="container mx-auto py-8 px-4"><h1 className="text-2xl font-bold">Buyers List</h1><p className="mt-4">This page will be implemented in the next phase.</p></div>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;
