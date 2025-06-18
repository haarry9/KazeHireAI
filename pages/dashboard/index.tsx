import { useQuery } from '@tanstack/react-query';
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
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { apiCall } from '../../lib/api';

interface DashboardStats {
  totalJobs: number;
  activeCandidates: number;
  scheduledInterviews: number;
  hireRate: number;
}

// Create API function for dashboard stats
const fetchDashboardStats = async (): Promise<{ data: DashboardStats }> => {
  return await apiCall('/api/dashboard/stats');
};

export default function Dashboard() {
  // Fetch real-time dashboard stats
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const stats: DashboardStats = statsResponse?.data || {
    totalJobs: 0,
    activeCandidates: 0,
    scheduledInterviews: 0,
    hireRate: 0
  };

  return (
    <ProtectedRoute allowedRoles={['HR']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              HR Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your recruitment process efficiently</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Jobs Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Jobs</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white">{stats.totalJobs}</div>
                )}
                <p className="text-xs text-blue-100 mt-1">
                  Total job postings
                </p>
              </CardContent>
            </Card>

            {/* Active Candidates Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Active Candidates</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white">{stats.activeCandidates}</div>
                )}
                <p className="text-xs text-green-100 mt-1">
                  In your candidate pool
                </p>
              </CardContent>
            </Card>

            {/* Interviews Scheduled Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Interviews Scheduled</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white">{stats.scheduledInterviews}</div>
                )}
                <p className="text-xs text-purple-100 mt-1">
                  Upcoming interviews
                </p>
              </CardContent>
            </Card>

            {/* Hire Rate Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Hire Rate</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white">{stats.hireRate}%</div>
                )}
                <p className="text-xs text-orange-100 mt-1">
                  Success rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600">
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/jobs/create">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Job
                  </Button>
                </Link>
                
                <Link href="/candidates/create">
                  <Button variant="outline" className="w-full justify-start border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300">
                    <Users className="mr-2 h-4 w-4 text-green-600" />
                    Add Candidate
                  </Button>
                </Link>
                
                <Link href="/candidates/resume-match">
                  <Button variant="outline" className="w-full justify-start border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300">
                    <Search className="mr-2 h-4 w-4 text-purple-600" />
                    Run Resume Matcher
                  </Button>
                </Link>
                
                <Link href="/interviews/schedule">
                  <Button variant="outline" className="w-full justify-start border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300">
                    <Calendar className="mr-2 h-4 w-4 text-orange-600" />
                    Schedule Interview
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600">
                  Latest updates in your recruitment pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">New candidate applied for Software Engineer position</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Interview completed for Product Manager role</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Resume matching completed for Frontend Developer</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">New job posting created: UX Designer</p>
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