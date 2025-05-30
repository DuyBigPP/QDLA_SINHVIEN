import React from "react"
import { BarChart2, /* List, ChevronRight, */ Users, Calendar, FileText, MessageSquare } from "lucide-react"
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
  { 
    label: "AI Chat Bot", 
    path: "/ai-chatbot", 
    icon: <MessageSquare size={16} />,
    allowedRoles: ['student', 'class_leader']
  },
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
  { 
    label: "Quản lý thành viên", 
    path: "/quan-ly-thanh-vien", 
    icon: <Users size={16} />,
    allowedRoles: ['class_leader'] // Chỉ lớp trưởng mới thấy
  },
/*   {
    label: "Menu1",
    path: "/menu1",
    icon: <List size={16} />,
    allowedRoles: ['student', 'class_leader'],
    children: [
      { 
        label: "Submenu1", 
        path: "/menu1/submenu1", 
        icon: <ChevronRight size={16} />,
        allowedRoles: ['student', 'class_leader']
      },
      { 
        label: "Submenu2", 
        path: "/menu1/submenu2", 
        icon: <ChevronRight size={16} />,
        allowedRoles: ['student', 'class_leader']
      },
    ],
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