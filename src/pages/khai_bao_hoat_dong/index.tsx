import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { CalendarIcon, Plus, Eye, Check, X, Filter } from 'lucide-react'
import { format } from 'date-fns'

// Types
interface Activity {
  id: string
  studentId: string
  studentName: string
  title: string
  description: string
  category: 'hoc_tap' | 'the_thao' | 'van_hoa' | 'tinh_nguyen' | 'khac'
  date: Date
  hours: number
  status: 'pending' | 'approved' | 'rejected'
  evidence?: string
  note?: string
  createdAt: Date
}

// Mock data
const mockActivities: Activity[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Nguyễn Văn A',
    title: 'Tham gia cuộc thi lập trình',
    description: 'Tham gia cuộc thi lập trình cấp khoa, đạt giải 3',
    category: 'hoc_tap',
    date: new Date('2024-03-15'),
    hours: 8,
    status: 'approved',
    evidence: 'Giấy chứng nhận giải 3',
    createdAt: new Date('2024-03-16')
  },
  {
    id: '2',
    studentId: '1',
    studentName: 'Nguyễn Văn A',
    title: 'Hoạt động thiện nguyện',
    description: 'Tham gia hoạt động dọn dẹp môi trường tại trường',
    category: 'tinh_nguyen',
    date: new Date('2024-03-20'),
    hours: 4,
    status: 'pending',
    evidence: 'Ảnh hoạt động',
    createdAt: new Date('2024-03-21')
  },
  {
    id: '3',
    studentId: '2',
    studentName: 'Trần Thị B',
    title: 'Tổ chức sự kiện lớp',
    description: 'Tổ chức sinh nhật tập thể cho lớp',
    category: 'van_hoa',
    date: new Date('2024-03-18'),
    hours: 6,
    status: 'approved',
    evidence: 'Ảnh sự kiện',
    createdAt: new Date('2024-03-19')
  },
  {
    id: '4',
    studentId: '3',
    studentName: 'Lê Văn C',
    title: 'Tham gia bóng đá',
    description: 'Tham gia giải bóng đá khoa',
    category: 'the_thao',
    date: new Date('2024-03-22'),
    hours: 3,
    status: 'pending',
    evidence: 'Video thi đấu',
    createdAt: new Date('2024-03-23')
  }
]

const categories = {
  hoc_tap: 'Học tập',
  the_thao: 'Thể thao',
  van_hoa: 'Văn hóa',
  tinh_nguyen: 'Tình nguyện',
  khac: 'Khác'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối'
}

