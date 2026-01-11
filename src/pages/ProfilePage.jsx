import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { roleLabels } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Mail, Building2, Shield, Camera, Save } from 'lucide-react';
export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [avatarPreview, setAvatarPreview] = useState(null);
    if (!user)
        return null;
    const handleSave = () => {
        // Mock save - in real app would call API
        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
    };
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const statusColor = user.status === 'active' ? 'bg-green-500' : 'bg-red-500';
    return (<div className="max-w-3xl mx-auto">
      <PageHeader title="Thông tin cá nhân" description="Xem và cập nhật thông tin tài khoản của bạn"/>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Hồ sơ</CardTitle>
            {!isEditing ? (<Button variant="outline" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>) : (<div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setDisplayName(user.name);
                setAvatarPreview(null);
            }}>
                  Hủy
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2"/>
                  Lưu
                </Button>
              </div>)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview || user.avatar}/>
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (<label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4 text-primary-foreground"/>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
                </label>)}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                <span className="text-sm text-muted-foreground">{user.department}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid gap-6">
            {/* Display Name - Editable */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground"/>
                Tên hiển thị
              </Label>
              {isEditing ? (<Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nhập tên hiển thị"/>) : (<p className="text-sm py-2 px-3 bg-muted/50 rounded-md">{user.name}</p>)}
            </div>

            {/* Email - Read Only */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground"/>
                Email
                <Badge variant="outline" className="text-xs ml-2">Chỉ xem</Badge>
              </Label>
              <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">{user.email}</p>
            </div>

            {/* Role - Read Only */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground"/>
                Vai trò
                <Badge variant="outline" className="text-xs ml-2">Chỉ xem</Badge>
              </Label>
              <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">{roleLabels[user.role]}</p>
            </div>

            {/* Department - Read Only */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground"/>
                Phòng ban
                <Badge variant="outline" className="text-xs ml-2">Chỉ xem</Badge>
              </Label>
              <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">{user.department}</p>
            </div>

            {/* Account Status - Read Only */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Trạng thái tài khoản
                <Badge variant="outline" className="text-xs ml-2">Chỉ xem</Badge>
              </Label>
              <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-md">
                <span className={`w-2 h-2 rounded-full ${statusColor}`}/>
                <span className="text-sm">{user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}
