import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { RecommendationService } from '@/service/recommendationService'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap,
  Award,
  Activity,
  Users,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  Lightbulb,
  RefreshCw
} from 'lucide-react'

// Mock data cho thông tin sinh viên
const mockStudentData = {
  student: {
    id: 'SV001',
    name: 'Đạt',
    email: 'student@example.com',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    dateOfBirth: '2002-05-15',
    studentCode: '20210001',
    class: 'CNTT01',
    major: 'Công nghệ thông tin',
    year: 3,
    gpa: 3.2,
    credits: 85,
    totalCredits: 120,
    avatar: '',
    activities: [
      {
        id: 1,
        name: 'Hội thảo AI trong giáo dục',
        date: '2024-03-15',
        status: 'completed',
        points: 10,
        type: 'seminar'
      },
      {
        id: 2,
        name: 'Tình nguyện mùa hè 2024',
        date: '2024-07-20',
        status: 'completed',
        points: 15,
        type: 'volunteer'
      },
      {
        id: 3,
        name: 'Cuộc thi lập trình ACM',
        date: '2024-05-10',
        status: 'completed',
        points: 20,
        type: 'competition'
      }
    ],
    totalActivityPoints: 45,
    achievements: [
      {
        id: 1,
        title: 'Sinh viên 5 tốt',
        year: '2023',
        description: 'Đạt danh hiệu sinh viên 5 tốt cấp khoa'
      },
      {
        id: 2,
        title: 'Giải 3 cuộc thi lập trình',
        year: '2024',
        description: 'Đạt giải 3 cuộc thi lập trình cấp trường'
      }
    ]
  },
  classLeader: {
    id: 'SV002',
    name: 'Duy',
    email: 'leader@example.com',
    phone: '0987654321',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    dateOfBirth: '2002-03-20',
    studentCode: '20210002',
    class: 'CNTT01',
    major: 'Công nghệ thông tin',
    year: 3,
    gpa: 3.8,
    credits: 90,
    totalCredits: 120,
    avatar: '',
    role: 'Lớp trưởng',
    activities: [
      {
        id: 1,
        name: 'Tổ chức sự kiện văn nghệ khoa',
        date: '2024-04-15',
        status: 'completed',
        points: 25,
        type: 'organization'
      },
      {
        id: 2,
        name: 'Hội thảo AI trong giáo dục',
        date: '2024-03-15',
        status: 'completed',
        points: 10,
        type: 'seminar'
      },
      {
        id: 3,
        name: 'Hoạt động từ thiện',
        date: '2024-06-10',
        status: 'completed',
        points: 20,
        type: 'volunteer'
      }
    ],
    totalActivityPoints: 55,
    achievements: [
      {
        id: 1,
        title: 'Lớp trưởng xuất sắc',
        year: '2023',
        description: 'Được công nhận là lớp trưởng xuất sắc cấp khoa'
      },
      {
        id: 2,
        title: 'Sinh viên 5 tốt',
        year: '2023-2024',
        description: 'Đạt danh hiệu sinh viên 5 tốt cấp trường 2 năm liên tiếp'
      },
      {
        id: 3,
        title: 'Giải nhất tổ chức sự kiện',
        year: '2024',
        description: 'Giải nhất cuộc thi tổ chức sự kiện sinh viên'
      }
    ],
    classStats: {
      totalStudents: 45,
      averageGPA: 3.1,
      totalActivities: 12,
      participationRate: 78
    }
  }
}

