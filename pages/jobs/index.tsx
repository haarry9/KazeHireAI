export default function Jobs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Create Job
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">All Job Postings</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created At</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No jobs created yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 