import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import StoryGenerate from './pages/StoryGenerate'
import Layout from './components/Layout'
import { Toaster } from './components/ui/toaster'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Router>
        <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/stories" replace />
            ) : (
              <Login onLogin={() => setIsAuthenticated(true)} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/stories" replace />
            ) : (
              <Register onRegister={() => setIsAuthenticated(true)} />
            )
          }
        />
        <Route
          path="/"
          element={
            <Layout onLogout={() => setIsAuthenticated(false)}>
              {isAuthenticated ? (
                <Navigate to="/stories" replace />
              ) : (
                <Navigate to="/login" replace />
              )}
            </Layout>
          }
        />
        <Route
          path="/stories"
          element={
            <Layout onLogout={() => setIsAuthenticated(false)}>
              {isAuthenticated ? (
                <Stories />
              ) : (
                <Navigate to="/login" replace />
              )}
            </Layout>
          }
        />
        <Route
          path="/stories/:id"
          element={
            <Layout onLogout={() => setIsAuthenticated(false)}>
              {isAuthenticated ? (
                <StoryDetail />
              ) : (
                <Navigate to="/login" replace />
              )}
            </Layout>
          }
        />
        <Route
          path="/stories/generate"
          element={
            <Layout onLogout={() => setIsAuthenticated(false)}>
              {isAuthenticated ? (
                <StoryGenerate />
              ) : (
                <Navigate to="/login" replace />
              )}
            </Layout>
          }
        />
        </Routes>
      </Router>
      <Toaster />
    </>
  )
}

export default App
