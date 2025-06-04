import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen,
  GraduationCap,
  Award,
  Users,
  FileText,
  Edit,
  Save,
  Camera,
  Building,
  Clock,
  Briefcase,
  Star,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

// Teacher Info interfaces
interface TeacherInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  employee_id: string;
  department: string;
  faculty: string;
  position: string;
  academic_rank: string;
  degree: string;
  specialization: string[];
  date_of_birth: string;
  gender: string;
  address: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'on_leave';
  bio: string;
  office_location: string;
  office_hours: string;
  research_interests: string[];
  publications: number;
  awards: Award[];
  courses_taught: Course[];
  current_students: number;
}

interface Award {
  id: number;
  title: string;
  organization: string;
  year: number;
  type: 'teaching' | 'research' | 'service';
}

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  year: number;
  students_count: number;
  status: 'ongoing' | 'completed' | 'upcoming';
}

interface TeachingStats {
  total_courses: number;
  total_students: number;
  current_semester_courses: number;
  average_rating: number;
  years_experience: number;
}

// Mock data for teacher information
const mockTeacherInfo: TeacherInfo = {
  id: "GV001",
  full_name: "TS. Nguyễn Đạt",
  email: "nguyendat@university.edu.vn",
  phone: "0123456789",
  avatar_url: "/api/placeholder/150/150",
  employee_id: "GV2020001",
  department: "Khoa học Máy tính",
  faculty: "Công nghệ Thông tin",
  position: "Giảng viên chính",
  academic_rank: "Tiến sĩ",
  degree: "Tiến sĩ Khoa học Máy tính",
  specialization: ["Trí tuệ nhân tạo", "Machine Learning", "Data Science"],
  date_of_birth: "1985-05-15",
  gender: "Nam",
  address: "123 Đường ABC, Quận 1, Hà Nội",
  hire_date: "2020-08-01",
  status: "active",
  bio: "Tiến sĩ Nguyễn Đạt là một giảng viên giàu kinh nghiệm trong lĩnh vực Khoa học Máy tính với chuyên môn sâu về Trí tuệ nhân tạo và Machine Learning. Ông có hơn 8 năm kinh nghiệm giảng dạy và nghiên cứu, đã xuất bản nhiều bài báo khoa học trên các tạp chí uy tín quốc tế.",
  office_location: "Phòng 301, Tòa nhà A",
  office_hours: "Thứ 2, 4, 6: 14:00-16:00",
  research_interests: ["Artificial Intelligence", "Machine Learning", "Deep Learning", "Natural Language Processing"],
  publications: 25,
  awards: [
    { id: 1, title: "Giải thưởng Giảng viên xuất sắc", organization: "Đại học ABC", year: 2023, type: "teaching" },
    { id: 2, title: "Giải thưởng Nghiên cứu khoa học", organization: "Bộ Giáo dục", year: 2022, type: "research" },
    { id: 3, title: "Giải Ba Cuộc thi Sáng tạo AI", organization: "Microsoft Vietnam", year: 2021, type: "research" }
  ],
  courses_taught: [
    { id: "CS101", code: "CS101", name: "Lập trình cơ bản", semester: "HK1", year: 2024, students_count: 45, status: "ongoing" },
    { id: "CS301", code: "CS301", name: "Trí tuệ nhân tạo", semester: "HK1", year: 2024, students_count: 32, status: "ongoing" },
    { id: "CS401", code: "CS401", name: "Machine Learning", semester: "HK2", year: 2024, students_count: 28, status: "upcoming" },
    { id: "CS201", code: "CS201", name: "Cấu trúc dữ liệu", semester: "HK2", year: 2023, students_count: 38, status: "completed" },
    { id: "CS302", code: "CS302", name: "Xử lý ngôn ngữ tự nhiên", semester: "HK1", year: 2023, students_count: 25, status: "completed" }
  ],
  current_students: 77
};

const mockTeachingStats: TeachingStats = {
  total_courses: 15,
  total_students: 420,
  current_semester_courses: 2,
  average_rating: 4.7,
  years_experience: 8
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  on_leave: 'bg-yellow-100 text-yellow-800'
};

const statusLabels = {
  active: 'Đang hoạt động',
  inactive: 'Ngừng hoạt động',
  on_leave: 'Đang nghỉ phép'
};

const courseStatusColors = {
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  upcoming: 'bg-purple-100 text-purple-800'
};

const courseStatusLabels = {
  ongoing: 'Đang dạy',
  completed: 'Đã hoàn thành',
  upcoming: 'Sắp tới'
};

const awardTypeColors = {
  teaching: 'bg-blue-100 text-blue-800',
  research: 'bg-green-100 text-green-800',
  service: 'bg-purple-100 text-purple-800'
};

const awardTypeLabels = {
  teaching: 'Giảng dạy',
  research: 'Nghiên cứu',
  service: 'Phục vụ'
};

const TeacherInfo = () => {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>(mockTeacherInfo);
  const [teachingStats, setTeachingStats] = useState<TeachingStats>(mockTeachingStats);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedInfo, setEditedInfo] = useState<TeacherInfo>(mockTeacherInfo);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock data
      setTeacherInfo(mockTeacherInfo);
      setTeachingStats(mockTeachingStats);
      setEditedInfo(mockTeacherInfo);
      
      toast.success('Tải thông tin giảng viên thành công');
    } catch (error) {
      console.error('Error loading teacher data:', error);
      toast.error('Lỗi khi tải thông tin giảng viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTeacherInfo(editedInfo);
      setIsEditingProfile(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating teacher info:', error);
      toast.error('Lỗi khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedInfo(teacherInfo);
    setIsEditingProfile(false);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading && !teacherInfo.id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải thông tin giảng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông tin Giảng viên</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và hoạt động giảng dạy
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditingProfile ? (
            <Button onClick={() => setIsEditingProfile(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Đang lưu...' : 'Lưu'}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" disabled={isLoading}>
                Hủy
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={teacherInfo.avatar_url} alt={teacherInfo.full_name} />
                  <AvatarFallback className="text-lg">
                    {teacherInfo.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditingProfile && (
                  <Button size="sm" className="absolute bottom-0 right-0 rounded-full" variant="outline">
                    <Camera className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{teacherInfo.full_name}</h2>
                <p className="text-muted-foreground">{teacherInfo.position}</p>
                <Badge className={statusColors[teacherInfo.status]}>
                  {statusLabels[teacherInfo.status]}
                </Badge>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{teachingStats.current_semester_courses}</div>
                <div className="text-sm text-gray-600">Môn đang dạy</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{teacherInfo.current_students}</div>
                <div className="text-sm text-gray-600">Sinh viên hiện tại</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{teachingStats.average_rating}</div>
                <div className="text-sm text-gray-600">Đánh giá TB</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{teacherInfo.awards.length}</div>
                <div className="text-sm text-gray-600">Giải thưởng</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="academic">Học thuật</TabsTrigger>
          <TabsTrigger value="courses">Môn học</TabsTrigger>
          <TabsTrigger value="achievements">Thành tích</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Họ và tên</Label>
                    {isEditingProfile ? (
                      <Input
                        value={editedInfo.full_name}
                        onChange={(e) => setEditedInfo({...editedInfo, full_name: e.target.value})}
                      />
                    ) : (
                      <p className="mt-1 text-sm">{teacherInfo.full_name}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    {isEditingProfile ? (
                      <Input
                        type="email"
                        value={editedInfo.email}
                        onChange={(e) => setEditedInfo({...editedInfo, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{teacherInfo.email}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Số điện thoại</Label>
                    {isEditingProfile ? (
                      <Input
                        value={editedInfo.phone}
                        onChange={(e) => setEditedInfo({...editedInfo, phone: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{teacherInfo.phone}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Địa chỉ</Label>
                    {isEditingProfile ? (
                      <Textarea
                        value={editedInfo.address}
                        onChange={(e) => setEditedInfo({...editedInfo, address: e.target.value})}
                        rows={2}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{teacherInfo.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Mã nhân viên</Label>
                    <p className="mt-1 text-sm">{teacherInfo.employee_id}</p>
                  </div>
                  <div>
                    <Label>Ngày sinh</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {format(new Date(teacherInfo.date_of_birth), 'dd/MM/yyyy')} 
                        ({calculateAge(teacherInfo.date_of_birth)} tuổi)
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Giới tính</Label>
                    <p className="mt-1 text-sm">{teacherInfo.gender}</p>
                  </div>
                  <div>
                    <Label>Ngày vào làm</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {format(new Date(teacherInfo.hire_date), 'dd/MM/yyyy')}
                        ({teachingStats.years_experience} năm kinh nghiệm)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Label>Giới thiệu</Label>
                {isEditingProfile ? (
                  <Textarea
                    value={editedInfo.bio}
                    onChange={(e) => setEditedInfo({...editedInfo, bio: e.target.value})}
                    rows={4}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-700">{teacherInfo.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Thông tin học thuật
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Khoa</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{teacherInfo.faculty}</span>
                  </div>
                </div>
                <div>
                  <Label>Bộ môn</Label>
                  <p className="mt-1 text-sm">{teacherInfo.department}</p>
                </div>
                <div>
                  <Label>Chức vụ</Label>
                  <p className="mt-1 text-sm">{teacherInfo.position}</p>
                </div>
                <div>
                  <Label>Học hàm</Label>
                  <p className="mt-1 text-sm">{teacherInfo.academic_rank}</p>
                </div>
                <div>
                  <Label>Bằng cấp</Label>
                  <p className="mt-1 text-sm">{teacherInfo.degree}</p>
                </div>
                <div>
                  <Label>Phòng làm việc</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{teacherInfo.office_location}</span>
                  </div>
                </div>
                <div>
                  <Label>Giờ tiếp sinh viên</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{teacherInfo.office_hours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Chuyên môn & Nghiên cứu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Lĩnh vực chuyên môn</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teacherInfo.specialization.map((spec, index) => (
                      <Badge key={index} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Hướng nghiên cứu</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teacherInfo.research_interests.map((interest, index) => (
                      <Badge key={index} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Số bài báo khoa học</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{teacherInfo.publications} bài báo</span>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{teachingStats.total_courses}</div>
                      <div className="text-xs text-gray-600">Tổng môn đã dạy</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{teachingStats.total_students}</div>
                      <div className="text-xs text-gray-600">Tổng sinh viên</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Môn học giảng dạy
              </CardTitle>
              <CardDescription>
                Danh sách các môn học đã và đang giảng dạy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã môn</TableHead>
                      <TableHead>Tên môn học</TableHead>
                      <TableHead>Học kỳ</TableHead>
                      <TableHead>Năm học</TableHead>
                      <TableHead>Số sinh viên</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherInfo.courses_taught.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.semester}</TableCell>
                        <TableCell>{course.year}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            {course.students_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={courseStatusColors[course.status]}>
                            {courseStatusLabels[course.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Giải thưởng & Thành tích
              </CardTitle>
              <CardDescription>
                Các giải thưởng và thành tích đạt được trong quá trình công tác
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherInfo.awards.map((award) => (
                  <div key={award.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Award className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{award.title}</h4>
                      <p className="text-sm text-gray-600">{award.organization}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={awardTypeColors[award.type]}>
                          {awardTypeLabels[award.type]}
                        </Badge>
                        <span className="text-sm text-gray-500">{award.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {teacherInfo.awards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có giải thưởng nào được ghi nhận</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Research Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Thống kê nghiên cứu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{teacherInfo.publications}</div>
                  <div className="text-sm text-gray-600">Bài báo khoa học</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{teacherInfo.awards.length}</div>
                  <div className="text-sm text-gray-600">Giải thưởng</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{teachingStats.years_experience}</div>
                  <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherInfo;