import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useTheme } from './context/ThemeContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import ComingSoon from './pages/dashboard/ComingSoon.jsx';
import Overview from './pages/dashboard/Overview.jsx';
import Users from './pages/dashboard/Users.jsx';
import Landing from './pages/Landing/Landing.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicOnlyRoute from './routes/PublicOnlyRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import { PENDING_ITEMS } from './utils/navigation.js';

export default function App() {
  const { theme } = useTheme();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/registro" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="usuarios" element={<RoleRoute roles={['admin']}><Users /></RoleRoute>} />
          {PENDING_ITEMS.map((item) => (
            <Route
              key={item.to}
              path={item.to.replace('/app/', '')}
              element={
                <RoleRoute roles={item.roles}>
                  <ComingSoon title={item.label} icon={item.icon} phase={item.phase} />
                </RoleRoute>
              }
            />
          ))}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3500} theme={theme} />
    </>
  );
}
