import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, User } from '@/service/authService'

export type UserRole = 'student' | 'class_leader' | 'teacher' | 'admin' | 'teacher' | 'admin'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data - fallback cho trường hợp API không hoạt động
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Đạt',
    username: 'student',
    role: 'student'
  },
  {
    id: '2', 
    name: 'Duy',
    username: 'leader',
    role: 'class_leader'
  },
  {
    id: '3',
    name: 'Admin',
    username: 'admin',
    role: 'admin'
  },
  {
    id: '4',
    name: 'Teacher',
    username: 'teacher',
    role: 'teacher'
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Khôi phục session khi khởi tạo
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Kiểm tra xem có token trong localStorage không
        if (authService.hasValidToken()) {
          // Lấy thông tin user từ API hoặc token
          const userInfo = await authService.getUserInfo()
          if (userInfo) {
            setUser(userInfo)
          } else {
            // Token không hợp lệ, xóa token
            authService.logout()
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    try {
      // Thử đăng nhập qua API trước
      const result = await authService.login(username, password)
      
      if (result.success) {        // Lấy thông tin user sau khi đăng nhập thành công
        const userInfo = await authService.getUserInfo()
        if (userInfo) {
          // Cho phép tất cả các role truy cập
          setUser(userInfo)
          return { success: true, message: result.message }
        } else {
          return { success: false, message: 'Không thể lấy thông tin người dùng' }
        }
      } else {
        // Nếu API fail, fallback sang mock data
        console.warn('API login failed, trying mock login...')
        return await mockLogin(username, password)
      }
    } catch (error) {
      console.error('API login error, falling back to mock:', error)
      // Fallback sang mock data khi có lỗi API
      return await mockLogin(username, password)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock login function cho trường hợp API không hoạt động
  const mockLogin = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
      // Mock credentials
    const mockCredentials = [
      { username: 'student', password: '123456', userId: '1' },
      { username: 'leader', password: '123456', userId: '2' },
      { username: 'admin', password: '123456', userId: '3' },
      { username: 'teacher', password: '123456', userId: '4' },
      { username: 'student@example.com', password: '123456', userId: '1' },
      { username: 'leader@example.com', password: '123456', userId: '2' },
      { username: 'admin@example.com', password: '123456', userId: '3' },
      { username: 'teacher@example.com', password: '123456', userId: '4' }
    ]
    
    const credential = mockCredentials.find(
      cred => cred.username === username && cred.password === password
    )
    
    if (credential) {
      const mockUser = mockUsers.find(user => user.id === credential.userId)
      if (mockUser) {
        setUser(mockUser)
        localStorage.setItem('user', JSON.stringify(mockUser))
        // Lưu mock token để giả lập
        localStorage.setItem('access_token', 'mock_token_' + Date.now())
        return { success: true, message: 'Đăng nhập thành công (Mock)' }
      }
    }
    
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
