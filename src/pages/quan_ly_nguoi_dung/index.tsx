import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { UserService } from '@/service/userService'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: number
  username: string
  role: 'student' | 'class_leader' | 'teacher' | 'admin'
  created_at: string
}

interface UserFormData {
  username: string
  password: string
  role: 'student' | 'class_leader' | 'teacher' | 'admin'
}

const QuanLyNguoiDung = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'student'
  })

  const roles = [
    { value: 'student', label: 'Sinh viên', color: 'bg-blue-100 text-blue-800' },
    { value: 'class_leader', label: 'Lớp trưởng', color: 'bg-green-100 text-green-800' },
    { value: 'teacher', label: 'Giảng viên', color: 'bg-purple-100 text-purple-800' },
    { value: 'admin', label: 'Quản trị viên', color: 'bg-red-100 text-red-800' }
  ]
  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage
      const params = {
        offset,
        limit: itemsPerPage,
        return_count: true,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(searchTerm && { search: searchTerm })
      }
      
      const response = await UserService.getAllUsers(params)
      
      if (response.success && response.data) {
        setUsers(response.data)
        // Assuming the API returns total count when return_count=true
        // You might need to adjust this based on actual API response
        setTotalUsers(response.data.length || 0)
      } else {
        toast.error(response.message || 'Không thể tải danh sách người dùng')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Lỗi khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, roleFilter, searchTerm])
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Handle create user
  const handleCreateUser = async () => {
    if (!formData.username || !formData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const response = await UserService.createUser(formData)
      
      if (response.success) {
        toast.success('Tạo người dùng thành công')
        setIsCreateDialogOpen(false)
        resetForm()
        loadUsers()
      } else {
        toast.error(response.message || 'Không thể tạo người dùng')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Lỗi khi tạo người dùng')
    }
  }

  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUser || !formData.username) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const updateData = {
        id: selectedUser.id,
        username: formData.username,
        role: formData.role,
        ...(formData.password && { password: formData.password })
      }
      
      const response = await UserService.updateUser(updateData)
      
      if (response.success) {
        toast.success('Cập nhật người dùng thành công')
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        resetForm()
        loadUsers()
      } else {
        toast.error(response.message || 'Không thể cập nhật người dùng')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Lỗi khi cập nhật người dùng')
    }
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await UserService.deleteUser(selectedUser.id)
      
      if (response.success) {
        toast.success('Xóa người dùng thành công')
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        loadUsers()
      } else {
        toast.error(response.message || 'Không thể xóa người dùng')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Lỗi khi xóa người dùng')
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'student'
    })
    setShowPassword(false)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      password: '',
      role: user.role
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const getRoleLabel = (role: string) => {
    const roleInfo = roles.find(r => r.value === role)
    return roleInfo ? roleInfo.label : role
  }

  const getRoleColor = (role: string) => {
    const roleInfo = roles.find(r => r.value === role)
    return roleInfo ? roleInfo.color : 'bg-gray-100 text-gray-800'
  }

  const totalPages = Math.ceil(totalUsers / itemsPerPage)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <UserPlus size={16} />
          Thêm người dùng
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tìm kiếm theo tên đăng nhập..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Vai trò</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role" className="w-[180px]">
                  <SelectValue placeholder="Tất cả vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limit">Hiển thị</Label>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger id="limit" className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadUsers} className="flex items-center gap-2">
              <RefreshCw size={16} />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({totalUsers})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Không có người dùng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil size={14} />
                            </Button>
                            {currentUser?.id !== user.id.toString() && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(user)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalUsers)} của {totalUsers} người dùng
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft size={16} />
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Sau
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản người dùng mới trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-username">Tên đăng nhập</Label>
              <Input
                id="create-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div>
              <Label htmlFor="create-password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>            <div>
              <Label htmlFor="create-role">Vai trò</Label>
              <Select value={formData.role} onValueChange={(value: 'student' | 'class_leader' | 'teacher' | 'admin') => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateUser}>
              Tạo người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Tên đăng nhập</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Mật khẩu mới (để trống nếu không đổi)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Nhập mật khẩu mới"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>            <div>
              <Label htmlFor="edit-role">Vai trò</Label>
              <Select value={formData.role} onValueChange={(value: 'student' | 'class_leader' | 'teacher' | 'admin') => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditUser}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.username}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default QuanLyNguoiDung