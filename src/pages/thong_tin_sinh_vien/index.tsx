import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { RecommendationService } from '@/service/recommendationService';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Award, 
  Activity,
  Edit,
  Save,
  X,
  Trophy,
  Clock,
  Target,
  Users,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

// Mock data for student information
interface StudentInfo {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  major: string;
  year: number;
  gpa: number;
  status: 'active' | 'inactive' | 'graduated';
  avatar?: string;
  joinDate: string;
  totalActivities: number;
  totalHours: number;
  role: 'student' | 'class_leader';
  semester: string;
  credits: number;
  completedCredits: number;
  achievements: string[];
}

interface ActivityRecord {
  id: string;
  name: string;
  type: 'community' | 'academic' | 'sports' | 'volunteer';
  date: string;
  hours: number;
  status: 'completed' | 'pending' | 'approved';
  description: string;
  organizer: string;
}

const mockStudentInfo: StudentInfo = {
  id: '1',
  studentId: 'SV001',
  fullName: 'Đạtn',
  email: 'student@example.com',
  phone: '0123456789',
  dateOfBirth: '2002-03-15',
  address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
  major: 'Công nghệ thông tin',
  year: 3,
  gpa: 8.5,
  status: 'active',
  avatar: '/api/placeholder/120/120',
  joinDate: '2022-09-01',
  totalActivities: 15,
  totalHours: 48,
  role: 'student',
  semester: 'HK1 2024-2025',
  credits: 120,
  completedCredits: 95,
  achievements: [
    'Học bổng khuyến khích học tập 2023',
    'Giải nhì cuộc thi lập trình',
    'Sinh viên 5 tốt cấp trường',
    'Hoàn thành xuất sắc khóa học React'
  ]
};

const mockActivities: ActivityRecord[] = [
  {
    id: '1',
    name: 'Hiến máu nhân đạo',
    type: 'volunteer',
    date: '2024-01-15',
    hours: 4,
    status: 'approved',
    description: 'Tham gia hiến máu tại trường đại học',
    organizer: 'Hội Chữ thập đỏ'
  },
  {
    id: '2',
    name: 'Cuộc thi lập trình ACM',
    type: 'academic',
    date: '2024-02-20',
    hours: 8,
    status: 'approved',
    description: 'Tham gia cuộc thi lập trình cấp trường',
    organizer: 'Khoa CNTT'
  },
  {
    id: '3',
    name: 'Dọn dẹp môi trường',
    type: 'community',
    date: '2024-03-10',
    hours: 6,
    status: 'approved',
    description: 'Hoạt động làm sạch khuôn viên trường',
    organizer: 'Đoàn thanh niên'
  },
  {
    id: '4',
    name: 'Seminar công nghệ AI',
    type: 'academic',
    date: '2024-03-25',
    hours: 3,
    status: 'pending',
    description: 'Tham dự hội thảo về trí tuệ nhân tạo',
    organizer: 'CLB Công nghệ'
  },
  {
    id: '5',
    name: 'Giải bóng đá sinh viên',
    type: 'sports',
    date: '2024-04-05',
    hours: 12,
    status: 'completed',
    description: 'Tham gia giải bóng đá cấp khoa',
    organizer: 'Khoa CNTT'
  }
];

const activityTypeColors = {
  community: 'bg-green-100 text-green-800',
  academic: 'bg-blue-100 text-blue-800',
  sports: 'bg-orange-100 text-orange-800',
  volunteer: 'bg-purple-100 text-purple-800'
};

const activityTypeLabels = {
  community: 'Cộng đồng',
  academic: 'Học thuật',
  sports: 'Thể thao',
  volunteer: 'Tình nguyện'
};

const statusColors = {
  completed: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800'
};

const statusLabels = {
  completed: 'Hoàn thành',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt'
};

