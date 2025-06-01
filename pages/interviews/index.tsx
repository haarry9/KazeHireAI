export default function InterviewManagement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Management</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Schedule Interview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Interviews</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">John Doe</h4>
                      <p className="text-sm text-gray-600">Interviewer: Sarah Johnson</p>
                    </div>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Scheduled</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Position: Senior Software Engineer</p>
                  <p className="text-sm text-gray-500 mb-3">Tomorrow at 2:00 PM</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                    View Details
                  </button>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  <p>No other upcoming interviews</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Completed Interviews</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Jane Smith</h4>
                      <p className="text-sm text-gray-600">Interviewer: Sarah Johnson</p>
                    </div>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Position: Product Manager</p>
                  <p className="text-sm text-gray-500 mb-2">Yesterday at 10:00 AM</p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium">Fit Score:</span>
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">4/5</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm">
                      View Details
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">
                      Bias Check
                    </button>
                  </div>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  <p>No other completed interviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 