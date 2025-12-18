import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, usePermissions } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  LayoutGrid,
  Plus,
  Users,
  Calendar,
  Building2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for boards in this workspace
const mockBoards = [
  {
    id: '1',
    name: 'Giáo án Học kỳ 1',
    description: 'Soạn giáo án cho HK1 năm học 2024-2025',
    taskCount: 12,
    completedCount: 8,
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'Đề kiểm tra định kỳ',
    description: 'Xây dựng ngân hàng đề kiểm tra',
    taskCount: 8,
    completedCount: 3,
    color: 'bg-green-500',
  },
  {
    id: '3',
    name: 'Tài liệu tham khảo',
    description: 'Sưu tầm và biên soạn tài liệu bổ trợ',
    taskCount: 5,
    completedCount: 5,
    color: 'bg-purple-500',
  },
];

// Mock workspace data
const mockWorkspace = {
  id: '1',
  name: 'Dự án Giáo án Toán 10',
  description: 'Xây dựng bộ giáo án chuẩn cho môn Toán lớp 10 theo chương trình mới',
  department: 'Bộ môn Toán',
  leader: {
    id: '4',
    name: 'Phạm Thị Leader',
  },
  members: [
    { id: '5', name: 'Hoàng Văn Nhân Viên' },
    { id: '6', name: 'Nguyễn Thị Lan' },
    { id: '7', name: 'Trần Văn Nam' },
  ],
  startDate: '2024-01-15',
  endDate: '2024-06-30',
  status: 'in-progress',
};

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const permissions = usePermissions();

  const canCreateBoard = user?.role === 'pmo' || user?.role === 'leader';

  return (
    <div>
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate('/projects')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách dự án
      </Button>

      {/* Workspace Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{mockWorkspace.name}</h1>
            <p className="text-muted-foreground mb-4">{mockWorkspace.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{mockWorkspace.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>Leader: {mockWorkspace.leader.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {new Date(mockWorkspace.startDate).toLocaleDateString('vi-VN')} - {new Date(mockWorkspace.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Đang thực hiện
          </Badge>
        </div>
      </div>

      {/* Team Members */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Thành viên tham gia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Leader */}
            <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {mockWorkspace.leader.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{mockWorkspace.leader.name}</span>
              <Badge variant="outline" className="text-xs">Leader</Badge>
            </div>
            {/* Members */}
            {mockWorkspace.members.map((member) => (
              <div key={member.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Boards Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          Bảng công việc ({mockBoards.length})
        </h2>
        {canCreateBoard && (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Tạo bảng mới
          </Button>
        )}
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockBoards.map((board) => (
          <Card
            key={board.id}
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
            onClick={() => navigate(`/tasks-board?workspace=${id}&board=${board.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-10 rounded-full ${board.color}`} />
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {board.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {board.description}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Đổi tên</DropdownMenuItem>
                    <DropdownMenuItem>Sao chép</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-medium">
                    {board.completedCount}/{board.taskCount} công việc
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${board.color} rounded-full transition-all`}
                    style={{ width: `${(board.completedCount / board.taskCount) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Board Card */}
        {canCreateBoard && (
          <Card className="cursor-pointer hover:shadow-md transition-all border-dashed hover:border-primary/50 flex items-center justify-center min-h-[160px]">
            <div className="text-center text-muted-foreground">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Tạo bảng công việc mới</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
