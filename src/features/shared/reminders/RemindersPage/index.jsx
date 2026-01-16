import { PageHeader } from '@core/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@core/components/ui/tabs';
import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Button } from '@core/components/ui/button';
import { Clock, AlertTriangle, Calendar, Bell, } from 'lucide-react';
const upcomingTasks = [
    { id: '1', title: 'Soạn giáo án chương 5', project: 'Chương trình Hè 2024', deadline: '2024-01-15', daysLeft: 4, priority: 'high' },
    { id: '2', title: 'Cập nhật slide bài giảng', project: 'Nâng cấp hệ thống CNTT', deadline: '2024-01-16', daysLeft: 5, priority: 'medium' },
    { id: '3', title: 'Họp đánh giá tiến độ', project: 'Chuẩn bị năm học mới', deadline: '2024-01-17', daysLeft: 6, priority: 'low' },
];
const todayTasks = [
    { id: '4', title: 'Hoàn thành đề cương', project: 'Chương trình Hè 2024', deadline: '2024-01-11', priority: 'high' },
    { id: '5', title: 'Review tài liệu tham khảo', project: 'Đào tạo giáo viên mới', deadline: '2024-01-11', priority: 'medium' },
];
const overdueTasks = [
    { id: '6', title: 'Họp tổng kết tháng', project: 'Chương trình Hè 2024', deadline: '2024-01-08', daysOverdue: 3, priority: 'high' },
    { id: '7', title: 'Nộp báo cáo Q4', project: 'Nâng cấp hệ thống CNTT', deadline: '2024-01-05', daysOverdue: 6, priority: 'high' },
];
const notifications = [
    { id: '1', title: 'Công việc mới được giao', message: 'Bạn được giao công việc "Chuẩn bị giáo án tháng 2"', time: '5 phút trước', type: 'info', read: false },
    { id: '2', title: 'Công việc đã được duyệt', message: '"Soạn đề kiểm tra" đã được Leader phê duyệt', time: '1 giờ trước', type: 'success', read: false },
    { id: '3', title: 'Công việc bị trả lại', message: '"Báo cáo tuần" cần chỉnh sửa', time: '2 giờ trước', type: 'warning', read: true },
    { id: '4', title: 'Nhắc nhở deadline', message: '"Hoàn thành đề cương" sắp đến hạn', time: '3 giờ trước', type: 'warning', read: true },
    { id: '5', title: 'Cập nhật hệ thống', message: 'Hệ thống sẽ bảo trì vào 22:00', time: '1 ngày trước', type: 'info', read: true },
];
export default function RemindersPage() {
    return (<div>
      <PageHeader title="Nhắc việc & Thông báo" description="Theo dõi công việc sắp đến hạn và các thông báo quan trọng"/>

      <Tabs defaultValue="reminders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reminders">
            <Clock className="w-4 h-4 mr-2"/>
            Nhắc việc
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2"/>
            Thông báo
            <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
              2
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reminders">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overdue */}
            <Card className="border-status-overdue/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-status-overdue">
                  <AlertTriangle className="w-5 h-5"/>
                  Trễ hạn ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueTasks.map((task) => (<div key={task.id} className="p-3 rounded-lg border border-status-overdue/20 bg-status-overdue-bg hover:bg-status-overdue-bg/80 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm">{task.title}</span>
                        <PriorityBadge priority={task.priority}/>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{task.project}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-xs font-medium text-status-overdue">
                          Trễ {task.daysOverdue} ngày
                        </span>
                      </div>
                    </div>))}
                </div>
              </CardContent>
            </Card>

            {/* Today */}
            <Card className="border-status-pending/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-status-pending">
                  <Calendar className="w-5 h-5"/>
                  Đến hạn hôm nay ({todayTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayTasks.map((task) => (<div key={task.id} className="p-3 rounded-lg border border-status-pending/20 bg-status-pending-bg hover:bg-status-pending-bg/80 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm">{task.title}</span>
                        <PriorityBadge priority={task.priority}/>
                      </div>
                      <p className="text-xs text-muted-foreground">{task.project}</p>
                    </div>))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary"/>
                  Sắp đến hạn ({upcomingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (<div key={task.id} className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm">{task.title}</span>
                        <PriorityBadge priority={task.priority}/>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{task.project}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-xs font-medium text-primary">
                          Còn {task.daysLeft} ngày
                        </span>
                      </div>
                    </div>))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tất cả thông báo</CardTitle>
              <Button variant="ghost" size="sm">
                Đánh dấu đã đọc tất cả
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.map((notification) => (<div key={notification.id} className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full ${notification.read ? 'bg-transparent' : 'bg-primary'}`}/>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium">{notification.title}</span>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                  </div>))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);
}

