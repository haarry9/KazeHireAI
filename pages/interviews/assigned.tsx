import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Calendar, 
  Clock, 
  User,
  FileText
} from 'lucide-react';

export default function AssignedInterviews() {
  // Mock data for now
  const assignedInterviews = [
    {
      id: 1,
      candidateName: "John Doe",
      jobTitle: "Software Engineer",
      scheduledTime: "2024-01-15T10:00:00Z",
      status: "Scheduled"
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      jobTitle: "Product Manager",
      scheduledTime: "2024-01-16T14:30:00Z",
      status: "Scheduled"
    },
    {
      id: 3,
      candidateName: "Mike Johnson",
      jobTitle: "Frontend Developer",
      scheduledTime: "2024-01-12T09:00:00Z",
      status: "Completed"
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['INTERVIEWER']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Interviews</h1>
            <p className="text-gray-600 mt-2">Manage your assigned interview schedule</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Interview</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Tomorrow</div>
                <p className="text-xs text-muted-foreground">
                  10:00 AM
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Interview List */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Interviews</CardTitle>
              <CardDescription>
                All interviews assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{interview.candidateName}</h4>
                        <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(interview.scheduledTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={interview.status === 'Completed' ? 'secondary' : 'default'}
                      >
                        {interview.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant={interview.status === 'Completed' ? 'outline' : 'default'}
                      >
                        {interview.status === 'Completed' ? 'View Details' : 'Start Interview'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 