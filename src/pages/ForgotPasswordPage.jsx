import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@core/services/authService';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { AuthLayout } from '@core/components/common/AuthLayout';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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

    try {
      const res = await authService.forgotPassword(email);

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        setError(res.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      setError("Lỗi kết nối server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen
  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 space-y-6">
          <div className="text-center space-y-4">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 ring-4 ring-green-100">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Yêu cầu đã gửi thành công!
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.
              </p>
            </div>

            {/* Back Button */}
            <div className="pt-4">
              <Link to="/login">
                <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition duration-200 active:scale-[0.98] cursor-pointer">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Enterprise Auth Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Quên mật khẩu</h2>
          <p className="text-sm text-slate-500">
            Nhập email đã đăng ký để nhận hướng dẫn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="email@trungtam.edu.vn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="pl-12 h-12 rounded-xl border-gray-300 bg-white text-slate-900 text-base placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Gửi yêu cầu'
            )}
          </Button>

          {/* Back Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
