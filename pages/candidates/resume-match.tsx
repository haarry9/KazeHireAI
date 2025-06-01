export default function ResumeMatch() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Resume Matcher</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Match From Existing Pool</h3>
            <p className="text-gray-600 mb-4">Select a job and match against existing candidates</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Choose a job...</option>
                  <option value="1">Senior Software Engineer</option>
                  <option value="2">Product Manager</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Any specific requirements or preferences..."
                />
              </div>
              
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Match Candidates
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Manual Upload & Match</h3>
            <p className="text-gray-600 mb-4">Upload job description and resumes for comparison</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                <textarea 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Paste or type the job description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resumes (1-5 PDFs)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Upload & Match
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Match Results</h3>
            <div className="text-center py-8 text-gray-500">
              <p>No matches yet. Use one of the options above to get started.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 