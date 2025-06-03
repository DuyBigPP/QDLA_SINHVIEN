import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { useAuth } from "@/context/AuthContext"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import AnalyticsPage from "@/pages/analytics/AnalyticsPage"
import SettingsPage from "@/pages/settings/SettingsPage"
import ChatbotInterface from "@/pages/AICHATBOT/index.tsx"
import Submenu1 from "@/pages/menu1/submenu1"
import Submenu2 from "@/pages/menu1/submenu2"
import StudentInfo from "@/pages/student_info/index.tsx"
import KhaiBaoHoatDong from "@/pages/khai_bao_hoat_dong/index.tsx"
import QuanLySuKienThamGia from "@/pages/quan_ly_su_kien_tham_gia/index.tsx"
import QuanLyThanhVien from "@/pages/quan_ly_thanh_vien/index.tsx"
import Login from "@/pages/login/index.tsx"
import QuanLyDRL from "@/pages/quan_ly_DRL/index.tsx"
import QuanLyNguoiDung from "@/pages/quan_ly_nguoi_dung/index.tsx"
import AdminDashboard from "@/pages/admin_dashboard/index.tsx"
import QuanLyMinhChung from "@/pages/quan_ly_minh_chung/index.tsx"
import QuanLyTaiKhoan from "@/pages/quan_ly_tai_khoan/index.tsx"
// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Role-based Route Component
function RoleProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode
  allowedRoles: string[]
}) {
  const { user } = useAuth()
  
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user?.role === 'admin' || user?.role === 'teacher') {
      return <Navigate to="/admin-dashboard" replace />
    } else {
      return <Navigate to="/student-info" replace />
    }
  }
  
  return <>{children}</>
}

export function AdminRoutes() {
  const { isAuthenticated, user } = useAuth()

  // Default redirect based on user role
  const getDefaultRedirect = () => {
    if (!user) return "/login"
    if (user.role === 'admin' || user.role === 'teacher') {
      return "/admin-dashboard"
    }
    return "/student-info"
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Login />} 
        />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to={getDefaultRedirect()} replace />} />
          
          {/* Student & Class Leader Routes */}
          <Route 
            path="student-info" 
            element={
              <RoleProtectedRoute allowedRoles={['student', 'class_leader']}>
                <StudentInfo />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="khai-bao-hoat-dong" 
            element={
              <RoleProtectedRoute allowedRoles={['student', 'class_leader']}>
                <KhaiBaoHoatDong />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="quan-ly-su-kien-tham-gia" 
            element={
              <RoleProtectedRoute allowedRoles={['student', 'class_leader']}>
                <QuanLySuKienThamGia />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="quan-ly-DRL" 
            element={
              <RoleProtectedRoute allowedRoles={['student', 'class_leader']}>
                <QuanLyDRL />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Class Leader Only Route */}
          <Route 
            path="quan-ly-thanh-vien" 
            element={
              <RoleProtectedRoute allowedRoles={['class_leader']}>
                <QuanLyThanhVien />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Admin & Teacher Routes */}
          <Route 
            path="admin-dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="quan-ly-nguoi-dung" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                <QuanLyNguoiDung />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="quan-ly-minh-chung" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                <QuanLyMinhChung />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Admin Only Route */}
          <Route 
            path="quan-ly-tai-khoan" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <QuanLyTaiKhoan />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Legacy routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai-chatbot" element={<ChatbotInterface />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="menu1" element={<Navigate to="/menu1/submenu1" replace />} />
          <Route path="menu1/submenu1" element={<Submenu1 />} />
          <Route path="menu1/submenu2" element={<Submenu2 />} />
        </Route>
        
        {/* Catch all - redirect based on authentication and role */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to={getDefaultRedirect()} replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}