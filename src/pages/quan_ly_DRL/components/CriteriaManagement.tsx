
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, RefreshCw, Eye } from 'lucide-react';
import { drlService } from '@/service/drlService';
import { useAuth } from '@/context/AuthContext';
import { 
  DRLCriteria, 
  DRLSubCriteria, 
  DRLUpdateRequest,
  calculateRank 
} from '@/types/drl';

interface CriteriaManagementProps {
  semester: number;
  onScoreUpdate?: () => void;
}

const CriteriaManagement: React.FC<CriteriaManagementProps> = ({ 
  semester, 
  onScoreUpdate 
}) => {
  const { user } = useAuth();
  const [criteria, setCriteria] = useState<Record<string, DRLCriteria>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCriteria();
  }, [semester]);

  const loadCriteria = async () => {
    setLoading(true);
    try {
      const response = await drlService.getCriteria(semester);
      if (response && response.success) {
        setCriteria(response.payload.criteria);
        // Initialize scores from existing data
        const initialScores: Record<string, number> = {};
        Object.values(response.payload.criteria).forEach(criterion => {
          Object.values(criterion.subcriteria).forEach(subcriteria => {
            const key = `${subcriteria.id}`;
            const existingScore = user?.role === 'student' 
              ? subcriteria.self_score
              : user?.role === 'class_leader'
              ? subcriteria.class_leader_score
              : subcriteria.teacher_score;
            
            if (existingScore !== null) {
              initialScores[key] = existingScore;
            }
          });
        });
        setScores(initialScores);
      } else {
        toast.error('Không thể tải tiêu chí đánh giá');
      }
    } catch (error) {
      console.error('Error loading criteria:', error);
      toast.error('Lỗi khi tải tiêu chí đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (subcriteriaId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setScores(prev => ({
      ...prev,
      [subcriteriaId.toString()]: numValue
    }));
  };

  const saveScore = async (subcriteriaId: number) => {
    if (!user?.id) {
      toast.error('Không thể xác định người dùng');
      return;
    }

    setSaving(true);
    try {
      const score = scores[subcriteriaId.toString()] || 0;
      const request: DRLUpdateRequest = {
        id: subcriteriaId,
        score: score,
        semester: semester,
        user_id: parseInt(user.id)
      };

      const success = await drlService.updateSubcriteriaScore(request);
      if (success) {
        toast.success('Cập nhật điểm thành công');
        // Reload criteria to get updated scores
        await loadCriteria();
        onScoreUpdate?.();
      } else {
        toast.error('Không thể cập nhật điểm');
      }
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Lỗi khi lưu điểm');
    } finally {
      setSaving(false);
    }
  };

  const saveAllScores = async () => {
    if (!user?.id) {
      toast.error('Không thể xác định người dùng');
      return;
    }

    setSaving(true);
    try {
      const promises = Object.entries(scores).map(([subcriteriaId, score]) => {
        const request: DRLUpdateRequest = {
          id: parseInt(subcriteriaId),
          score: score,
          semester: semester,
          user_id: parseInt(user.id)
        };
        return drlService.updateSubcriteriaScore(request);
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      
      if (successCount === results.length) {
        toast.success('Cập nhật tất cả điểm thành công');
        await loadCriteria();
        onScoreUpdate?.();
      } else {
        toast.warning(`Cập nhật thành công ${successCount}/${results.length} điểm`);
      }
    } catch (error) {
      console.error('Error saving all scores:', error);
      toast.error('Lỗi khi lưu điểm');
    } finally {
      setSaving(false);
    }
  };

  const getTotalScore = () => {
    return Object.values(scores).reduce((total, score) => total + (score || 0), 0);
  };

  const canEditScore = (subcriteria: DRLSubCriteria) => {
    // Students can edit their self_score
    if (user?.role === 'student') {
      return subcriteria.self_score === null || subcriteria.self_score === undefined;
    }
    // Class leaders can edit class_leader_score
    if (user?.role === 'class_leader') {
      return subcriteria.class_leader_score === null || subcriteria.class_leader_score === undefined;
    }
    // Teachers can edit teacher_score
    if (user?.role === 'teacher') {
      return subcriteria.teacher_score === null || subcriteria.teacher_score === undefined;
    }
    return false;
  };

  const getScoreDisplayValue = (subcriteria: DRLSubCriteria) => {
    if (user?.role === 'student') {
      return subcriteria.self_score ?? scores[subcriteria.id.toString()] ?? '';
    }
    if (user?.role === 'class_leader') {
      return subcriteria.class_leader_score ?? scores[subcriteria.id.toString()] ?? '';
    }
    if (user?.role === 'teacher') {
      return subcriteria.teacher_score ?? scores[subcriteria.id.toString()] ?? '';
    }
    return '';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Đang tải tiêu chí đánh giá...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tổng quan điểm rèn luyện</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Học kỳ {semester % 10} năm học {Math.floor(semester / 10)}-{Math.floor(semester / 10) + 1}
              </span>
              <Button 
                onClick={loadCriteria} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Làm mới
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{getTotalScore()}</div>
              <div className="text-sm text-blue-600">Tổng điểm hiện tại</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {calculateRank(getTotalScore())}
              </div>
              <div className="text-sm text-green-600">Xếp loại</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(scores).length}
              </div>
              <div className="text-sm text-purple-600">Tiêu chí đã chấm</div>
            </div>
          </div>
          
          {Object.keys(scores).length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={saveAllScores} 
                disabled={saving}
                className="px-6"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Lưu tất cả điểm
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Criteria Cards */}
      <div className="grid gap-6">
        {Object.values(criteria).map((criterion) => (
          <Card key={criterion.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {criterion.name}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Điểm tối thiểu: {criterion.min_score} | Điểm tối đa: {criterion.max_score}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(criterion.subcriteria).map((subcriteria) => (
                  <div key={subcriteria.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{subcriteria.name}</h4>
                        <div className="text-sm text-muted-foreground mb-3">
                          Điểm: {subcriteria.min_score} - {subcriteria.max_score}
                        </div>
                        
                        {/* Score Display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Tự đánh giá:</Label>
                            <span className={`px-2 py-1 rounded ${subcriteria.self_score !== null ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
                              {subcriteria.self_score ?? 'Chưa chấm'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Lớp trưởng:</Label>
                            <span className={`px-2 py-1 rounded ${subcriteria.class_leader_score !== null ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                              {subcriteria.class_leader_score ?? 'Chưa chấm'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Giáo viên:</Label>
                            <span className={`px-2 py-1 rounded ${subcriteria.teacher_score !== null ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>
                              {subcriteria.teacher_score ?? 'Chưa chấm'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Score Input */}
                      {canEditScore(subcriteria) && (
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <Input
                            type="number"
                            min={subcriteria.min_score}
                            max={subcriteria.max_score}
                            value={getScoreDisplayValue(subcriteria)}
                            onChange={(e) => handleScoreChange(subcriteria.id, e.target.value)}
                            className="w-20"
                            placeholder="0"
                          />
                          <Button
                            onClick={() => saveScore(subcriteria.id)}
                            disabled={saving}
                            size="sm"
                          >
                            {saving ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {!canEditScore(subcriteria) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          Chỉ xem
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CriteriaManagement;
