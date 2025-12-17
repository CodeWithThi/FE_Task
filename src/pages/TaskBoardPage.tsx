import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { SubtaskDetailModal } from '@/components/tasks/SubtaskDetailModal';
import { SubtaskCardData } from '@/components/tasks/SubtaskCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutGrid, List } from 'lucide-react';

// Mock subtasks data
const mockSubtasks: SubtaskCardData[] = [
  {
    id: '1',
    title: 'Soạn giáo án chương 1 - Đại số',
    description: 'Soạn giáo án chi tiết cho chương 1 về đại số cơ bản',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    status: 'completed',
    priority: 'high',
    deadline: '2024-05-03',
    progress: 100,
    attachmentCount: 2,
    commentCount: 3,
  },
  {
    id: '2',
    title: 'Soạn giáo án chương 2 - Hình học',
    description: 'Chuẩn bị nội dung bài giảng hình học phẳng',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    status: 'completed',
    priority: 'medium',
    deadline: '2024-05-05',
    progress: 100,
    attachmentCount: 1,
  },
  {
    id: '3',
    title: 'Soạn giáo án chương 3 - Giải tích',
    description: 'Nội dung về tích phân và đạo hàm',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    status: 'in-progress',
    priority: 'high',
    deadline: '2024-05-08',
    progress: 60,
    commentCount: 2,
  },
  {
    id: '4',
    title: 'Thiết kế bài tập thực hành',
    description: 'Tạo bộ bài tập cho học sinh thực hành',
    assignee: { id: '6', name: 'Nguyễn Thị Lan' },
    status: 'waiting-approval',
    priority: 'medium',
    deadline: '2024-05-10',
    progress: 100,
    attachmentCount: 3,
  },
  {
    id: '5',
    title: 'Chuẩn bị đề kiểm tra giữa kỳ',
    description: 'Soạn đề kiểm tra 15 phút và 45 phút',
    assignee: { id: '7', name: 'Trần Văn Nam' },
    status: 'not-assigned',
    priority: 'low',
    deadline: '2024-05-15',
    progress: 0,
  },
  {
    id: '6',
    title: 'Rà soát nội dung chương 1',
    description: 'Kiểm tra và chỉnh sửa lỗi trong giáo án',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    status: 'returned',
    priority: 'high',
    deadline: '2024-05-06',
    progress: 80,
    commentCount: 5,
  },
  {
    id: '7',
    title: 'Upload tài liệu tham khảo',
    description: 'Đăng tải tài liệu bổ sung cho học sinh',
    assignee: { id: '6', name: 'Nguyễn Thị Lan' },
    status: 'in-progress',
    priority: 'low',
    deadline: '2024-05-12',
    progress: 30,
  },
  {
    id: '8',
    title: 'Soạn slide bài giảng chương 4',
    description: 'Thiết kế slide PowerPoint cho bài giảng',
    assignee: { id: '8', name: 'Lê Thị Hoa' },
    status: 'not-assigned',
    priority: 'medium',
    deadline: '2024-05-18',
    progress: 0,
  },
];

export default function TaskBoardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedSubtask, setSelectedSubtask] = useState<SubtaskCardData | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredSubtasks = mockSubtasks.filter((subtask) =>
    subtask.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCardClick = (subtask: SubtaskCardData) => {
    setSelectedSubtask(subtask);
    setShowDetail(true);
  };

  return (
    <div>
      <PageHeader
        title="Bảng công việc"
        description="Xem công việc theo dạng Kanban"
        actions={
          <Button variant="outline" onClick={() => navigate('/tasks')}>
            <List className="w-4 h-4 mr-2" />
            Xem danh sách
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm công việc..."
        filters={[]}
        onClearFilters={() => {}}
      />

      <div className="mt-4">
        <KanbanBoard
          subtasks={filteredSubtasks}
          onCardClick={handleCardClick}
        />
      </div>

      <SubtaskDetailModal
        open={showDetail}
        onOpenChange={setShowDetail}
        subtask={selectedSubtask}
      />
    </div>
  );
}
