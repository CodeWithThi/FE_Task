import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/ui/card';
import { Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }
    if (!password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm())
      return;
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      }
      else {
        toast.error('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    }
    catch (error) {
      console.error('Login error:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
    finally {
      setIsLoading(false);
    }
  };
  return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
    <div className="w-full max-w-md animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
          <span className="text-primary-foreground font-bold text-2xl">TT</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Trung Tâm Dạy Học</h1>
        <p className="text-muted-foreground mt-1">Hệ thống quản lý dự án & công việc</p>
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin tài khoản để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="username" type="text" placeholder="Nhập tên đăng nhập" value={username} onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username)
                    setErrors({ ...errors, username: undefined });
                }} className={`pl-10 ${errors.username ? 'border-destructive' : ''}`} disabled={isLoading} />
              </div>
              {errors.username && (<p className="text-sm text-destructive">{errors.username}</p>)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors({ ...errors, password: undefined });
                }} className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`} disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" disabled={isLoading}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (<p className="text-sm text-destructive">{errors.password}</p>)}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (<>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>) : ('Đăng nhập')}
            </Button>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        © 2024 Trung Tâm Dạy Học. Bản quyền thuộc về trung tâm.
      </p>
    </div>
  </div>);
}
