import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import './index.css'
import Dashboard from './pages/Dashboard'
import Component from './components/comp-577'
import heroBackground from './assets/hero_background.jpeg'
import Login from './pages/Login'

function HomePage() {
  return (
    <div style={{ backgroundColor: '#E8F8E8' }}>
      <Component />
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-3xl mt-20">
            <h1 className="mb-2 text-5xl font-bold">Sembramos educación</h1>
            <h1 className="mb-2 text-5xl font-bold">Cultivamos confianza</h1>
            <h1 className="mb-5 text-5xl font-bold">Cosechamos bienestar</h1>
            <p className="mb-5">
              En Fintivami, creemos en el poder de la educación y la confianza para transformar vidas.
            </p>
            <button
              className="btn btn-primary"
              style={{ backgroundColor: '#E91E63', borderColor: '#E91E63' }}
              onClick={() => window.location.href = '/login'}
            >
              Inciar sesión
            </button>
          </div>
        </div>
      </div>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
      <p className="p-4">Putamadre</p>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App