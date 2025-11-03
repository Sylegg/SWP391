'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth-guards';
import DealerStaffLayout from '@/components/layout/dealer-staff-layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCustomerProfile,
  CustomerProfileRes,
  createNote,
  createTag,
  deleteNote,
  deleteTag,
  CustomerNoteReq,
  CustomerTagReq,
} from '@/lib/crmApi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  StickyNote,
  Tag,
  Plus,
  Trash2,
  Car,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const customerId = parseInt(params.id as string);
  
  const [profile, setProfile] = useState<CustomerProfileRes | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Note dialog
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  
  // Tag dialog
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('blue');
  const [submittingTag, setSubmittingTag] = useState(false);
  
  const TAG_COLORS = [
    { value: 'blue', label: 'Xanh dương', class: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'green', label: 'Xanh lá', class: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'yellow', label: 'Vàng', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'red', label: 'Đỏ', class: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'purple', label: 'Tím', class: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'gray', label: 'Xám', class: 'bg-gray-100 text-gray-800 border-gray-200' },
  ];
  
  useEffect(() => {
    loadProfile();
  }, [customerId]);
  
  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCustomerProfile(customerId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin khách hàng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateNote = async () => {
    if (!noteContent.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung ghi chú',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmittingNote(true);
    try {
      const noteReq: CustomerNoteReq = {
        userId: customerId,
        dealerId: user?.dealerId || 0,
        content: noteContent,
        createdBy: user?.username || 'Unknown',
      };
      
      await createNote(noteReq);
      toast({
        title: 'Thành công',
        description: 'Đã thêm ghi chú',
      });
      
      setNoteContent('');
      setIsNoteDialogOpen(false);
      loadProfile();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm ghi chú',
        variant: 'destructive',
      });
    } finally {
      setSubmittingNote(false);
    }
  };
  
  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) return;
    
    try {
      await deleteNote(noteId);
      toast({
        title: 'Thành công',
        description: 'Đã xóa ghi chú',
      });
      loadProfile();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa ghi chú',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên nhãn',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmittingTag(true);
    try {
      const tagReq: CustomerTagReq = {
        userId: customerId,
        dealerId: user?.dealerId || 0,
        tag: tagName,
        color: tagColor,
      };
      
      await createTag(tagReq);
      toast({
        title: 'Thành công',
        description: 'Đã thêm nhãn',
      });
      
      setTagName('');
      setTagColor('blue');
      setIsTagDialogOpen(false);
      loadProfile();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm nhãn (có thể đã tồn tại)',
        variant: 'destructive',
      });
    } finally {
      setSubmittingTag(false);
    }
  };
  
  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('Bạn có chắc muốn xóa nhãn này?')) return;
    
    try {
      await deleteTag(tagId);
      toast({
        title: 'Thành công',
        description: 'Đã xóa nhãn',
      });
      loadProfile();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa nhãn',
        variant: 'destructive',
      });
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Chờ xác nhận', variant: 'outline' },
      CONFIRMED: { label: 'Đã xác nhận', variant: 'default' },
      COMPLETED: { label: 'Hoàn thành', variant: 'secondary' },
      CANCELED: { label: 'Đã hủy', variant: 'destructive' },
    };
    
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  
  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-blue-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Dealer Staff']}>
        <DealerStaffLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Đang tải...</p>
            </div>
          </div>
        </DealerStaffLayout>
      </ProtectedRoute>
    );
  }
  
  if (!profile) {
    return (
      <ProtectedRoute allowedRoles={['Dealer Staff']}>
        <DealerStaffLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy khách hàng</p>
            <Button onClick={() => router.back()} className="mt-4">Quay lại</Button>
          </div>
        </DealerStaffLayout>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute allowedRoles={['Dealer Staff']}>
      <DealerStaffLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hồ sơ khách hàng</h1>
              <p className="text-muted-foreground">Chi tiết và lịch sử tương tác</p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Quay lại
            </Button>
          </div>
          
          {/* Customer Info & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{profile.user.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.user.phone || 'Chưa có'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="text-sm">{profile.user.address || 'Chưa có'}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng lái thử:</span>
                  <span className="font-bold">{profile.stats.totalTestDrives}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hoàn thành:</span>
                  <span className="font-semibold text-green-600">{profile.stats.completedTestDrives}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Đã hủy:</span>
                  <span className="font-semibold text-red-600">{profile.stats.canceledTestDrives}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Đánh giá TB:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {profile.stats.averageRating.toFixed(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Lead Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Điểm tiềm năng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getLeadScoreColor(profile.stats.leadScore)}`}>
                    {profile.stats.leadScore}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">/ 100 điểm</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className={`h-2 rounded-full ${
                        profile.stats.leadScore >= 80 ? 'bg-green-600' :
                        profile.stats.leadScore >= 50 ? 'bg-blue-600' :
                        profile.stats.leadScore >= 30 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${profile.stats.leadScore}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tags */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Nhãn
              </CardTitle>
              <Button size="sm" onClick={() => setIsTagDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm nhãn
              </Button>
            </CardHeader>
            <CardContent>
              {profile.tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có nhãn nào</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => {
                    const colorClass = TAG_COLORS.find((c) => c.value === tag.color)?.class || 'bg-gray-100 text-gray-800';
                    return (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className={`${colorClass} cursor-pointer group`}
                      >
                        {tag.tag}
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Timeline: Test Drives & Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Drives History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Lịch sử lái thử
                </CardTitle>
                <CardDescription>{profile.testDrives.length} lượt lái thử</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.testDrives.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có lượt lái thử nào</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {profile.testDrives.map((testDrive: any) => (
                      <div key={testDrive.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {testDrive.productName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(testDrive.scheduleDate)}
                            </p>
                          </div>
                          {getStatusBadge(testDrive.status)}
                        </div>
                        {testDrive.notes && (
                          <p className="text-sm text-muted-foreground border-t pt-2">
                            {testDrive.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Notes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Ghi chú
                  </CardTitle>
                  <CardDescription>{profile.notes.length} ghi chú</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsNoteDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm ghi chú
                </Button>
              </CardHeader>
              <CardContent>
                {profile.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có ghi chú nào</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {profile.notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          <span className="font-semibold">{note.createdBy}</span>
                          {' • '}
                          {formatDate(note.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Add Note Dialog */}
          <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm ghi chú</DialogTitle>
                <DialogDescription>
                  Thêm ghi chú về khách hàng này
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Nhập nội dung ghi chú..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={5}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateNote} disabled={submittingNote}>
                  {submittingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Add Tag Dialog */}
          <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm nhãn</DialogTitle>
                <DialogDescription>
                  Gắn nhãn cho khách hàng để dễ phân loại
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tên nhãn</label>
                  <Input
                    placeholder="VD: Khách hàng tiềm năng"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Màu sắc</label>
                  <Select value={tagColor} onValueChange={setTagColor}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.class}`}></div>
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateTag} disabled={submittingTag}>
                  {submittingTag ? 'Đang thêm...' : 'Thêm nhãn'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
