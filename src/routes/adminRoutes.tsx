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
    return <Navigate to="/student-info" replace />
  }
  
  return <>{children}</>
}

export function AdminRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/student-info" replace /> : <Login />} 
        />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/student-info" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai-chatbot" element={<ChatbotInterface />} />
          <Route path="student-info" element={<StudentInfo />} />
          <Route path="khai-bao-hoat-dong" element={<KhaiBaoHoatDong />} />
          <Route path="quan-ly-su-kien-tham-gia" element={<QuanLySuKienThamGia />} />
          <Route path="quan-ly-DRL" element={<QuanLyDRL />} />          
          {/* Role-protected route - only class leaders can access */}
          <Route 
            path="quan-ly-thanh-vien" 
            element={
              <RoleProtectedRoute allowedRoles={['class_leader']}>
                <QuanLyThanhVien />
              </RoleProtectedRoute>
            } 
          />
          
          <Route path="settings" element={<SettingsPage />} />
          <Route path="menu1" element={<Navigate to="/menu1/submenu1" replace />} />
          <Route path="menu1/submenu1" element={<Submenu1 />} />
          <Route path="menu1/submenu2" element={<Submenu2 />} />
        </Route>
        
        {/* Catch all - redirect to login if not authenticated, student-info if authenticated */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/student-info" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}