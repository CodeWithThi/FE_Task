import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@core/components/ui/button';

export class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-300">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 tracking-tight">Đã xảy ra sự cố</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Hệ thống đã gặp lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
                    </p>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            Về trang chủ
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Tải lại trang
                        </Button>
                    </div>

                    {process.env.NODE_ENV !== 'production' && (
                        <div className="mt-8 bg-muted/50 p-4 rounded-lg text-left text-xs font-mono max-w-3xl w-full overflow-auto border shadow-sm">
                            <p className="text-red-500 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                            <pre className="text-muted-foreground whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

