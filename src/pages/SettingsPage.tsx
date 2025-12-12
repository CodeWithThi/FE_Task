import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Settings, Building2, Bell, Users, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Cấu hình Hệ thống"
        description="Quản lý cài đặt và cấu hình của hệ thống"
      />

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
                <Input id="centerName" defaultValue="Trung Tâm Dạy Học ABC" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="centerCode">Mã trung tâm</Label>
                <Input id="centerCode" defaultValue="TTDH-ABC" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input id="address" defaultValue="123 Đường ABC, Quận 1, TP.HCM" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" defaultValue="028 1234 5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="contact@trungtam.edu.vn" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">TT</span>
                </div>
                <Button variant="outline">Thay đổi logo</Button>
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
                <Input id="warningDays" type="number" defaultValue="3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criticalDays">Cảnh báo khẩn cấp (ngày)</Label>
                <Input id="criticalDays" type="number" defaultValue="1" />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thông báo qua email</p>
                  <p className="text-sm text-muted-foreground">Gửi email khi có công việc mới hoặc thay đổi</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nhắc nhở hàng ngày</p>
                  <p className="text-sm text-muted-foreground">Gửi tổng hợp công việc mỗi sáng</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thông báo trễ hạn</p>
                  <p className="text-sm text-muted-foreground">Gửi cảnh báo khi công việc trễ hạn</p>
                </div>
                <Switch defaultChecked />
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
                <Input id="maxUsers" type="number" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxProjects">Giới hạn dự án hoạt động</Label>
                <Input id="maxProjects" type="number" defaultValue="20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Dung lượng file tối đa (MB)</Label>
                <Input id="maxFileSize" type="number" defaultValue="25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStorage">Dung lượng lưu trữ (GB)</Label>
                <Input id="maxStorage" type="number" defaultValue="10" />
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
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Đổi mật khẩu định kỳ</p>
                <p className="text-sm text-muted-foreground">Yêu cầu đổi mật khẩu mỗi 90 ngày</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Khóa tài khoản sau đăng nhập sai</p>
                <p className="text-sm text-muted-foreground">Khóa sau 5 lần đăng nhập sai</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
