import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Candidate } from '@/lib/supabase';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import CandidateDrawer from '../../components/candidates/CandidateDrawer';
import CreateCandidateModal from '../../components/candidates/CreateCandidateModal';

export default function Candidates() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Drawer state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/candidates', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      // Handle both direct array response and { success: true, data: [...] } structure
      if (data.success && Array.isArray(data.data)) {
        setCandidates(data.data);
      } else {
        setCandidates(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedCandidateId(null);
  };

  const handleCandidateCreated = () => {
    fetchCandidates(); // Refresh the list
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['HR']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="text-xl">Loading candidates...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['HR']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
              <p className="text-gray-600 mt-2">Manage candidate applications and profiles</p>
            </div>
            <button 
              onClick={() => setModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Candidate
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">All Candidates</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Job</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!Array.isArray(candidates) || candidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No candidates added yet
                        </td>
                      </tr>
                    ) : (
                      candidates.map((candidate) => (
                        <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{candidate.name}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{candidate.email}</td>
                          <td className="py-3 px-4 text-gray-600">{candidate.phone || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {(candidate as Candidate & { jobs?: { title: string } }).jobs?.title || 'No job assigned'}
                          </td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleViewProfile(candidate.id.toString())}
                              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Profile Drawer */}
        <CandidateDrawer
          candidateId={selectedCandidateId}
          open={drawerOpen}
          onOpenChange={handleCloseDrawer}
        />

        {/* Create Candidate Modal */}
        <CreateCandidateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCandidateCreated={handleCandidateCreated}
        />
      </div>
    </ProtectedRoute>
  );
} 