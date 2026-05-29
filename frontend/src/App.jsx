/**
 * App — top-level component declaring every route of the SPA.
 *
 * Layout: Navbar / page outlet / Footer. The Navbar and Footer appear
 * on every page; the actual page is decided by react-router based on
 * the URL.
 *
 * Routes are grouped in three layers:
 *  - Public        : anyone can visit (Home, Vehicles, Login...)
 *  - Authenticated : require a Sanctum token (Profile, MyReservations, Booking)
 *  - Staff         : require role=gestionnaire OR proprietaire (/dashboard/*)
 */
import { Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Public pages
import Home          from './pages/Home.jsx'
import Vehicles      from './pages/Vehicles.jsx'
import VehicleDetail from './pages/VehicleDetail.jsx'
import Agencies      from './pages/Agencies.jsx'
import Login         from './pages/Login.jsx'
import Register      from './pages/Register.jsx'

// Authenticated pages
import Booking         from './pages/Booking.jsx'
import Profile         from './pages/Profile.jsx'
import MyReservations  from './pages/MyReservations.jsx'

// Dashboard (staff)
import DashboardLayout  from './pages/dashboard/DashboardLayout.jsx'
import Overview         from './pages/dashboard/Overview.jsx'
import Fleet            from './pages/dashboard/Fleet.jsx'
import Reservations     from './pages/dashboard/Reservations.jsx'
import Documents        from './pages/dashboard/Documents.jsx'
import AgenciesAdmin    from './pages/dashboard/AgenciesAdmin.jsx'
import Users            from './pages/dashboard/Users.jsx'

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-cream">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          {/* ---- PUBLIC ----------------------------------------------- */}
          <Route path="/"                element={<Home />} />
          <Route path="/vehicles"        element={<Vehicles />} />
          <Route path="/vehicles/:id"    element={<VehicleDetail />} />
          <Route path="/agencies"        element={<Agencies />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />

          {/* ---- AUTHENTICATED --------------------------------------- */}
          <Route path="/booking/:vehicleId" element={
            <ProtectedRoute><Booking /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/my-reservations" element={
            <ProtectedRoute><MyReservations /></ProtectedRoute>
          } />

          {/* ---- STAFF DASHBOARD ------------------------------------- */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['gestionnaire', 'proprietaire']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index                 element={<Overview />} />
            <Route path="fleet"          element={<Fleet />} />
            <Route path="reservations"   element={<Reservations />} />
            <Route path="documents"      element={<Documents />} />
            <Route path="agencies" element={
              <ProtectedRoute roles={['proprietaire']}>
                <AgenciesAdmin />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute roles={['proprietaire']}>
                <Users />
              </ProtectedRoute>
            } />
          </Route>

          {/* ---- 404 ------------------------------------------------- */}
          <Route path="*" element={
            <div className="container py-5 text-center">
              <h1 className="display-1 fw-bold" style={{ color: 'var(--gold)' }}>404</h1>
              <p className="text-muted">La page que vous cherchez n'existe pas.</p>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
