import { PageHeader } from '@core/components/common/PageHeader';
import { Alert, AlertDescription, AlertTitle } from '@core/components/ui/alert';
import { Info } from 'lucide-react';

export default function LogsPage() {
  return (
    <div>
      <PageHeader
        title="Nhật ký Hệ thống"
        description="Theo dõi các hoạt động trong hệ thống"
      />

      <div className="mt-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Tính năng đang phát triển</AlertTitle>
          <AlertDescription>
            Tính năng nhật ký hệ thống đang được phát triển.
            Vui lòng quay lại sau hoặc liên hệ quản trị viên để biết thêm thông tin.
          </AlertDescription>
        </Alert>
      </div>

      {/* TODO: Implement system logs when backend API is ready
          - Activity logs
          - User actions
          - System events
          - Error logs
          - Filters by date, user, action type
          - Export logs
      */}
    </div>
  );
}

