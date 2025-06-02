import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Plus, Search, Filter, Edit, Trash2, Phone, Mail, MapPin, Calendar, GraduationCap, Award, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

// Types
interface Student {
  id: string
  studentCode: string
  fullName: string
  email: string
  phone: string
  dateOfBirth: Date
  address: string
  major: string
  academicYear: string
  gpa: number
  status: 'active' | 'inactive' | 'graduated' | 'suspended'
  role: 'student' | 'class_leader' | 'vice_leader'
  joinDate: Date
  avatar?: string
  totalActivities: number
  totalHours: number
  notes?: string
}

// Mock data
const mockStudents: Student[] = [
  {
    id: '1',
    studentCode: 'SV001',
    fullName: 'Đạt',
    email: 'student@example.com',
    phone: '0123456789',
    dateOfBirth: new Date('2002-05-15'),
    address: 'Hà Nội',
    major: 'Công nghệ thông tin',
    academicYear: '2020-2024',
    gpa: 3.45,
    status: 'active',
    role: 'student',
    joinDate: new Date('2020-09-01'),
    totalActivities: 12,
    totalHours: 48,
    notes: 'Sinh viên tích cực tham gia các hoạt động'
  },
  {
    id: '2',
    studentCode: 'SV002',
    fullName: 'Duy',
    email: 'leader@example.com',
    phone: '0987654321',
    dateOfBirth: new Date('2002-03-20'),
    address: 'Hồ Chí Minh',
    major: 'Công nghệ thông tin',
    academicYear: '2020-2024',
    gpa: 3.85,
    status: 'active',
    role: 'class_leader',
    joinDate: new Date('2020-09-01'),
    totalActivities: 25,
    totalHours: 96,
    notes: 'Lớp trưởng nhiệm kỳ 2023-2024'
  },
  {
    id: '3',
    studentCode: 'SV003',
    fullName: 'Lê Văn C',
    email: 'lec@example.com',
    phone: '0369852147',
    dateOfBirth: new Date('2002-08-10'),
    address: 'Đà Nẵng',
    major: 'Công nghệ thông tin',
    academicYear: '2020-2024',
    gpa: 3.25,
    status: 'active',
    role: 'student',
    joinDate: new Date('2020-09-01'),
    totalActivities: 8,
    totalHours: 32,
    notes: 'Cần tăng cường tham gia hoạt động'
  },
  {
    id: '4',
    studentCode: 'SV004',
    fullName: 'Phạm Thị D',
    email: 'phamd@example.com',
    phone: '0147258369',
    dateOfBirth: new Date('2002-12-05'),
    address: 'Cần Thơ',
    major: 'Công nghệ thông tin',
    academicYear: '2020-2024',
    gpa: 3.65,
    status: 'active',
    role: 'vice_leader',
    joinDate: new Date('2020-09-01'),
    totalActivities: 18,
    totalHours: 72,
    notes: 'Lớp phó học tập'
  },
  {
    id: '5',
    studentCode: 'SV005',
    fullName: 'Hoàng Văn E',
    email: 'hoange@example.com',
    phone: '0258147963',
    dateOfBirth: new Date('2002-07-22'),
    address: 'Hải Phòng',
    major: 'Công nghệ thông tin',
    academicYear: '2020-2024',
    gpa: 2.85,
    status: 'suspended',
    role: 'student',
    joinDate: new Date('2020-09-01'),
    totalActivities: 3,
    totalHours: 12,
    notes: 'Đình chỉ học tập do vi phạm nội quy'
  },
  {
    id: '6',
    studentCode: 'SV006',
    fullName: 'Vũ Thị F',
    email: 'vuf@example.com',
    phone: '0741852963',
    dateOfBirth: new Date('2001-11-18'),
    address: 'Nghệ An',
    major: 'Công nghệ thông tin',
    academicYear: '2019-2023',
    gpa: 3.95,
    status: 'graduated',
    role: 'student',
    joinDate: new Date('2019-09-01'),
    totalActivities: 35,
    totalHours: 140,
    notes: 'Tốt nghiệp loại xuất sắc'
  }
]

