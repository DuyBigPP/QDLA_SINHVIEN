import { useState, useEffect, useCallback } from 'react';
import { DashboardService, type DashboardEvidence } from '@/service/dashboardService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  BarChart3,
  RefreshCw,
  Filter,
  Search,
  Download,
  Activity
} from 'lucide-react';

interface EvidenceCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối'
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle
};

const AdminDashboard = () => {
  const [evidenceCounts, setEvidenceCounts] = useState<EvidenceCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [allEvidence, setAllEvidence] = useState<DashboardEvidence[]>([]);
  const [filteredEvidence, setFilteredEvidence] = useState<DashboardEvidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<DashboardEvidence | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSemester, setCurrentSemester] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load evidence counts
      const countsResponse = await DashboardService.getAllEvidenceCounts(currentSemester);
      if (countsResponse.success && countsResponse.data) {
        setEvidenceCounts(countsResponse.data);
      }

      // Load all evidence details
      const evidenceResponse = await DashboardService.getAllEvidenceDetails(currentSemester);
      if (evidenceResponse.success && evidenceResponse.data) {
        setAllEvidence(evidenceResponse.data);
        setFilteredEvidence(evidenceResponse.data);
      }

      if (countsResponse.success || evidenceResponse.success) {
        toast.success('Tải dữ liệu dashboard thành công');
      } else {
        toast.error('Không thể tải dữ liệu dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Lỗi khi tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [currentSemester]);
  // Filter evidence based on status and search term
  useEffect(() => {
    let filtered = allEvidence;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((evidence) => evidence.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter((evidence) => 
        evidence.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evidence.id.toString().includes(searchTerm)
      );
    }

    setFilteredEvidence(filtered);
  }, [allEvidence, filterStatus, searchTerm]);  // Load data on component mount and semester change
  useEffect(() => {
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSemester]); // Only depend on currentSemester, loadDashboardData is stable with useCallback

  const handleViewEvidence = (evidence: DashboardEvidence) => {
    setSelectedEvidence(evidence);
    setIsDetailDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  // Calculate percentage for each status
  const getPercentage = (count: number) => {
    return evidenceCounts.total > 0 ? ((count / evidenceCounts.total) * 100).toFixed(1) : '0';
  };

  const handleRefreshData = () => {
    loadDashboardData();
  };
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Quản lý và thống kê minh chứng rèn luyện của sinh viên
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={currentSemester.toString()} 
            onValueChange={(value) => setCurrentSemester(parseInt(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn kỳ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Kỳ 1</SelectItem>
              <SelectItem value="2">Kỳ 2</SelectItem>
              <SelectItem value="3">Kỳ 3</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefreshData} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng minh chứng</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evidenceCounts.total}</div>
            <p className="text-xs text-muted-foreground">
              +{evidenceCounts.pending + evidenceCounts.approved + evidenceCounts.rejected} so với trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{evidenceCounts.pending}</div>
            <p className="text-xs text-muted-foreground">
              {getPercentage(evidenceCounts.pending)}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{evidenceCounts.approved}</div>
            <p className="text-xs text-muted-foreground">
              {getPercentage(evidenceCounts.approved)}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{evidenceCounts.rejected}</div>
            <p className="text-xs text-muted-foreground">
              {getPercentage(evidenceCounts.rejected)}% tổng số
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="evidence">Quản lý minh chứng</TabsTrigger>
          <TabsTrigger value="statistics">Thống kê</TabsTrigger>
        </TabsList>        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Hoạt động gần đây
                </CardTitle>
                <CardDescription>
                  Các minh chứng được cập nhật gần đây
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvidence.slice(0, 5).map((evidence) => (
                    <div key={evidence.id} className="flex items-center gap-3">
                      {getStatusIcon(evidence.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {evidence.description || `Minh chứng #${evidence.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(evidence.created_at)}
                        </p>
                      </div>
                      <Badge variant="outline" className={statusColors[evidence.status as keyof typeof statusColors]}>
                        {statusLabels[evidence.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  ))}
                  {filteredEvidence.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Chưa có minh chứng nào
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tình trạng minh chứng
                </CardTitle>
                <CardDescription>
                  Phân bố theo trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Chờ duyệt</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{evidenceCounts.pending}</div>
                      <div className="text-xs text-muted-foreground">{getPercentage(evidenceCounts.pending)}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Đã duyệt</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{evidenceCounts.approved}</div>
                      <div className="text-xs text-muted-foreground">{getPercentage(evidenceCounts.approved)}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Từ chối</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{evidenceCounts.rejected}</div>
                      <div className="text-xs text-muted-foreground">{getPercentage(evidenceCounts.rejected)}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>        {/* Evidence Management Tab */}
        <TabsContent value="evidence" className="space-y-4">
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
                  <Label htmlFor="search">Tìm kiếm</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Tìm theo ID hoặc mô tả..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="status-filter">Trạng thái</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách minh chứng</CardTitle>
                  <CardDescription>
                    Hiển thị {filteredEvidence.length} trong tổng số {allEvidence.length} minh chứng
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất dữ liệu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Đang tải dữ liệu...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredEvidence.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          <div className="text-muted-foreground">
                            Không tìm thấy minh chứng nào
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEvidence.map((evidence) => (
                        <TableRow key={evidence.id}>
                          <TableCell className="font-medium">#{evidence.id}</TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">
                              {evidence.description || 'Không có mô tả'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[evidence.status as keyof typeof statusColors]}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(evidence.status)}
                                {statusLabels[evidence.status as keyof typeof statusLabels]}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(evidence.created_at)}</TableCell>
                          <TableCell>{formatDate(evidence.updated_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEvidence(evidence)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Thống kê tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tổng số minh chứng:</span>
                    <span className="font-semibold">{evidenceCounts.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tỷ lệ duyệt:</span>
                    <span className="font-semibold text-green-600">
                      {getPercentage(evidenceCounts.approved)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tỷ lệ từ chối:</span>
                    <span className="font-semibold text-red-600">
                      {getPercentage(evidenceCounts.rejected)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Chờ xử lý:</span>
                    <span className="font-semibold text-yellow-600">
                      {getPercentage(evidenceCounts.pending)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Hoạt động hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Kỳ hiện tại:</span>
                    <span className="font-semibold">Kỳ {currentSemester}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Minh chứng mới nhất:</span>
                    <span className="font-semibold">
                      {allEvidence.length > 0 ? formatDate(allEvidence[0]?.created_at) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cập nhật cuối:</span>
                    <span className="font-semibold">
                      {allEvidence.length > 0 ? formatDate(allEvidence[0]?.updated_at) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>      {/* Evidence Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết minh chứng #{selectedEvidence?.id}</DialogTitle>
          </DialogHeader>
          {selectedEvidence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID minh chứng</Label>
                  <p className="text-sm text-muted-foreground">#{selectedEvidence.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={statusColors[selectedEvidence.status as keyof typeof statusColors]}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedEvidence.status)}
                        {statusLabels[selectedEvidence.status as keyof typeof statusLabels]}
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedEvidence.description || 'Không có mô tả'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Ngày tạo</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedEvidence.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ngày cập nhật</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedEvidence.updated_at)}</p>
                </div>
              </div>

              {selectedEvidence.semester && (
                <div>
                  <Label className="text-sm font-medium">Kỳ học</Label>
                  <p className="text-sm text-muted-foreground">Kỳ {selectedEvidence.semester}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
