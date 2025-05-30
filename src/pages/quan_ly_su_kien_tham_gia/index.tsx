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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { CalendarIcon, Plus, Users, MapPin, Clock, Eye, UserPlus, UserMinus, Filter } from 'lucide-react'
import { format } from 'date-fns'

// Types
interface Event {
  id: string
  title: string
  description: string
  type: 'hoc_tap' | 'the_thao' | 'van_hoa' | 'tinh_nguyen' | 'khac'
  location: string
  startDate: Date
  endDate: Date
  maxParticipants: number
  currentParticipants: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  createdBy: string
  creatorName: string
  participants: Participant[]
  createdAt: Date
}

interface Participant {
  id: string
  studentId: string
  studentName: string
  email: string
  registeredAt: Date
  status: 'registered' | 'attended' | 'absent'
}

// Mock data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Cuộc thi lập trình Code War 2024',
    description: 'Cuộc thi lập trình dành cho sinh viên toàn khoa. Giải thưởng hấp dẫn cho top 3.',
    type: 'hoc_tap',
    location: 'Phòng máy tính A1.101',
    startDate: new Date('2024-04-15T08:00:00'),
    endDate: new Date('2024-04-15T17:00:00'),
    maxParticipants: 50,
    currentParticipants: 35,
    status: 'upcoming',
    createdBy: '2',
    creatorName: 'Trần Thị B',
    participants: [
      {
        id: '1',
        studentId: '1',
        studentName: 'Nguyễn Văn A',
        email: 'student@example.com',
        registeredAt: new Date('2024-03-20'),
        status: 'registered'
      },
      {
        id: '2',
        studentId: '3',
        studentName: 'Lê Văn C',
        email: 'lec@example.com',
        registeredAt: new Date('2024-03-21'),
        status: 'registered'
      }
    ],
    createdAt: new Date('2024-03-15')
  },
  {
    id: '2',
    title: 'Hoạt động dọn dẹp môi trường',
    description: 'Cùng nhau làm sạch khuôn viên trường, bảo vệ môi trường xanh.',
    type: 'tinh_nguyen',
    location: 'Khuôn viên trường',
    startDate: new Date('2024-04-20T07:00:00'),
    endDate: new Date('2024-04-20T11:00:00'),
    maxParticipants: 100,
    currentParticipants: 78,
    status: 'upcoming',
    createdBy: '2',
    creatorName: 'Trần Thị B',
    participants: [
      {
        id: '3',
        studentId: '1',
        studentName: 'Nguyễn Văn A',
        email: 'student@example.com',
        registeredAt: new Date('2024-03-25'),
        status: 'registered'
      }
    ],
    createdAt: new Date('2024-03-18')
  },
  {
    id: '3',
    title: 'Giải bóng đá mini',
    description: 'Giải bóng đá mini giao hữu giữa các lớp trong khoa.',
    type: 'the_thao',
    location: 'Sân bóng đá trường',
    startDate: new Date('2024-03-10T14:00:00'),
    endDate: new Date('2024-03-10T18:00:00'),
    maxParticipants: 22,
    currentParticipants: 22,
    status: 'completed',
    createdBy: '2',
    creatorName: 'Trần Thị B',
    participants: [
      {
        id: '4',
        studentId: '3',
        studentName: 'Lê Văn C',
        email: 'lec@example.com',
        registeredAt: new Date('2024-03-05'),
        status: 'attended'
      }
    ],
    createdAt: new Date('2024-03-01')
  },
  {
    id: '4',
    title: 'Workshop AI và Machine Learning',
    description: 'Hội thảo về xu hướng AI và ML trong ngành công nghệ thông tin.',
    type: 'hoc_tap',
    location: 'Hội trường A',
    startDate: new Date('2024-04-25T09:00:00'),
    endDate: new Date('2024-04-25T16:00:00'),
    maxParticipants: 80,
    currentParticipants: 45,
    status: 'upcoming',
    createdBy: '2',
    creatorName: 'Trần Thị B',
    participants: [],
    createdAt: new Date('2024-03-22')
  }
]

const eventTypes = {
  hoc_tap: 'Học tập',
  the_thao: 'Thể thao',
  van_hoa: 'Văn hóa',
  tinh_nguyen: 'Tình nguyện',
  khac: 'Khác'
}

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusLabels = {
  upcoming: 'Sắp diễn ra',
  ongoing: 'Đang diễn ra',
  completed: 'Đã kết thúc',
  cancelled: 'Đã hủy'
}