const StudentInfo = () => {
  const { user } = useAuth()
  
  // Recommendation dialog states
  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false)
  const [recommendationMessage, setRecommendationMessage] = useState('')
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)

  // Handle recommendations
  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true)
    try {
      const response = await RecommendationService.getRecommendations()
      
      // Log để debug      console.log('Recommendation response:', response)
      
      if (response.success && response.data) {
        // Kiểm tra cấu trúc response an toàn hơn
        let message = 'Không có gợi ý nào được tìm thấy'
        
        // ApiService đã extract payload thành data, nên truy cập trực tiếp
        if (response.data.recommendations?.message) {
          message = response.data.recommendations.message
        } else if (response.data.payload?.recommendations?.message) {
          // Fallback case nếu payload vẫn còn
          message = response.data.payload.recommendations.message
        } else if (response.data.message) {
          message = response.data.message
        } else if (typeof response.data === 'string') {
          message = response.data
        }
        
        setRecommendationMessage(message)
        setIsRecommendationDialogOpen(true)
      } else {
        console.log('Response failed or no data:', response)
        toast.error(response.message || 'Không thể lấy gợi ý cải thiện DRL')
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      toast.error('Lỗi khi lấy gợi ý cải thiện DRL')
    } finally {
      setIsLoadingRecommendations(false)
    }
  }
  
  // Lấy data dựa trên role
  const studentData = user?.role === 'class_leader' 
    ? mockStudentData.classLeader 
    : mockStudentData.student

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'seminar': return 'bg-blue-100 text-blue-800'
      case 'volunteer': return 'bg-green-100 text-green-800'
      case 'competition': return 'bg-purple-100 text-purple-800'
      case 'organization': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'seminar': return <BookOpen className="h-4 w-4" />
      case 'volunteer': return <Users className="h-4 w-4" />
      case 'competition': return <Award className="h-4 w-4" />
      case 'organization': return <Target className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông tin sinh viên</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin cá nhân và hoạt động học tập
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <Button 
            onClick={handleGetRecommendations}
            disabled={isLoadingRecommendations}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoadingRecommendations ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
            Gợi ý cải thiện DRL
          </Button>
          {user?.role === 'class_leader' && (
            <Badge variant="secondary">
              <Users className="h-4 w-4 mr-1" />
              Lớp trưởng
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="academic">Học tập</TabsTrigger>
          <TabsTrigger value="activities">Hoạt động</TabsTrigger>
          {user?.role === 'class_leader' && (
            <TabsTrigger value="class">Thông tin lớp</TabsTrigger>
          )}
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={studentData.avatar} />
                    <AvatarFallback className="text-lg">
                      {studentData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Đổi ảnh đại diện
                  </Button>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Họ và tên</p>
                        <p className="font-medium">{studentData.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{studentData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium">{studentData.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày sinh</p>
                        <p className="font-medium">{studentData.dateOfBirth}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Mã sinh viên</p>
                        <p className="font-medium">{studentData.studentCode}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p className="font-medium">{studentData.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Thông tin học tập
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Lớp</p>
                  <p className="font-medium">{studentData.class}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngành</p>
                  <p className="font-medium">{studentData.major}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Năm học</p>
                  <p className="font-medium">Năm {studentData.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GPA</p>
                  <p className="font-medium text-lg">{studentData.gpa}/4.0</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tiến độ học tập
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tín chỉ hoàn thành</span>
                    <span>{studentData.credits}/{studentData.totalCredits}</span>
                  </div>
                  <Progress 
                    value={(studentData.credits / studentData.totalCredits) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Điểm rèn luyện</p>
                  <p className="font-medium text-lg">{studentData.totalActivityPoints} điểm</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Thành tích
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentData.achievements.map((achievement) => (
                  <div key={achievement.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <Badge variant="outline">{achievement.year}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hoạt động đã tham gia
              </CardTitle>
              <CardDescription>
                Tổng điểm rèn luyện: {studentData.totalActivityPoints} điểm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getActivityTypeIcon(activity.type)}
                        <h4 className="font-medium">{activity.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getActivityTypeColor(activity.type)}>
                          +{activity.points} điểm
                        </Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Class Information Tab (Only for class leaders) */}
        {user?.role === 'class_leader' && (
          <TabsContent value="class" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tổng sinh viên</p>
                      <p className="text-2xl font-bold">{mockStudentData.classLeader.classStats.totalStudents}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">GPA trung bình</p>
                      <p className="text-2xl font-bold">{mockStudentData.classLeader.classStats.averageGPA}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Hoạt động tổ chức</p>
                      <p className="text-2xl font-bold">{mockStudentData.classLeader.classStats.totalActivities}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tỉ lệ tham gia</p>
                      <p className="text-2xl font-bold">{mockStudentData.classLeader.classStats.participationRate}%</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Nhiệm vụ lớp trưởng</CardTitle>
                <CardDescription>
                  Các hoạt động và trách nhiệm của bạn với tư cách là lớp trưởng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Quản lý danh sách lớp</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Cập nhật và quản lý thông tin của {mockStudentData.classLeader.classStats.totalStudents} sinh viên trong lớp
                    </p>
                    <Button variant="outline" size="sm">
                      Xem danh sách lớp
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Tổ chức hoạt động</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Đã tổ chức {mockStudentData.classLeader.classStats.totalActivities} hoạt động với tỉ lệ tham gia {mockStudentData.classLeader.classStats.participationRate}%
                    </p>
                    <Button variant="outline" size="sm">
                      Lên kế hoạch hoạt động
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>          </TabsContent>
        )}
      </Tabs>

      {/* Recommendation Dialog */}
      <Dialog open={isRecommendationDialogOpen} onOpenChange={setIsRecommendationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Gợi ý cải thiện điểm rèn luyện
            </DialogTitle>
            <DialogDescription>
              Các gợi ý được tạo bởi AI để giúp bạn cải thiện điểm rèn luyện
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                {recommendationMessage}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRecommendationDialogOpen(false)}
            >
              Đóng
            </Button>
            <Button onClick={handleGetRecommendations} disabled={isLoadingRecommendations}>
              {isLoadingRecommendations ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm mới gợi ý
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentInfo
