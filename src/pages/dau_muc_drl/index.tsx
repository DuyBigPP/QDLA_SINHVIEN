import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  Target,
  Settings,
  ChevronDown,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

// Interfaces for DRL Criteria Management
interface CriteriaItem {
  id: number;
  name: string;
  description: string;
  min_score: number;
  max_score: number;
  order_index: number;
  is_active: boolean;
  semester: number;
  created_at: string;
  updated_at: string;
  subcriteria: SubcriteriaItem[];
}

interface SubcriteriaItem {
  id: number;
  criteria_id: number;
  name: string;
  description: string;
  min_score: number;
  max_score: number;
  order_index: number;
  is_active: boolean;
  editable: boolean;
  required_evidence: boolean;
  created_at: string;
  updated_at: string;
}

interface CriteriaFormData {
  name: string;
  description: string;
  min_score: number;
  max_score: number;
  order_index: number;
  is_active: boolean;
  semester: number;
}

interface SubcriteriaFormData {
  name: string;
  description: string;
  min_score: number;
  max_score: number;
  order_index: number;
  is_active: boolean;
  editable: boolean;
  required_evidence: boolean;
  criteria_id: number;
}

// Mock data for DRL criteria and subcriteria
const mockCriteriaData: CriteriaItem[] = [
  {
    id: 1,
    name: "Đánh giá về ý thức và kết quả học tập",
    description: "Đánh giá khả năng học tập, ý thức tham gia học tập và kết quả học tập của sinh viên",
    min_score: 0,
    max_score: 20,
    order_index: 1,
    is_active: true,
    semester: 20242,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    subcriteria: [
      {
        id: 1,
        criteria_id: 1,
        name: "Ý thức và thái độ trong học tập",
        description: "Đánh giá ý thức học tập, thái độ tham gia lớp học",
        min_score: 0,
        max_score: 3,
        order_index: 1,
        is_active: true,
        editable: true,
        required_evidence: false,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        criteria_id: 1,
        name: "Kết quả học tập trong kỳ học",
        description: "Đánh giá điểm trung bình, kết quả học tập",
        min_score: 0,
        max_score: 10,
        order_index: 2,
        is_active: true,
        editable: true,
        required_evidence: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 3,
        criteria_id: 1,
        name: "Ý thức chấp hành tốt nội quy về các kỳ thi",
        description: "Không vi phạm quy chế thi, không gian lận",
        min_score: -4,
        max_score: 4,
        order_index: 3,
        is_active: true,
        editable: true,
        required_evidence: false,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 4,
        criteria_id: 1,
        name: "Ý thức và thái độ tham gia các hoạt động ngoại khóa",
        description: "Tham gia CLB, hoạt động nghiên cứu khoa học",
        min_score: 0,
        max_score: 2,
        order_index: 4,
        is_active: true,
        editable: true,
        required_evidence: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 5,
        criteria_id: 1,
        name: "Tinh thần vượt khó, phấn đấu trong học tập",
        description: "Thể hiện tinh thần cố gắng, nỗ lực trong học tập",
        min_score: 0,
        max_score: 1,
        order_index: 5,
        is_active: true,
        editable: true,
        required_evidence: false,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      }
    ]
  },
  {
    id: 2,
    name: "Đánh giá về ý thức chấp hành nội quy, quy chế trong nhà trường",
    description: "Đánh giá việc tuân thủ các quy định, nội quy của trường",
    min_score: 0,
    max_score: 25,
    order_index: 2,
    is_active: true,
    semester: 20242,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    subcriteria: [
      {
        id: 6,
        criteria_id: 2,
        name: "Thực hiện nghiêm túc các nội quy, quy chế của trường",
        description: "Tuân thủ đầy đủ các quy định trong sinh hoạt và học tập",
        min_score: 0,
        max_score: 15,
        order_index: 1,
        is_active: true,
        editable: true,
        required_evidence: false,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 7,
        criteria_id: 2,
        name: "Thực hiện quy định về nội trú, ngoại trú",
        description: "Tuân thủ quy định về chỗ ở, sinh hoạt",
        min_score: -5,
        max_score: 0,
        order_index: 2,
        is_active: true,
        editable: true,
        required_evidence: false,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 8,
        criteria_id: 2,
        name: "Tham gia đầy đủ các buổi họp lớp, sinh hoạt đoàn thể",
        description: "Tham dự đầy đủ các hoạt động tập thể bắt buộc",
        min_score: 0,
        max_score: 5,
        order_index: 3,
        is_active: true,
        editable: true,
        required_evidence: false,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      }
    ]
  },
  {
    id: 3,
    name: "Đánh giá về ý thức và kết quả tham gia các hoạt động phong trào",
    description: "Đánh giá việc tham gia các hoạt động xã hội, văn hóa, thể thao",
    min_score: 0,
    max_score: 20,
    order_index: 3,
    is_active: true,
    semester: 20242,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    subcriteria: [
      {
        id: 9,
        criteria_id: 3,
        name: "Tham gia hoạt động văn hóa, văn nghệ, thể thao",
        description: "Tham gia các hoạt động văn hóa, thể thao của trường, lớp",
        min_score: 0,
        max_score: 8,
        order_index: 1,
        is_active: true,
        editable: true,
        required_evidence: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 10,
        criteria_id: 3,
        name: "Tham gia các hoạt động tình nguyện, công ích",
        description: "Tham gia hoạt động phục vụ cộng đồng, tình nguyện",
        min_score: 0,
        max_score: 7,
        order_index: 2,
        is_active: true,
        editable: true,
        required_evidence: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 11,
        criteria_id: 3,
        name: "Tham gia hoạt động bảo vệ môi trường",
        description: "Có ý thức bảo vệ môi trường, tham gia các hoạt động xanh",
        min_score: 0,
        max_score: 5,
        order_index: 3,
        is_active: true,
        editable: true,
        required_evidence: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      }
    ]
  },
  {
    id: 4,
    name: "Đánh giá về phẩm chất công dân và quan hệ với cộng đồng",
    description: "Đánh giá ý thức công dân, quan hệ xã hội",
    min_score: 0,
    max_score: 25,
    order_index: 4,
    is_active: true,
    semester: 20242,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    subcriteria: [
      {
        id: 12,
        criteria_id: 4,
        name: "Ý thức chấp hành pháp luật nhà nước",
        description: "Tuân thủ pháp luật, không vi phạm",
        min_score: 0,
        max_score: 15,
        order_index: 1,
        is_active: true,
        editable: true,
        required_evidence: false,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 13,
        criteria_id: 4,
        name: "Có tinh thần đoàn kết, giúp đỡ bạn bè",
        description: "Thể hiện tinh thần tương trợ, hỗ trợ đồng học",
        min_score: 0,
        max_score: 10,
        order_index: 2,
        is_active: true,
        editable: true,
        required_evidence: false,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      }
    ]
  },
  {
    id: 5,
    name: "Đánh giá về ý thức và kết quả tham gia công tác lớp, đoàn thể",
    description: "Đánh giá việc tham gia các hoạt động lãnh đạo, quản lý",
    min_score: 0,
    max_score: 10,
    order_index: 5,
    is_active: true,
    semester: 20242,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    subcriteria: [
      {
        id: 14,
        criteria_id: 5,
        name: "Tham gia tích cực các hoạt động lớp, khoa",
        description: "Đóng góp tích cực vào các hoạt động tập thể",
        min_score: 0,
        max_score: 5,
        order_index: 1,
        is_active: true,
        editable: true,
        required_evidence: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 15,
        criteria_id: 5,
        name: "Tham gia Ban cán sự lớp, đoàn thể",
        description: "Đảm nhận vai trò lãnh đạo trong lớp, đoàn thể",
        min_score: 0,
        max_score: 5,
        order_index: 2,
        is_active: true,
        editable: true,
        required_evidence: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      }
    ]
  }
];

