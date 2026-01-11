import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    // Demo password check
    const DEMO_PASSWORD = '123456';
    const validateForm = () => {
        const newErrors = {};
        if (!currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }
        else if (currentPassword !== DEMO_PASSWORD) {
            newErrors.currentPassword = 'Mật khẩu hiện tại không đúng';
        }
        if (!newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        }
        else if (newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        }
        else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        if (newPassword === currentPassword && currentPassword) {
            newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Đổi mật khẩu thành công!');
        setIsLoading(false);
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
    };
    const passwordRequirements = [
        { label: 'Ít nhất 6 ký tự', met: newPassword.length >= 6 },
        { label: 'Khác mật khẩu hiện tại', met: newPassword !== currentPassword && newPassword.length > 0 },
        { label: 'Xác nhận trùng khớp', met: newPassword === confirmPassword && confirmPassword.length > 0 },
    ];
    return (<div className="max-w-xl mx-auto">
      <PageHeader title="Đổi mật khẩu" description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn"/>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-5 h-5"/>
            Thay đổi mật khẩu
          </CardTitle>
          <CardDescription>
            Mật khẩu demo hiện tại là: <code className="bg-muted px-1 rounded">123456</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input id="currentPassword" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) {
                setErrors({ ...errors, currentPassword: '' });
            }
        }} placeholder="Nhập mật khẩu hiện tại" className={errors.currentPassword ? 'border-destructive' : ''}/>
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              {errors.currentPassword && (<p className="text-sm text-destructive">{errors.currentPassword}</p>)}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.newPassword) {
                setErrors({ ...errors, newPassword: '' });
            }
        }} placeholder="Nhập mật khẩu mới" className={errors.newPassword ? 'border-destructive' : ''}/>
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              {errors.newPassword && (<p className="text-sm text-destructive">{errors.newPassword}</p>)}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: '' });
            }
        }} placeholder="Nhập lại mật khẩu mới" className={errors.confirmPassword ? 'border-destructive' : ''}/>
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              {errors.confirmPassword && (<p className="text-sm text-destructive">{errors.confirmPassword}</p>)}
            </div>

            {/* Password Requirements */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium mb-3">Yêu cầu mật khẩu:</p>
              {passwordRequirements.map((req, index) => (<div key={index} className="flex items-center gap-2 text-sm">
                  {req.met ? (<CheckCircle2 className="w-4 h-4 text-green-500"/>) : (<XCircle className="w-4 h-4 text-muted-foreground"/>)}
                  <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                    {req.label}
                  </span>
                </div>))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);
}
