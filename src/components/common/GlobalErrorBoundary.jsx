import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h2>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        Chúng tôi gặp sự cố khi hiển thị nội dung này.
                    </p>
                    <div className="bg-muted p-4 rounded-lg text-left text-xs font-mono mb-6 max-w-2xl w-full overflow-auto">
                        <p className="text-red-500 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                        <pre className="text-muted-foreground">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </div>
                    <Button onClick={() => window.location.reload()}>
                        Tải lại trang
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
