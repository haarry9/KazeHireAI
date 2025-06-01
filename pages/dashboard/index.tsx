import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp,
  Plus,
  Search
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <ProtectedRoute allowedRoles={['HR']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your recruitment process efficiently</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84</div>
                <p className="text-xs text-muted-foreground">
                  +12 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +4 for this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hire Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/jobs/create">
                  <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Job
                  </Button>
                </Link>
                
                <Link href="/candidates/create">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </Link>
                
                <Link href="/candidates/resume-match">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    Run Resume Matcher
                  </Button>
                </Link>
                
                <Link href="/interviews/schedule">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates in your recruitment pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New candidate applied for Software Engineer position</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Interview completed for Product Manager role</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Resume matching completed for Frontend Developer</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New job posting created: UX Designer</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 