const KhaiBaoHoatDong = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Form state
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    category: '',
    date: undefined as Date | undefined,
    hours: '',
    evidence: ''
  })

  // Filter activities based on user role
  const filteredActivities = activities.filter(activity => {
    // Role-based filtering
    if (user?.role === 'student' && activity.studentId !== user.id) {
      return false
    }
    
    // Status filtering
    if (filterStatus !== 'all' && activity.status !== filterStatus) {
      return false
    }
    
    // Category filtering
    if (filterCategory !== 'all' && activity.category !== filterCategory) {
      return false
    }
    
    return true
  })

  const handleSubmitActivity = () => {
    if (!newActivity.title || !newActivity.category || !newActivity.date || !newActivity.hours) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }    const activity: Activity = {
      id: Date.now().toString(),
      studentId: user?.id || '1',
      studentName: user?.name || 'Unknown',
      title: newActivity.title,
      description: newActivity.description,
      category: newActivity.category as Activity['category'],
      date: newActivity.date,
      hours: parseInt(newActivity.hours),
      status: 'pending',
      evidence: newActivity.evidence,
      createdAt: new Date()
    }

    setActivities([...activities, activity])
    setNewActivity({
      title: '',
      description: '',
      category: '',
      date: undefined,
      hours: '',
      evidence: ''
    })
    setIsDialogOpen(false)
    toast.success('Khai báo hoạt động thành công!')
  }

  const handleApproveActivity = (activityId: string) => {
    setActivities(activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, status: 'approved' as const }
        : activity
    ))
    toast.success('Đã phê duyệt hoạt động')
  }

  const handleRejectActivity = (activityId: string) => {
    setActivities(activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, status: 'rejected' as const }
        : activity
    ))
    toast.success('Đã từ chối hoạt động')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Khai báo hoạt động</h1>
          <p className="text-muted-foreground">
            {user?.role === 'class_leader' 
              ? 'Quản lý và phê duyệt hoạt động của sinh viên'
              : 'Khai báo các hoạt động ngoại khóa của bạn'
            }
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Khai báo hoạt động
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Khai báo hoạt động mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên hoạt động</Label>
                <Input
                  id="title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  placeholder="Nhập tên hoạt động"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="Mô tả chi tiết hoạt động"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại hoạt động</Label>
                  <Select 
                    value={newActivity.category} 
                    onValueChange={(value) => setNewActivity({...newActivity, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại hoạt động" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hours">Số giờ</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={newActivity.hours}
                    onChange={(e) => setNewActivity({...newActivity, hours: e.target.value})}
                    placeholder="Số giờ tham gia"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Ngày thực hiện</Label>
                <Popover>                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newActivity.date ? format(newActivity.date, 'dd/MM/yyyy') : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newActivity.date}
                      onSelect={(date) => setNewActivity({...newActivity, date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="evidence">Minh chứng</Label>
                <Input
                  id="evidence"
                  value={newActivity.evidence}
                  onChange={(e) => setNewActivity({...newActivity, evidence: e.target.value})}
                  placeholder="Mô tả minh chứng (ảnh, giấy chứng nhận...)"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmitActivity}>
                  Khai báo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Loại hoạt động</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(categories).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hoạt động</CardTitle>
          <CardDescription>
            {user?.role === 'class_leader' 
              ? `Tổng cộng ${filteredActivities.length} hoạt động`
              : `Bạn đã khai báo ${filteredActivities.length} hoạt động`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {user?.role === 'class_leader' && <TableHead>Sinh viên</TableHead>}
                <TableHead>Tên hoạt động</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  {user?.role === 'class_leader' && (
                    <TableCell className="font-medium">{activity.studentName}</TableCell>
                  )}
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories[activity.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(activity.date, 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{activity.hours}h</TableCell>
                  <TableCell>
                    <Badge className={statusColors[activity.status]}>
                      {statusLabels[activity.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedActivity(activity)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {user?.role === 'class_leader' && activity.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveActivity(activity.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectActivity(activity.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không có hoạt động nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Detail Dialog */}
      {selectedActivity && (
        <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết hoạt động</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tên hoạt động</Label>
                  <p className="text-sm">{selectedActivity.title}</p>
                </div>
                {user?.role === 'class_leader' && (
                  <div>
                    <Label className="text-sm font-medium">Sinh viên</Label>
                    <p className="text-sm">{selectedActivity.studentName}</p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <p className="text-sm">{selectedActivity.description}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Loại hoạt động</Label>
                  <Badge variant="outline" className="mt-1">
                    {categories[selectedActivity.category]}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ngày thực hiện</Label>
                  <p className="text-sm">{format(selectedActivity.date, 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Số giờ</Label>
                  <p className="text-sm">{selectedActivity.hours} giờ</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Trạng thái</Label>
                <div className="mt-1">
                  <Badge className={statusColors[selectedActivity.status]}>
                    {statusLabels[selectedActivity.status]}
                  </Badge>
                </div>
              </div>
              
              {selectedActivity.evidence && (
                <div>
                  <Label className="text-sm font-medium">Minh chứng</Label>
                  <p className="text-sm">{selectedActivity.evidence}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Ngày khai báo</Label>
                <p className="text-sm">{format(selectedActivity.createdAt, 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default KhaiBaoHoatDong

