import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import MobileTopBar from './components/MobileTopBar';
import AmbientBackground from './components/AmbientBackground';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Signup from './pages/Signup';

function AppShell() {
  return (
    <>
      <AmbientBackground />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
          <MobileTopBar />
          <div className="p-4 sm:p-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </div>
        </main>
      </div>
      <MobileNav />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