const DauMucDrl = () => {
  const [criteriaList, setCriteriaList] = useState<CriteriaItem[]>(mockCriteriaData);
  const [filteredCriteria, setFilteredCriteria] = useState<CriteriaItem[]>(mockCriteriaData);
  const [selectedSemester, setSelectedSemester] = useState(20242);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCriteria, setExpandedCriteria] = useState<number[]>([]);

  // Criteria form dialog states
  const [isCriteriaDialogOpen, setIsCriteriaDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<CriteriaItem | null>(null);
  const [criteriaFormData, setCriteriaFormData] = useState<CriteriaFormData>({
    name: '',
    description: '',
    min_score: 0,
    max_score: 0,
    order_index: 1,
    is_active: true,
    semester: 20242
  });

  // Subcriteria form dialog states
  const [isSubcriteriaDialogOpen, setIsSubcriteriaDialogOpen] = useState(false);
  const [editingSubcriteria, setEditingSubcriteria] = useState<SubcriteriaItem | null>(null);
  const [subcriteriaFormData, setSubcriteriaFormData] = useState<SubcriteriaFormData>({
    name: '',
    description: '',
    min_score: 0,
    max_score: 0,
    order_index: 1,
    is_active: true,
    editable: true,
    required_evidence: false,
    criteria_id: 0
  });

  useEffect(() => {
    loadCriteriaData();
  }, [selectedSemester]);

  useEffect(() => {
    filterCriteria();
  }, [criteriaList, searchTerm]);

  const loadCriteriaData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data by semester
      const filtered = mockCriteriaData.filter(criteria => criteria.semester === selectedSemester);
      setCriteriaList(filtered);
      
      toast.success('Tải dữ liệu tiêu chí thành công');
    } catch (error) {
      console.error('Error loading criteria:', error);
      toast.error('Lỗi khi tải dữ liệu tiêu chí');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCriteria = () => {
    let filtered = criteriaList;

    if (searchTerm) {
      filtered = filtered.filter(criteria => 
        criteria.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        criteria.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        criteria.subcriteria.some(sub => 
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredCriteria(filtered);
  };

  const toggleCriteriaExpansion = (criteriaId: number) => {
    setExpandedCriteria(prev => 
      prev.includes(criteriaId) 
        ? prev.filter(id => id !== criteriaId)
        : [...prev, criteriaId]
    );
  };

  // Criteria CRUD operations
  const handleAddCriteria = () => {
    setCriteriaFormData({
      name: '',
      description: '',
      min_score: 0,
      max_score: 0,
      order_index: criteriaList.length + 1,
      is_active: true,
      semester: selectedSemester
    });
    setEditingCriteria(null);
    setIsCriteriaDialogOpen(true);
  };

  const handleEditCriteria = (criteria: CriteriaItem) => {
    setCriteriaFormData({
      name: criteria.name,
      description: criteria.description,
      min_score: criteria.min_score,
      max_score: criteria.max_score,
      order_index: criteria.order_index,
      is_active: criteria.is_active,
      semester: criteria.semester
    });
    setEditingCriteria(criteria);
    setIsCriteriaDialogOpen(true);
  };

  const handleSaveCriteria = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingCriteria) {
        // Update existing criteria
        setCriteriaList(prev => prev.map(item => 
          item.id === editingCriteria.id 
            ? { ...item, ...criteriaFormData, updated_at: new Date().toISOString() }
            : item
        ));
        toast.success('Cập nhật tiêu chí thành công');
      } else {
        // Add new criteria
        const newCriteria: CriteriaItem = {
          id: Math.max(...criteriaList.map(c => c.id)) + 1,
          ...criteriaFormData,
          subcriteria: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCriteriaList(prev => [...prev, newCriteria]);
        toast.success('Thêm tiêu chí mới thành công');
      }

      setIsCriteriaDialogOpen(false);
    } catch (error) {
      console.error('Error saving criteria:', error);
      toast.error('Lỗi khi lưu tiêu chí');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCriteria = async (criteriaId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tiêu chí này?')) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCriteriaList(prev => prev.filter(item => item.id !== criteriaId));
      toast.success('Xóa tiêu chí thành công');
    } catch (error) {
      console.error('Error deleting criteria:', error);
      toast.error('Lỗi khi xóa tiêu chí');
    } finally {
      setIsLoading(false);
    }
  };

  // Subcriteria CRUD operations
  const handleAddSubcriteria = (criteriaId: number) => {
    const criteria = criteriaList.find(c => c.id === criteriaId);
    if (!criteria) return;

    setSubcriteriaFormData({
      name: '',
      description: '',
      min_score: 0,
      max_score: 0,
      order_index: criteria.subcriteria.length + 1,
      is_active: true,
      editable: true,
      required_evidence: false,
      criteria_id: criteriaId
    });
    setEditingSubcriteria(null);
    setIsSubcriteriaDialogOpen(true);
  };

  const handleEditSubcriteria = (subcriteria: SubcriteriaItem) => {
    setSubcriteriaFormData({
      name: subcriteria.name,
      description: subcriteria.description,
      min_score: subcriteria.min_score,
      max_score: subcriteria.max_score,
      order_index: subcriteria.order_index,
      is_active: subcriteria.is_active,
      editable: subcriteria.editable,
      required_evidence: subcriteria.required_evidence,
      criteria_id: subcriteria.criteria_id
    });
    setEditingSubcriteria(subcriteria);
    setIsSubcriteriaDialogOpen(true);
  };

  const handleSaveSubcriteria = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingSubcriteria) {
        // Update existing subcriteria
        setCriteriaList(prev => prev.map(criteria => 
          criteria.id === subcriteriaFormData.criteria_id
            ? {
                ...criteria,
                subcriteria: criteria.subcriteria.map(sub =>
                  sub.id === editingSubcriteria.id
                    ? { ...sub, ...subcriteriaFormData, updated_at: new Date().toISOString() }
                    : sub
                )
              }
            : criteria
        ));
        toast.success('Cập nhật tiêu chí phụ thành công');
      } else {
        // Add new subcriteria
        const newSubcriteria: SubcriteriaItem = {
          id: Math.max(...criteriaList.flatMap(c => c.subcriteria.map(s => s.id))) + 1,
          ...subcriteriaFormData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setCriteriaList(prev => prev.map(criteria =>
          criteria.id === subcriteriaFormData.criteria_id
            ? { ...criteria, subcriteria: [...criteria.subcriteria, newSubcriteria] }
            : criteria
        ));
        toast.success('Thêm tiêu chí phụ mới thành công');
      }

      setIsSubcriteriaDialogOpen(false);
    } catch (error) {
      console.error('Error saving subcriteria:', error);
      toast.error('Lỗi khi lưu tiêu chí phụ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubcriteria = async (criteriaId: number, subcriteriaId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tiêu chí phụ này?')) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCriteriaList(prev => prev.map(criteria =>
        criteria.id === criteriaId
          ? { ...criteria, subcriteria: criteria.subcriteria.filter(sub => sub.id !== subcriteriaId) }
          : criteria
      ));
      toast.success('Xóa tiêu chí phụ thành công');
    } catch (error) {
      console.error('Error deleting subcriteria:', error);
      toast.error('Lỗi khi xóa tiêu chí phụ');
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = () => {
    const totalCriteria = filteredCriteria.length;
    const totalSubcriteria = filteredCriteria.reduce((sum, c) => sum + c.subcriteria.length, 0);
    const activeCriteria = filteredCriteria.filter(c => c.is_active).length;
    const evidenceRequired = filteredCriteria.reduce(
      (sum, c) => sum + c.subcriteria.filter(s => s.required_evidence).length, 0
    );
    const totalMaxScore = filteredCriteria.reduce((sum, c) => sum + c.max_score, 0);

    return { totalCriteria, totalSubcriteria, activeCriteria, evidenceRequired, totalMaxScore };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Đầu mục DRL</h1>
          <p className="text-muted-foreground">
            Quản lý các tiêu chí và tiêu chí phụ của bảng điểm rèn luyện
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadCriteriaData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={handleAddCriteria}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm tiêu chí
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCriteria}</p>
                <p className="text-sm text-gray-600">Tổng tiêu chí</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSubcriteria}</p>
                <p className="text-sm text-gray-600">Tiêu chí phụ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeCriteria}</p>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <Eye className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.evidenceRequired}</p>
                <p className="text-sm text-gray-600">Cần minh chứng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalMaxScore}</p>
                <p className="text-sm text-gray-600">Tổng điểm tối đa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc và tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Tìm kiếm</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên tiêu chí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label>Học kỳ</Label>
              <Select value={selectedSemester.toString()} onValueChange={(value) => setSelectedSemester(Number(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20242">HK2 2024-2025</SelectItem>
                  <SelectItem value="20241">HK1 2024-2025</SelectItem>
                  <SelectItem value="20232">HK2 2023-2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tiêu chí ({filteredCriteria.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : filteredCriteria.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Không có tiêu chí nào phù hợp với bộ lọc hiện tại.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredCriteria.map((criteria) => (
                <Card key={criteria.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCriteriaExpansion(criteria.id)}
                            className="p-1 h-auto"
                          >
                            {expandedCriteria.includes(criteria.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <h3 className="text-lg font-semibold">
                            {criteria.order_index}. {criteria.name}
                          </h3>
                          <Badge variant={criteria.is_active ? "default" : "secondary"}>
                            {criteria.is_active ? "Hoạt động" : "Tạm dừng"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 ml-7 mb-2">{criteria.description}</p>
                        <div className="flex items-center gap-4 ml-7 text-sm">
                          <span>Điểm: {criteria.min_score} - {criteria.max_score}</span>
                          <span>•</span>
                          <span>{criteria.subcriteria.length} tiêu chí phụ</span>
                          <span>•</span>
                          <span>Cập nhật: {format(new Date(criteria.updated_at), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSubcriteria(criteria.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCriteria(criteria)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCriteria(criteria.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Subcriteria Table */}
                    {expandedCriteria.includes(criteria.id) && (
                      <div className="mt-4 ml-7">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Tiêu chí phụ</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddSubcriteria(criteria.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm tiêu chí phụ
                          </Button>
                        </div>
                        {criteria.subcriteria.length === 0 ? (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              Chưa có tiêu chí phụ nào. Nhấn "Thêm tiêu chí phụ" để bắt đầu.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>STT</TableHead>
                                  <TableHead>Tên tiêu chí phụ</TableHead>
                                  <TableHead>Mô tả</TableHead>
                                  <TableHead>Điểm</TableHead>
                                  <TableHead>Trạng thái</TableHead>
                                  <TableHead>Cần minh chứng</TableHead>
                                  <TableHead>Thao tác</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {criteria.subcriteria.map((subcriteria) => (
                                  <TableRow key={subcriteria.id}>
                                    <TableCell>{subcriteria.order_index}</TableCell>
                                    <TableCell className="font-medium">
                                      {subcriteria.name}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                      {subcriteria.description}
                                    </TableCell>
                                    <TableCell>
                                      {subcriteria.min_score} - {subcriteria.max_score}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={subcriteria.is_active ? "default" : "secondary"}>
                                        {subcriteria.is_active ? "Hoạt động" : "Tạm dừng"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={subcriteria.required_evidence ? "destructive" : "outline"}>
                                        {subcriteria.required_evidence ? "Có" : "Không"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEditSubcriteria(subcriteria)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => handleDeleteSubcriteria(criteria.id, subcriteria.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Criteria Form Dialog */}
      <Dialog open={isCriteriaDialogOpen} onOpenChange={setIsCriteriaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCriteria ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Tên tiêu chí *</Label>
              <Input
                value={criteriaFormData.name}
                onChange={(e) => setCriteriaFormData({...criteriaFormData, name: e.target.value})}
                placeholder="Nhập tên tiêu chí"
              />
            </div>
            
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={criteriaFormData.description}
                onChange={(e) => setCriteriaFormData({...criteriaFormData, description: e.target.value})}
                placeholder="Nhập mô tả chi tiết"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Điểm tối thiểu</Label>
                <Input
                  type="number"
                  value={criteriaFormData.min_score}
                  onChange={(e) => setCriteriaFormData({...criteriaFormData, min_score: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Điểm tối đa *</Label>
                <Input
                  type="number"
                  value={criteriaFormData.max_score}
                  onChange={(e) => setCriteriaFormData({...criteriaFormData, max_score: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Thứ tự</Label>
                <Input
                  type="number"
                  value={criteriaFormData.order_index}
                  onChange={(e) => setCriteriaFormData({...criteriaFormData, order_index: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Học kỳ</Label>
                <Select 
                  value={criteriaFormData.semester.toString()} 
                  onValueChange={(value) => setCriteriaFormData({...criteriaFormData, semester: Number(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20242">HK2 2024-2025</SelectItem>
                    <SelectItem value="20241">HK1 2024-2025</SelectItem>
                    <SelectItem value="20232">HK2 2023-2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select 
                  value={criteriaFormData.is_active.toString()} 
                  onValueChange={(value) => setCriteriaFormData({...criteriaFormData, is_active: value === 'true'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCriteriaDialogOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveCriteria} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcriteria Form Dialog */}
      <Dialog open={isSubcriteriaDialogOpen} onOpenChange={setIsSubcriteriaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSubcriteria ? 'Chỉnh sửa tiêu chí phụ' : 'Thêm tiêu chí phụ mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Tên tiêu chí phụ *</Label>
              <Input
                value={subcriteriaFormData.name}
                onChange={(e) => setSubcriteriaFormData({...subcriteriaFormData, name: e.target.value})}
                placeholder="Nhập tên tiêu chí phụ"
              />
            </div>
            
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={subcriteriaFormData.description}
                onChange={(e) => setSubcriteriaFormData({...subcriteriaFormData, description: e.target.value})}
                placeholder="Nhập mô tả chi tiết"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Điểm tối thiểu</Label>
                <Input
                  type="number"
                  value={subcriteriaFormData.min_score}
                  onChange={(e) => setSubcriteriaFormData({...subcriteriaFormData, min_score: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Điểm tối đa *</Label>
                <Input
                  type="number"
                  value={subcriteriaFormData.max_score}
                  onChange={(e) => setSubcriteriaFormData({...subcriteriaFormData, max_score: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Thứ tự</Label>
                <Input
                  type="number"
                  value={subcriteriaFormData.order_index}
                  onChange={(e) => setSubcriteriaFormData({...subcriteriaFormData, order_index: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trạng thái</Label>
                <Select 
                  value={subcriteriaFormData.is_active.toString()} 
                  onValueChange={(value) => setSubcriteriaFormData({...subcriteriaFormData, is_active: value === 'true'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Có thể chỉnh sửa</Label>
                <Select 
                  value={subcriteriaFormData.editable.toString()} 
                  onValueChange={(value) => setSubcriteriaFormData({...subcriteriaFormData, editable: value === 'true'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Có</SelectItem>
                    <SelectItem value="false">Không</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Yêu cầu minh chứng</Label>
              <Select 
                value={subcriteriaFormData.required_evidence.toString()} 
                onValueChange={(value) => setSubcriteriaFormData({...subcriteriaFormData, required_evidence: value === 'true'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có</SelectItem>
                  <SelectItem value="false">Không</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSubcriteriaDialogOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveSubcriteria} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DauMucDrl;