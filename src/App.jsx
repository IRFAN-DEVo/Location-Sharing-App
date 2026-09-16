import { Navigate, Route, Routes } from 'react-router-dom';
import LocationSharingPage from './pages/LocationSharingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LocationSharingPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
