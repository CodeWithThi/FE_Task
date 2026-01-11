import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!validateEmail(email)) {
            setError('Email không hợp lệ');
            return;
        }
        setIsLoading(true);
        setError('');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSubmitted(true);
    };
    if (isSubmitted) {
        return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="shadow-xl border-0">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600"/>
              </div>
              <h2 className="text-xl font-semibold mb-2">Yêu cầu đã được gửi</h2>
              <p className="text-muted-foreground mb-6">
                Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến địa chỉ email của bạn.
              </p>
              <Link to="/login">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2"/>
                  Quay lại đăng nhập
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>);
    }
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
            <CardTitle className="text-xl">Quên mật khẩu</CardTitle>
            <CardDescription>
              Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                  <Input id="email" type="email" placeholder="email@trungtam.edu.vn" value={email} onChange={(e) => {
            setEmail(e.target.value);
            if (error)
                setError('');
        }} className={`pl-10 ${error ? 'border-destructive' : ''}`} disabled={isLoading}/>
                </div>
                {error && (<p className="text-sm text-destructive">{error}</p>)}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (<>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Đang gửi yêu cầu...
                  </>) : ('Gửi yêu cầu')}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3"/>
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>);
}
