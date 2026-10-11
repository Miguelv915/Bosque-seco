import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/public/HomePage';
import LugaresPage from '../pages/public/LugaresPage';
import DestinationPage from '../pages/public/DestinationPage';
import RutasPage from '../pages/public/RutasPage';
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import AssociationPage from '../pages/public/AssociationPage';
import SpacePage from '../pages/public/SpacePage';
import SubspacePage from '../pages/public/SubspacePage';
import ProtectedRoute from '../features/auth/ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="lugares" element={<LugaresPage />} />
          <Route path="lugares/:id" element={<DestinationPage />} />
          <Route path="rutas" element={<RutasPage />} />
          <Route path="asociaciones/:slug" element={<AssociationPage />} />
          <Route path="espacios/:id" element={<SpacePage />} />
          <Route path="subespacios/:id" element={<SubspacePage />} />
        </Route>
        <Route path="admin/login" element={<LoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