const ThongTinSinhVien = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(mockStudentInfo);
  const [activities] = useState<ActivityRecord[]>(mockActivities);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentInfo>>({});
  
  // Recommendation dialog states
  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false);
  const [recommendationMessage, setRecommendationMessage] = useState('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const handleEditToggle = () => {
    if (isEditMode) {
      // Save changes
      setStudentInfo({ ...studentInfo, ...editData });
      toast.success('Cập nhật thông tin thành công');
    } else {
      // Enter edit mode
      setEditData({
        phone: studentInfo.phone,
        address: studentInfo.address,
        email: studentInfo.email
      });
    }
    setIsEditMode(!isEditMode);
  };
  const handleCancelEdit = () => {
    setEditData({});
    setIsEditMode(false);
  };
  // Handle recommendations
  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const response = await RecommendationService.getRecommendations();
      
      if (response.success && response.data) {
        // Kiểm tra cấu trúc response an toàn hơn
        const message = response.data.payload?.recommendations?.message || 
                       response.data.message || 
                       'Không có gợi ý nào được tìm thấy';
        
        setRecommendationMessage(message);
        setIsRecommendationDialogOpen(true);
      } else {
        toast.error(response.message || 'Không thể lấy gợi ý cải thiện DRL');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Lỗi khi lấy gợi ý cải thiện DRL');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Calculate statistics
  const completedActivities = activities.filter(a => a.status === 'approved').length;
  const pendingActivities = activities.filter(a => a.status === 'pending').length;
  const approvedHours = activities.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.hours, 0);
  const progressPercent = Math.round((studentInfo.completedCredits / studentInfo.credits) * 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông tin sinh viên</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và theo dõi hoạt động
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGetRecommendations}
            disabled={isLoadingRecommendations}
            className="flex items-center gap-2"
            variant="outline"
          >
            {isLoadingRecommendations ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
            Gợi ý cải thiện DRL
          </Button>
        </div>
      </div>
            


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={studentInfo.avatar} />
                  <AvatarFallback className="text-lg">
                    {studentInfo.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{studentInfo.fullName}</CardTitle>
              <CardDescription className="font-mono text-lg">
                {studentInfo.studentId}
              </CardDescription>
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="outline">
                  {studentInfo.role === 'class_leader' ? 'Lớp trưởng' : 'Sinh viên'}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {studentInfo.status === 'active' ? 'Đang học' : 'Tạm nghỉ'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {isEditMode ? (
                  <Input
                    value={editData.email || studentInfo.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="h-8"
                  />
                ) : (
                  <span className="text-sm">{studentInfo.email}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {isEditMode ? (
                  <Input
                    value={editData.phone || studentInfo.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="h-8"
                  />
                ) : (
                  <span className="text-sm">{studentInfo.phone}</span>
                )}
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                {isEditMode ? (
                  <Input
                    value={editData.address || studentInfo.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="h-8"
                  />
                ) : (
                  <span className="text-sm">{studentInfo.address}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(studentInfo.dateOfBirth).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{studentInfo.major}</span>
              </div>              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  {isEditMode ? (
                    <div className="flex gap-2 w-full">
                      <Button size="sm" onClick={handleEditToggle} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Lưu
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={handleEditToggle} className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
                
                {/* Recommendation Button */}
                <Button
                  onClick={handleGetRecommendations}
                  disabled={isLoadingRecommendations}
                  size="sm"
                  variant="secondary"
                  className="w-full"
                >
                  {isLoadingRecommendations ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mr-2" />
                  )}
                  Gợi ý cải thiện DRL
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Thống kê nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">GPA</span>
                <Badge variant={studentInfo.gpa >= 8 ? "default" : studentInfo.gpa >= 6.5 ? "secondary" : "destructive"}>
                  {studentInfo.gpa.toFixed(1)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hoạt động</span>
                <span className="font-medium">{completedActivities}/{studentInfo.totalActivities}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Giờ hoạt động</span>
                <span className="font-medium">{approvedHours}h</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tiến độ học tập</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {studentInfo.completedCredits}/{studentInfo.credits} tín chỉ
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="activities">Hoạt động</TabsTrigger>
              <TabsTrigger value="achievements">Thành tích</TabsTrigger>
              <TabsTrigger value="academic">Học tập</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Hoạt động</p>
                        <p className="text-2xl font-bold">{completedActivities}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Giờ hoạt động</p>
                        <p className="text-2xl font-bold">{approvedHours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                        <p className="text-2xl font-bold">{pendingActivities}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Thành tích</p>
                        <p className="text-2xl font-bold">{studentInfo.achievements.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{activity.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString('vi-VN')} • {activity.hours}h
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={activityTypeColors[activity.type]}>
                            {activityTypeLabels[activity.type]}
                          </Badge>
                          <Badge className={statusColors[activity.status]}>
                            {statusLabels[activity.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử hoạt động</CardTitle>
                  <CardDescription>
                    Danh sách tất cả các hoạt động đã tham gia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{activity.name}</h4>
                              <Badge className={activityTypeColors[activity.type]}>
                                {activityTypeLabels[activity.type]}
                              </Badge>
                              <Badge className={statusColors[activity.status]}>
                                {statusLabels[activity.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(activity.date).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {activity.hours} giờ
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {activity.organizer}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thành tích đạt được</CardTitle>
                  <CardDescription>
                    Các giải thưởng và thành tích xuất sắc
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {studentInfo.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Award className="h-6 w-6 text-yellow-500" />
                        <div>
                          <p className="font-medium">{achievement}</p>
                          <p className="text-sm text-muted-foreground">
                            Năm học 2023-2024
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Tab */}
            <TabsContent value="academic" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin học tập</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Khóa học</Label>
                        <p className="font-medium">2022-2026</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Năm học hiện tại</Label>
                        <p className="font-medium">Năm {studentInfo.year}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Học kỳ</Label>
                        <p className="font-medium">{studentInfo.semester}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Chuyên ngành</Label>
                        <p className="font-medium">{studentInfo.major}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">GPA tích lũy</span>
                        <Badge variant={studentInfo.gpa >= 8 ? "default" : studentInfo.gpa >= 6.5 ? "secondary" : "destructive"}>
                          {studentInfo.gpa.toFixed(2)}/10
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Tiến độ tín chỉ</span>
                          <span className="text-sm font-medium">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Đã hoàn thành: {studentInfo.completedCredits}</span>
                          <span>Tổng cần: {studentInfo.credits}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Biểu đồ tiến độ học tập</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-blue-500">95</div>
                          <div className="text-xs text-muted-foreground">Tín chỉ hoàn thành</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-green-500">8.5</div>
                          <div className="text-xs text-muted-foreground">GPA hiện tại</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-orange-500">25</div>
                          <div className="text-xs text-muted-foreground">Tín chỉ còn lại</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-purple-500">3</div>
                          <div className="text-xs text-muted-foreground">Học kỳ còn lại</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>          </Tabs>
        </div>
      </div>

      {/* Recommendation Dialog */}
      <Dialog open={isRecommendationDialogOpen} onOpenChange={setIsRecommendationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Gợi ý cải thiện điểm rèn luyện
            </DialogTitle>
            <DialogDescription>
              Dưới đây là những gợi ý được AI phân tích để giúp bạn cải thiện điểm rèn luyện
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {recommendationMessage ? (
              <div className="prose prose-sm max-w-none">
                <div 
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: recommendationMessage
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\n- /g, '<br/>• ')
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Không có gợi ý nào được tìm thấy</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsRecommendationDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThongTinSinhVien;
