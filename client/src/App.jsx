import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home, Layout } from "./routes";
import Register from './pages/auth/Register';
import RoleSelection from './pages/auth/RoleSelection';
import CustomerRegister from './pages/auth/CustomerRegister';
import TravelAgencyRegister from './pages/auth/TravelAgencyRegister';
import Login from './pages/auth/Login';
import PendingApproval from './pages/auth/PendingApproval';
import SearchResults from './pages/search/SearchResults';
import MapPage from './pages/map/MapPage';
import ScraperToolsPage from './pages/scraper/ScraperToolsPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './pages/profile/UserProfile';
import UserManagement from './pages/admin/UserManagement';
import AdminTools from './pages/admin/AdminTools';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AgencyDashboard from './pages/dashboard/AgencyDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import PackageComparison from './pages/packages/PackageComparison';
import AboutPage from './pages/about/AboutPage';
import ApiDebug from './pages/debug/ApiDebug';
import TestPage from './pages/test/TestPage';
import FeedbackPage from './pages/feedback/FeedbackPage';
import ContactPage from './pages/contact/ContactPage';
import ManagePackages from './pages/dashboard/ManagePackages';
import DashboardLayout from './components/dashboard/DashboardLayout';
import UserDashboardSidebar from './pages/dashboard/UserDashboardSidebar';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* <Navigation /> Removed, sidebar is now the only navigation */}
          <Routes>
            <Route path="/"
              element={
                <DashboardLayout title="Home">
                  <Home />
                </DashboardLayout>
              }
            />
            <Route path="/search"
              element={
                <DashboardLayout title="Search Results">
                  <SearchResults />
                </DashboardLayout>
              }
            />
            <Route path="/map"
              element={
                <DashboardLayout title="Map">
                  <MapPage />
                </DashboardLayout>
              }
            />
            <Route path="/packages"
              element={
                <DashboardLayout title="Packages">
                  <PackageComparison />
                </DashboardLayout>
              }
            />
            <Route path="/packages/manage"
              element={
                <ProtectedRoute allowedRoles={['travel_agency', 'admin']}>
                  <DashboardLayout title="Manage Packages">
                    <ManagePackages />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/about"
              element={
                <DashboardLayout title="About">
                  <AboutPage />
                </DashboardLayout>
              }
            />
            <Route path="/debug"
              element={
                <DashboardLayout title="API Debug">
                  <ApiDebug />
                </DashboardLayout>
              }
            />
            <Route path="/test"
              element={
                <DashboardLayout title="Test Page">
                  <TestPage />
                </DashboardLayout>
              }
            />
            <Route path="/feedback"
              element={
                <DashboardLayout title="Feedback">
                  <FeedbackPage />
                </DashboardLayout>
              }
            />
            <Route path="/contact"
              element={
                <DashboardLayout title="Contact">
                  <ContactPage />
                </DashboardLayout>
              }
            />
            <Route path="/scraper-tools"
              element={
                <DashboardLayout title="Scraper Tools">
                  <ScraperToolsPage />
                </DashboardLayout>
              }
            />
            <Route path="/register" element={<RoleSelection />} />
            <Route path="/register/user" element={<CustomerRegister />} />
            <Route path="/register/travel_agency" element={<TravelAgencyRegister />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout title="Profile">
                    <UserProfile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <DashboardLayout title="User Management">
                    <UserManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tools"
              element={
                <ProtectedRoute adminOnly={true}>
                  <DashboardLayout title="Admin Tools">
                    <AdminTools />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <DashboardLayout title="Admin Dashboard">
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/agency"
              element={
                <ProtectedRoute allowedRoles={['travel_agency', 'admin']}>
                  <DashboardLayout title="Agency Dashboard">
                    <AgencyDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <DashboardLayout title="User Dashboard" rightSidebar={<UserDashboardSidebar />}>
                    <UserDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
