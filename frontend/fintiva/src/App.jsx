import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import './index.css'
import Dashboard from './pages/Dashboard'
import Gastos from './pages/Gastos'
import Parcelas from './pages/Parcelas'
import Cultivos from './pages/Cultivos'
import Component from './components/comp-577'
import heroBackground from '@/assets/hero_background.jpeg'
import middleBanner from '@/assets/middleBanner.png'
import Login from './pages/Login'

function HomePage() {
  return (
    <div style={{ backgroundColor: '#E8F8E8' }}>
      <Component />

      {/* HERO */}
      <div
        className="hero min-h-screen"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="hero-overlay" />
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-3xl mt-20">
            <h1 className="mb-2 text-5xl font-bold">Sembramos educación</h1>
            <h1 className="mb-2 text-5xl font-bold">Cultivamos confianza</h1>
            <h1 className="mb-5 text-5xl font-bold">Cosechamos bienestar</h1>
            <p className="mb-5">
              En Fintiva, creemos en el poder de la educación y la confianza para transformar vidas.
            </p>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ backgroundColor: '#E91E63', borderColor: '#E91E63' }}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>

      {/* NOSOTROS */}
      <section id="nosotros" className="min-h-screen scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-4">Nosotros</h2>
          <p className="mb-6">
            FINTIVA “Finanzas que Incentivan” es una agencia crediticia y de asesoría financiera
            mexicana que busca que los agricultores desarrollen educación financiera para
            generar un perfil adecuado y volverse candidatos a créditos y beneficios de
            entidades financieras. El sistema opera con la guía presencial de un FINTIVADOR
            (Financiero Incentivador) de manera trimestral, quien recopila y filtra la información
            económica para registrarla y compartirla con instituciones que puedan ofrecer
            beneficios a largo plazo.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow p-6">
              <h3 className="font-semibold mb-2">Misión</h3>
              <p>
                Liderar hacía la autonomía a los agricultores del país, brindándoles educación
                financiera y acceso a mejores oportunidades.
              </p>
            </div>

            <div className="card bg-base-100 shadow p-6">
              <h3 className="font-semibold mb-2">Visión</h3>
              <p>Ser el aliado #1 en bienestar financiero educativo en el país, buscando los mejores beneficios para nuestros usuarios y sus perfiles.</p>
            </div>

            <div className="card bg-base-100 shadow p-6">
              <h3 className="font-semibold mb-2">Valores</h3>
              <p>Confianza, transparencia, aprendizaje continuo, comunicación y satisfacción.</p>
            </div>
          </div>
        </div>
      </section>

      {/* OBJETIVO */}
      <section id="objetivo" className="min-h-screen bg-white scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-4">Objetivo</h2>
          <p className="mb-6">
            Acompañar a usuarios desde cero hasta la toma de decisiones financieras
            informadas mediante módulos, retos y seguimiento, con el objetivo de fomentar la autonomía y la digitalización financiera en sectores agrícolas.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Contenido modular (ahorro, presupuesto, crédito, inversiones).</li>
            <li>Panel de progreso y badges por logros.</li>
            <li>Simuladores sencillos para metas y deudas.</li>
          </ul>

      <section aria-label="Banner" className="relative w-full h-[40vh] md:h-[55vh]">
        <img
          src={middleBanner}
          alt="Agricultor trabajando en el campo"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay opcional para contraste del texto o para oscurecer */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Texto opcional encima */}
        {/* 
        <div className="relative z-10 h-full flex items-center justify-center">
          <h3 className="text-white text-3xl md:text-4xl font-bold drop-shadow">
            Educación financiera para el campo
          </h3>
        </div> 
        */}
      </section>

        </div>
      </section>


      {/* FAQ */}
      <section id="faq" className="min-h-screen scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-6">FAQ</h2>

          <div className="join join-vertical w-full">
            <div className="collapse collapse-plus join-item bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                ¿La plataforma es gratuita?
              </div>
              <div className="collapse-content">
                <p>Sí, la plataforma es completamente gratuita para los usuarios, sin costos ocultos ni micro transacciones.</p>
              </div>
            </div>

            <div className="collapse collapse-plus join-item bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                ¿Qué necesito para registrarme?
              </div>
              <div className="collapse-content">
                <p>Uno de nuestros FINTIVADORES acudirá a tu domicilio para ayudarte con el registro y recolección de información al estar interesado, para proceder con la asesoría de este mismo y poder prepararse adecuadamente para poder aprovechar al máximo la plataforma.</p>
              </div>
            </div>

            <div className="collapse collapse-plus join-item bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                ¿Hay garantía de satisfacción?
              </div>
              <div className="collapse-content">
                <p>Claro. FINTIVA busca los mejores beneficios en base a su perfil y expectativas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/cultivos" element={<Cultivos />} />
        <Route path="/parcelas" element={<Parcelas />} />
      </Routes>
    </Router>
  )
}

export default App