const QuanLySuKienThamGia = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Form state for creating new event
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    maxParticipants: ''
  })

  // Filter events
  const filteredEvents = events.filter(event => {
    if (filterStatus !== 'all' && event.status !== filterStatus) {
      return false
    }
    if (filterType !== 'all' && event.type !== filterType) {
      return false
    }
    return true
  })

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.type || !newEvent.location || !newEvent.startDate || !newEvent.endDate || !newEvent.maxParticipants) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (newEvent.startDate >= newEvent.endDate) {
      toast.error('Thời gian bắt đầu phải trước thời gian kết thúc')
      return
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type as Event['type'],
      location: newEvent.location,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      maxParticipants: parseInt(newEvent.maxParticipants),
      currentParticipants: 0,
      status: 'upcoming',
      createdBy: user?.id || '2',
      creatorName: user?.name || 'Unknown',
      participants: [],
      createdAt: new Date()
    }

    setEvents([event, ...events])
    setNewEvent({
      title: '',
      description: '',
      type: '',
      location: '',
      startDate: undefined,
      endDate: undefined,
      maxParticipants: ''
    })
    setIsCreateDialogOpen(false)
    toast.success('Tạo sự kiện thành công!')
  }

  const handleRegisterEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    if (event.currentParticipants >= event.maxParticipants) {
      toast.error('Sự kiện đã đủ số lượng tham gia')
      return
    }

    // Check if user already registered
    const isRegistered = event.participants.some(p => p.studentId === user?.id)
    if (isRegistered) {
      toast.error('Bạn đã đăng ký sự kiện này rồi')
      return
    }

    const newParticipant: Participant = {
      id: Date.now().toString(),
      studentId: user?.id || '1',
      studentName: user?.name || 'Unknown',
      email: user?.email || 'unknown@example.com',
      registeredAt: new Date(),
      status: 'registered'
    }

    setEvents(events.map(e => 
      e.id === eventId 
        ? { 
            ...e, 
            participants: [...e.participants, newParticipant],
            currentParticipants: e.currentParticipants + 1
          }
        : e
    ))

    toast.success('Đăng ký tham gia thành công!')
  }

  const handleUnregisterEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    const isRegistered = event.participants.some(p => p.studentId === user?.id)
    if (!isRegistered) {
      toast.error('Bạn chưa đăng ký sự kiện này')
      return
    }

    setEvents(events.map(e => 
      e.id === eventId 
        ? { 
            ...e, 
            participants: e.participants.filter(p => p.studentId !== user?.id),
            currentParticipants: e.currentParticipants - 1
          }
        : e
    ))

    toast.success('Hủy đăng ký thành công!')
  }

  const isUserRegistered = (event: Event) => {
    return event.participants.some(p => p.studentId === user?.id)
  }

  const canRegister = (event: Event) => {
    return event.status === 'upcoming' && event.currentParticipants < event.maxParticipants && !isUserRegistered(event)
  }

  const canUnregister = (event: Event) => {
    return event.status === 'upcoming' && isUserRegistered(event)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý sự kiện tham gia</h1>
          <p className="text-muted-foreground">
            {user?.role === 'class_leader' 
              ? 'Tạo và quản lý các sự kiện của lớp'
              : 'Xem và đăng ký tham gia các sự kiện'
            }
          </p>
        </div>
        
        {user?.role === 'class_leader' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo sự kiện
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo sự kiện mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên sự kiện</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Nhập tên sự kiện"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Mô tả chi tiết về sự kiện"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loại sự kiện</Label>
                    <Select 
                      value={newEvent.type} 
                      onValueChange={(value) => setNewEvent({...newEvent, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại sự kiện" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypes).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Địa điểm</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Địa điểm tổ chức"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thời gian bắt đầu</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newEvent.startDate ? format(newEvent.startDate, 'dd/MM/yyyy HH:mm') : 'Chọn thời gian'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newEvent.startDate}
                          onSelect={(date) => setNewEvent({...newEvent, startDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Thời gian kết thúc</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newEvent.endDate ? format(newEvent.endDate, 'dd/MM/yyyy HH:mm') : 'Chọn thời gian'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newEvent.endDate}
                          onSelect={(date) => setNewEvent({...newEvent, endDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Số lượng tham gia tối đa</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({...newEvent, maxParticipants: e.target.value})}
                    placeholder="Nhập số lượng tối đa"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateEvent}>
                    Tạo sự kiện
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
                  <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                  <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                  <SelectItem value="completed">Đã kết thúc</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Loại sự kiện</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(eventTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {eventTypes[event.type]}
                    </Badge>
                    <Badge className={statusColors[event.status]}>
                      {statusLabels[event.status]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(event.startDate, 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.currentParticipants}/{event.maxParticipants} người tham gia</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEvent(event)
                    setIsDetailDialogOpen(true)
                  }}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Chi tiết
                </Button>
                
                {user?.role === 'student' && (
                  <>
                    {canRegister(event) && (
                      <Button
                        size="sm"
                        onClick={() => handleRegisterEvent(event.id)}
                        className="flex-1"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Đăng ký
                      </Button>
                    )}
                    
                    {canUnregister(event) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnregisterEvent(event.id)}
                        className="flex-1"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Hủy đăng ký
                      </Button>
                    )}
                    
                    {isUserRegistered(event) && event.status !== 'upcoming' && (
                      <Badge variant="secondary" className="flex-1 justify-center">
                        Đã đăng ký
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            Không có sự kiện nào
          </CardContent>
        </Card>
      )}

      {/* Event Detail Dialog */}
      {selectedEvent && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Mô tả</Label>
                    <p className="text-sm mt-1">{selectedEvent.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Loại sự kiện</Label>
                      <Badge variant="outline" className="mt-1">
                        {eventTypes[selectedEvent.type]}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Trạng thái</Label>
                      <Badge className={`mt-1 ${statusColors[selectedEvent.status]}`}>
                        {statusLabels[selectedEvent.status]}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Địa điểm</Label>
                    <p className="text-sm mt-1">{selectedEvent.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Bắt đầu</Label>
                      <p className="text-sm mt-1">{format(selectedEvent.startDate, 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Kết thúc</Label>
                      <p className="text-sm mt-1">{format(selectedEvent.endDate, 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Số lượng tham gia</Label>
                    <p className="text-sm mt-1">{selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} người</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Danh sách tham gia</Label>
                    <div className="mt-2 max-h-80 overflow-y-auto">
                      {selectedEvent.participants.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên sinh viên</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedEvent.participants.map((participant) => (
                              <TableRow key={participant.id}>
                                <TableCell className="font-medium">{participant.studentName}</TableCell>
                                <TableCell>{participant.email}</TableCell>
                                <TableCell>
                                  <Badge variant={participant.status === 'attended' ? 'default' : 'secondary'}>
                                    {participant.status === 'registered' ? 'Đã đăng ký' : 
                                     participant.status === 'attended' ? 'Đã tham dự' : 'Vắng mặt'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Chưa có người tham gia
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default QuanLySuKienThamGia

