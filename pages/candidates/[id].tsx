export default function CandidateProfile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Candidate Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Candidate Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">John Doe</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">john@example.com</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                  <p className="text-blue-600">linkedin.com/in/johndoe</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Resume</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">PDF Resume Viewer</p>
                <p className="text-sm text-gray-400">Resume will be displayed here</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">AI Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Availability</p>
                  <p className="text-gray-900">Not set</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Salary Range</p>
                  <p className="text-gray-900">Not set</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Interest Level</p>
                  <p className="text-gray-900">Not set</p>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Upload Chat Transcript
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Cover Letter</h3>
              <p className="text-gray-500 text-sm">No cover letter provided</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Schedule Interview
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Run Resume Match
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 