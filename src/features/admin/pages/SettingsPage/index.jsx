import { useState, useEffect } from 'react';
import { PageHeader } from '@core/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/ui/card';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Button } from '@core/components/ui/button';
import { Separator } from '@core/components/ui/separator';
import { Switch } from '@core/components/ui/switch';
import { Building2, Bell, Users, Shield } from 'lucide-react';
import { settingsService } from '@core/services/settingsService';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    centerName: "",
    centerCode: "",
    address: "",
    phone: "",
    email: "",
    warningDays: 3,
    criticalDays: 1,
    emailNotify: true,
    dailyReminder: true,
    latenotify: true,
    maxUsers: 50,
    maxProjects: 20,
    maxFileSize: 25,
    maxStorage: 10,
    strongPassword: true,
    rotatePassword: false,
    lockAccount: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      if (response && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
      toast.error('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings(settings);
      toast.success('Lưu cấu hình thành công!');
    } catch (error) {
      console.error('Failed to save settings', error);
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (<div>
    <PageHeader title="Cấu hình Hệ thống" description="Quản lý cài đặt và cấu hình của hệ thống" />

    <div className="grid gap-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Thông tin Trung tâm
          </CardTitle>
          <CardDescription>
            Cấu hình thông tin cơ bản của trung tâm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="centerName">Tên trung tâm</Label>
              <Input id="centerName" value={settings.centerName} onChange={(e) => handleChange('centerName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="centerCode">Mã trung tâm</Label>
              <Input id="centerCode" value={settings.centerCode} onChange={(e) => handleChange('centerCode', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" value={settings.address} onChange={(e) => handleChange('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" value={settings.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={settings.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Cài đặt Thông báo
          </CardTitle>
          <CardDescription>
            Cấu hình các ngưỡng cảnh báo và thông báo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warningDays">Cảnh báo trước deadline (ngày)</Label>
              <Input id="warningDays" type="number" value={settings.warningDays} onChange={(e) => handleChange('warningDays', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criticalDays">Cảnh báo khẩn cấp (ngày)</Label>
              <Input id="criticalDays" type="number" value={settings.criticalDays} onChange={(e) => handleChange('criticalDays', parseInt(e.target.value))} />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thông báo qua email</p>
                <p className="text-sm text-muted-foreground">Gửi email khi có công việc mới hoặc thay đổi</p>
              </div>
              <Switch checked={settings.emailNotify} onCheckedChange={(checked) => handleChange('emailNotify', checked)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nhắc nhở hàng ngày</p>
                <p className="text-sm text-muted-foreground">Gửi tổng hợp công việc mỗi sáng</p>
              </div>
              <Switch checked={settings.dailyReminder} onCheckedChange={(checked) => handleChange('dailyReminder', checked)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thông báo trễ hạn</p>
                <p className="text-sm text-muted-foreground">Gửi cảnh báo khi công việc trễ hạn</p>
              </div>
              <Switch checked={settings.latenotify} onCheckedChange={(checked) => handleChange('latenotify', checked)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Giới hạn Hệ thống
          </CardTitle>
          <CardDescription>
            Cấu hình giới hạn người dùng và tài nguyên
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Giới hạn người dùng</Label>
              <Input id="maxUsers" type="number" value={settings.maxUsers} onChange={(e) => handleChange('maxUsers', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxProjects">Giới hạn dự án hoạt động</Label>
              <Input id="maxProjects" type="number" value={settings.maxProjects} onChange={(e) => handleChange('maxProjects', parseInt(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Dung lượng file tối đa (MB)</Label>
              <Input id="maxFileSize" type="number" value={settings.maxFileSize} onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStorage">Dung lượng lưu trữ (GB)</Label>
              <Input id="maxStorage" type="number" value={settings.maxStorage} onChange={(e) => handleChange('maxStorage', parseInt(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Bảo mật
          </CardTitle>
          <CardDescription>
            Cấu hình các tùy chọn bảo mật
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Yêu cầu mật khẩu mạnh</p>
              <p className="text-sm text-muted-foreground">Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường và số</p>
            </div>
            <Switch checked={settings.strongPassword} onCheckedChange={(checked) => handleChange('strongPassword', checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Đổi mật khẩu định kỳ</p>
              <p className="text-sm text-muted-foreground">Yêu cầu đổi mật khẩu mỗi 90 ngày</p>
            </div>
            <Switch checked={settings.rotatePassword} onCheckedChange={(checked) => handleChange('rotatePassword', checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Khóa tài khoản sau đăng nhập sai</p>
              <p className="text-sm text-muted-foreground">Khóa sau 5 lần đăng nhập sai</p>
            </div>
            <Switch checked={settings.lockAccount} onCheckedChange={(checked) => handleChange('lockAccount', checked)} />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </div>
  </div>);
}

