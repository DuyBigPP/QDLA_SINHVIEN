import React from "react"
import { BarChart2, /* List, ChevronRight, */ Users, Calendar, FileText} from "lucide-react"
import { UserRole } from "@/context/AuthContext"

export type MenuItem = {
  label: string
  path: string
  icon: React.ReactNode
  // Optional children for submenus
  children?: MenuItem[]
  // Roles that can access this menu item
  allowedRoles?: UserRole[]
}

export const menuItems: MenuItem[] = [
  // Student & Class Leader menus
  { 
    label: "Thông tin sinh viên", 
    path: "/student-info", 
    icon: <BarChart2 size={16} />,
    allowedRoles: ['student', 'class_leader']
  },
  { 
    label: "Khai báo hoạt động", 
    path: "/khai-bao-hoat-dong", 
    icon: <FileText size={16} />,
    allowedRoles: ['student', 'class_leader']
  },
  { 
    label: "Quản lý ĐRL", 
    path: "/quan-ly-DRL", 
    icon: <FileText size={16} />,
    allowedRoles: ['student', 'class_leader']
  },
  { 
    label: "Quản lý sự kiện tham gia", 
    path: "/quan-ly-su-kien-tham-gia", 
    icon: <Calendar size={16} />,
    allowedRoles: ['student', 'class_leader']
  },
  
  // Class Leader only
  { 
    label: "Quản lý thành viên", 
    path: "/quan-ly-thanh-vien", 
    icon: <Users size={16} />,
    allowedRoles: ['class_leader']
  },

  // Admin & Teacher menus
  { 
    label: "Dashboard", 
    path: "/admin-dashboard", 
    icon: <BarChart2 size={16} />,
    allowedRoles: ['admin', 'teacher']
  },
  { 
    label: "Thông tin giảng viên", 
    path: "/teacher-info", 
    icon: <Users size={16} />,
    allowedRoles: ['teacher']
  },
  { 
    label: "Quản lý người dùng", 
    path: "/quan-ly-nguoi-dung", 
    icon: <Users size={16} />,
    allowedRoles: ['admin']
  },
  { 
    label: "Đầu mục DRL", 
    path: "/dau-muc-drl", 
    icon: <FileText size={16} />,
    allowedRoles: ['admin']
  },
  { 
    label: "Phê duyệt ĐRL", 
    path: "/quan-ly-minh-chung", 
    icon: <FileText size={16} />,
    allowedRoles: ['teacher']
  },
/*   { 
    label: "Quản lý tài khoản", 
    path: "/quan-ly-tai-khoan", 
    icon: <Users size={16} />,
    allowedRoles: ['admin']
  }, */
]

// Helper function to filter menu items based on user role
export const getFilteredMenuItems = (userRole: UserRole | undefined): MenuItem[] => {
  if (!userRole) return []
  
  return menuItems.filter(item => {
    // Check if user role is allowed for this menu item
    if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
      return false
    }
    
    // If item has children, filter them too
    if (item.children) {
      item.children = item.children.filter(child => 
        !child.allowedRoles || child.allowedRoles.includes(userRole)
      )
    }
    
    return true
  })
}