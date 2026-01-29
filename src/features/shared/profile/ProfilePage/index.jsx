import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { authService } from '@core/services/authService';
import { httpClient } from '@core/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { roleLabels } from '@/models';
import { PageHeader } from '@core/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/avatar';
import { Badge } from '@core/components/ui/badge';
import { Separator } from '@core/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@core/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@core/components/ui/tooltip';
import { Alert, AlertDescription } from '@core/components/ui/alert';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Building2,
  Shield,
  Camera,
  Save,
  Phone,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  X,
  Key,
  History,
  UserCircle
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Activity Logs State
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const response = await httpClient.get('/system-logs?limit=10');
      if (response.data?.data?.logs) {
        setActivities(response.data.data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Edit states
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Form data
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Loading states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Initialize phone from user data
  useEffect(() => {
    if (user?.phone || user?.phoneNumber) {
      setPhoneNumber(user.phone || user.phoneNumber || '');
    }
  }, [user]);

  if (!user) return null;

  // Check if account is locked
  const isLocked = user.status !== 'active';
  const lockReason = user.lockReason || 'Tài khoản đã bị khóa bởi quản trị viên.';

  // Avatar upload handler
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 2MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setIsEditingAvatar(true);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      toast.info('Không có thay đổi nào để lưu');
      setIsEditingAvatar(false);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await fetch('http://localhost:3069/api/v1/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('Cập nhật ảnh đại diện thành công!');
        // Reload page to refresh user context with new avatar
        window.location.reload();
      } else {
        toast.error(result.message || 'Cập nhật ảnh đại diện thất bại');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCancelAvatar = () => {
    setAvatarPreview(null);
    setSelectedFile(null);
    setIsEditingAvatar(false);
  };

  // Phone number handlers
  const handleSavePhone = async () => {
    // Validate Vietnamese phone number
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    setIsSavingPhone(true);
    try {
      const response = await authService.updateProfile({ phoneNumber });

      if (response.ok) {
        toast.success('Cập nhật số điện thoại thành công!');
        setIsEditingPhone(false);
        // Update local storage user
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          userData.phoneNumber = phoneNumber;
          // Also update 'phone' prop if it exists
          if (userData.phone) userData.phone = phoneNumber;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        toast.error(response.message || 'Cập nhật số điện thoại thất bại');
      }
    } catch (error) {
      console.error('Update phone error:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleCancelPhone = () => {
    setPhoneNumber(user.phone || user.phoneNumber || '');
    setIsEditingPhone(false);
  };

  // Status badge color
  const getStatusBadge = () => {
    if (isLocked) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="cursor-help">
                <XCircle className="w-3 h-3 mr-1" />
                Đã khóa
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">Lý do khóa:</p>
              <p className="text-sm text-muted-foreground">{lockReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Đang hoạt động
      </Badge>
    );
  };

  const getActionLabel = (action) => {
    const labels = {
      'login': 'Đăng nhập',
      'logout': 'Đăng xuất',
      'login_failed': 'Đăng nhập thất bại',
      'password_reset': 'Đặt lại mật khẩu',
      'password_change': 'Đổi mật khẩu',
      'user_create': 'Tạo người dùng',
      'user_update': 'Cập nhật hồ sơ',
      'user_delete': 'Xóa người dùng',
      'user_restore': 'Khôi phục người dùng',
    };
    return labels[action] || action;
  };

  const getActivityIcon = (action) => {
    if (action?.includes('login') || action?.includes('logout')) return <User className="w-5 h-5 text-primary" />;
    if (action?.includes('password') || action?.includes('security')) return <Lock className="w-5 h-5 text-primary" />;
    if (action?.includes('user_update') || action?.includes('profile')) return <Edit3 className="w-5 h-5 text-primary" />;
    return <History className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <PageHeader
        title="Thông tin cá nhân"
        description="Xem và cập nhật thông tin tài khoản của bạn"
      />

      {/* Locked Account Warning */}
      {isLocked && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <span className="font-medium">Tài khoản của bạn đã bị khóa.</span>{' '}
            {lockReason} Vui lòng liên hệ quản trị viên để được hỗ trợ.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-6" onValueChange={(val) => {
        if (val === 'activity') fetchActivities();
      }}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="personal" className="gap-2">
            <UserCircle className="w-4 h-4 hidden sm:inline" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4 hidden sm:inline" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <History className="w-4 h-4 hidden sm:inline" />
            Hoạt động
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          {/* Hero Card - Avatar & Basic Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar Section */}
                <div className="relative group">
                  <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
                    <AvatarImage src={avatarPreview || user.avatar} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Camera overlay - only show if not locked */}
                  {!isLocked && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                    <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge variant="secondary" className="text-sm">
                      <Shield className="w-3 h-3 mr-1" />
                      {roleLabels[user.role] || user.role}
                    </Badge>
                    {user.department && (
                      <Badge variant="outline" className="text-sm">
                        <Building2 className="w-3 h-3 mr-1" />
                        {user.department}
                      </Badge>
                    )}
                    {getStatusBadge()}
                  </div>
                </div>
              </div>

              {/* Avatar Edit Actions */}
              {isEditingAvatar && (
                <div className="flex justify-center sm:justify-start gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelAvatar}
                    disabled={isUploadingAvatar}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAvatar}
                    disabled={isUploadingAvatar}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {isUploadingAvatar ? 'Đang lưu...' : 'Lưu ảnh'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
                  <CardDescription>Email và số điện thoại của bạn</CardDescription>
                </div>
                {!isLocked && !isEditingPhone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPhone(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email - Read Only */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md flex-1">
                    {user.email}
                  </p>
                  <Badge variant="outline" className="text-xs shrink-0">Chỉ xem</Badge>
                </div>
              </div>

              {/* Phone Number - Editable */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Số điện thoại</span>
                </div>
                <div className="flex-1">
                  {isEditingPhone ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Nhập số điện thoại (VD: 0901234567)"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelPhone}
                        disabled={isSavingPhone}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSavePhone}
                        disabled={isSavingPhone}
                      >
                        {isSavingPhone ? '...' : <Save className="w-4 h-4" />}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                      {phoneNumber || user.phone || user.phoneNumber || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Thông tin công việc</CardTitle>
              <CardDescription>Vai trò và phòng ban của bạn trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role - Read Only */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Vai trò</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md flex-1">
                    {roleLabels[user.role] || user.role}
                  </p>
                  <Badge variant="outline" className="text-xs shrink-0">Chỉ xem</Badge>
                </div>
              </div>

              {/* Department - Read Only */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Phòng ban</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md flex-1">
                    {user.department || 'Chưa phân bổ'}
                  </p>
                  <Badge variant="outline" className="text-xs shrink-0">Chỉ xem</Badge>
                </div>
              </div>

              {/* Account Status - Read Only */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Trạng thái</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 py-2 px-3 bg-muted/50 rounded-md">
                    {getStatusBadge()}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">Chỉ xem</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="w-5 h-5" />
                Mật khẩu
              </CardTitle>
              <CardDescription>
                Bảo vệ tài khoản của bạn bằng mật khẩu mạnh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Đổi mật khẩu</p>
                  <p className="text-sm text-muted-foreground">
                    Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn
                  </p>
                </div>
                {!isLocked ? (
                  <Button asChild>
                    <Link to="/change-password">
                      <Lock className="w-4 h-4 mr-2" />
                      Đổi mật khẩu
                    </Link>
                  </Button>
                ) : (
                  <Button disabled>
                    <Lock className="w-4 h-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Future: Two-Factor Authentication */}
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Xác thực hai lớp
                <Badge variant="secondary" className="ml-2">Sắp ra mắt</Badge>
              </CardTitle>
              <CardDescription>
                Tăng cường bảo mật với xác thực hai lớp (2FA)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Kích hoạt 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Tính năng này đang được phát triển
                  </p>
                </div>
                <Button disabled variant="outline">
                  Kích hoạt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Recent Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Hoạt động gần đây
              </CardTitle>
              <CardDescription>
                Lịch sử các hoạt động trên tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Activity Timeline */}
              <div className="space-y-4">
                {isLoadingActivities ? (
                  <div className="text-center py-8 text-muted-foreground">Đang tải hoạt động...</div>
                ) : activities.length > 0 ? (
                  activities.map((log, index) => (
                    <div key={log.id || index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {getActivityIcon(log.Action)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{getActionLabel(log.Action)}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.Message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.CreatedAt ? format(new Date(log.CreatedAt), "dd/MM/yyyy HH:mm", { locale: vi }) : ''}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Chưa có hoạt động nào được ghi nhận.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
