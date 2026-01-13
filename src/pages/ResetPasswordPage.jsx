import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const passwordRequirements = [
    { label: 'Ít nhất 6 ký tự', met: newPassword.length >= 6 },
    { label: 'Xác nhận trùng khớp', met: newPassword === confirmPassword && confirmPassword.length > 0 },
  ];
  const validateForm = () => {
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    }
    else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    }
    else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm())
      return;

    if (!token) {
      toast.error('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (!email) {
      toast.error('Email không hợp lệ.');
      return;
    }

    setIsLoading(true);

    const res = await authService.resetPassword(token, email, newPassword);

    if (res.ok) {
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate('/login');
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };
  return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
    <div className="w-full max-w-md animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
          <span className="text-primary-foreground font-bold text-2xl">TT</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Trung Tâm Dạy Học</h1>
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword)
                    setErrors({ ...errors, newPassword: '' });
                }} className={`pl-10 pr-10 ${errors.newPassword ? 'border-destructive' : ''}`} disabled={isLoading} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (<p className="text-sm text-destructive">{errors.newPassword}</p>)}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: '' });
                }} className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`} disabled={isLoading} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (<p className="text-sm text-destructive">{errors.confirmPassword}</p>)}
            </div>

            {/* Password Requirements */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              {passwordRequirements.map((req, index) => (<div key={index} className="flex items-center gap-2 text-sm">
                {req.met ? (<CheckCircle2 className="w-4 h-4 text-green-500" />) : (<XCircle className="w-4 h-4 text-muted-foreground" />)}
                <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                  {req.label}
                </span>
              </div>))}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (<>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>) : ('Đặt lại mật khẩu')}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>);
}
