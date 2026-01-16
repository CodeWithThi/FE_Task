import { Loader2 } from "lucide-react";
export function LoadingScreen() {
    return (<div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4"/>
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        </div>);
}