const statusLabels = {
  active: 'Đang học',
  inactive: 'Tạm nghỉ',
  graduated: 'Đã tốt nghiệp',
  suspended: 'Đình chỉ'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  graduated: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800'
}

const roleLabels = {
  student: 'Sinh viên',
  class_leader: 'Lớp trưởng',
  vice_leader: 'Lớp phó'
}

const roleColors = {
  student: 'bg-gray-100 text-gray-800',
  class_leader: 'bg-purple-100 text-purple-800',
  vice_leader: 'bg-indigo-100 text-indigo-800'
}

const QuanLyThanhVien = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')

  // Form state for adding/editing student
  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    major: 'Công nghệ thông tin',
    academicYear: '2020-2024',
    gpa: '',
    status: 'active' as Student['status'],
    role: 'student' as Student['role'],
    notes: ''
  })

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    const matchesRole = filterRole === 'all' || student.role === filterRole
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const resetForm = () => {
    setFormData({
      studentCode: '',
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      major: 'Công nghệ thông tin',
      academicYear: '2020-2024',
      gpa: '',
      status: 'active',
      role: 'student',
      notes: ''
    })
  }

  const handleAddStudent = () => {
    if (!formData.studentCode || !formData.fullName || !formData.email) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    // Check if student code exists
    if (students.some(s => s.studentCode === formData.studentCode)) {
      toast.error('Mã sinh viên đã tồn tại')
      return
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      studentCode: formData.studentCode,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: new Date(formData.dateOfBirth),
      address: formData.address,
      major: formData.major,
      academicYear: formData.academicYear,
      gpa: parseFloat(formData.gpa) || 0,
      status: formData.status,
      role: formData.role,
      joinDate: new Date(),
      totalActivities: 0,
      totalHours: 0,
      notes: formData.notes
    }

    setStudents([...students, newStudent])
    setIsAddDialogOpen(false)
    resetForm()
    toast.success('Thêm sinh viên thành công!')
  }

  const handleEditStudent = () => {
    if (!selectedStudent || !formData.studentCode || !formData.fullName || !formData.email) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    // Check if student code exists (excluding current student)
    if (students.some(s => s.studentCode === formData.studentCode && s.id !== selectedStudent.id)) {
      toast.error('Mã sinh viên đã tồn tại')
      return
    }

    const updatedStudent: Student = {
      ...selectedStudent,
      studentCode: formData.studentCode,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: new Date(formData.dateOfBirth),
      address: formData.address,
      major: formData.major,
      academicYear: formData.academicYear,
      gpa: parseFloat(formData.gpa) || 0,
      status: formData.status,
      role: formData.role,
      notes: formData.notes
    }

    setStudents(students.map(s => s.id === selectedStudent.id ? updatedStudent : s))
    setIsEditDialogOpen(false)
    setSelectedStudent(null)
    resetForm()
    toast.success('Cập nhật thông tin thành công!')
  }

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      setStudents(students.filter(s => s.id !== studentId))
      toast.success('Xóa sinh viên thành công!')
    }
  }

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student)
    setFormData({
      studentCode: student.studentCode,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      dateOfBirth: format(student.dateOfBirth, 'yyyy-MM-dd'),
      address: student.address,
      major: student.major,
      academicYear: student.academicYear,
      gpa: student.gpa.toString(),
      status: student.status,
      role: student.role,
      notes: student.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  // Statistics
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    graduated: students.filter(s => s.status === 'graduated').length,
    suspended: students.filter(s => s.status === 'suspended').length,
    averageGPA: students.length > 0 ? (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(2) : '0.00'
  }

  // Check if current user is class leader
  if (user?.role !== 'class_leader') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Không có quyền truy cập</h2>
          <p className="text-muted-foreground">Chỉ lớp trưởng mới có thể truy cập trang này.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý thành viên lớp</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và hoạt động của các thành viên trong lớp
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sinh viên
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm sinh viên mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentCode">Mã sinh viên *</Label>
                  <Input
                    id="studentCode"
                    value={formData.studentCode}
                    onChange={(e) => setFormData({...formData, studentCode: e.target.value})}
                    placeholder="VD: SV007"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0123456789"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa}
                    onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                    placeholder="3.50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Nhập địa chỉ"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chuyên ngành</Label>
                  <Select value={formData.major} onValueChange={(value) => setFormData({...formData, major: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Công nghệ thông tin">Công nghệ thông tin</SelectItem>
                      <SelectItem value="Khoa học máy tính">Khoa học máy tính</SelectItem>
                      <SelectItem value="Hệ thống thông tin">Hệ thống thông tin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Khóa học</Label>
                  <Select value={formData.academicYear} onValueChange={(value) => setFormData({...formData, academicYear: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2020-2024">2020-2024</SelectItem>
                      <SelectItem value="2021-2025">2021-2025</SelectItem>
                      <SelectItem value="2022-2026">2022-2026</SelectItem>
                      <SelectItem value="2023-2027">2023-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value: Student['status']) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang học</SelectItem>
                      <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                      <SelectItem value="graduated">Đã tốt nghiệp</SelectItem>
                      <SelectItem value="suspended">Đình chỉ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <Select value={formData.role} onValueChange={(value: Student['role']) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Sinh viên</SelectItem>
                      <SelectItem value="class_leader">Lớp trưởng</SelectItem>
                      <SelectItem value="vice_leader">Lớp phó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Ghi chú thêm về sinh viên"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddStudent}>
                  Thêm sinh viên
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng số</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Đang học</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tốt nghiệp</p>
                <p className="text-2xl font-bold">{stats.graduated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Đình chỉ</p>
                <p className="text-2xl font-bold">{stats.suspended}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">GPA TB</p>
                <p className="text-2xl font-bold">{stats.averageGPA}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Tìm kiếm và lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, mã SV, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang học</SelectItem>
                  <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                  <SelectItem value="graduated">Tốt nghiệp</SelectItem>
                  <SelectItem value="suspended">Đình chỉ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="student">Sinh viên</SelectItem>
                  <SelectItem value="class_leader">Lớp trưởng</SelectItem>
                  <SelectItem value="vice_leader">Lớp phó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sinh viên ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sinh viên</TableHead>
                <TableHead>Mã SV</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Hoạt động</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} alt={student.fullName} />
                        <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-muted-foreground">{student.major}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{student.studentCode}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{student.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.gpa >= 3.5 ? 'default' : student.gpa >= 2.5 ? 'secondary' : 'destructive'}>
                      {student.gpa.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{student.totalActivities} hoạt động</p>
                      <p className="text-muted-foreground">{student.totalHours} giờ</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[student.status]}>
                      {statusLabels[student.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[student.role]}>
                      {roleLabels[student.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(student)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy sinh viên nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin sinh viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-studentCode">Mã sinh viên *</Label>
                <Input
                  id="edit-studentCode"
                  value={formData.studentCode}
                  onChange={(e) => setFormData({...formData, studentCode: e.target.value})}
                  placeholder="VD: SV007"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Họ và tên *</Label>
                <Input
                  id="edit-fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>
            
            {/* ...existing form fields... */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Số điện thoại</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="0123456789"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfBirth">Ngày sinh</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gpa">GPA</Label>
                <Input
                  id="edit-gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                  placeholder="3.50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Địa chỉ</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Nhập địa chỉ"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value: Student['status']) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang học</SelectItem>
                    <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                    <SelectItem value="graduated">Đã tốt nghiệp</SelectItem>
                    <SelectItem value="suspended">Đình chỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select value={formData.role} onValueChange={(value: Student['role']) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Sinh viên</SelectItem>
                    <SelectItem value="class_leader">Lớp trưởng</SelectItem>
                    <SelectItem value="vice_leader">Lớp phó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Ghi chú</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ghi chú thêm về sinh viên"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleEditStudent}>
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuanLyThanhVien



