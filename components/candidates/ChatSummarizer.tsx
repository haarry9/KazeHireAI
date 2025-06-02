import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChatSummarizerProps {
  candidateId: string;
  onSuccess: () => void;
}

interface ExtractedData {
  start_date: string | null;
  end_date: string | null;
  min_salary: number | null;
  max_salary: number | null;
  interest_level: number | null;
  summary_text: string | null;
}

export default function ChatSummarizer({ candidateId, onSuccess }: ChatSummarizerProps) {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transcript.trim()) {
      toast.error('Please paste a chat transcript');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        setIsProcessing(false);
        return;
      }

      const response = await fetch(`/api/candidates/${candidateId}/summarize_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process chat transcript');
      }

      if (data.success) {
        setExtractedData(data.extracted_data);
        toast.success('Chat transcript processed successfully!');
        onSuccess(); // Refresh the parent component
        setTranscript(''); // Clear the textarea
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Error processing chat transcript:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process chat transcript');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSalary = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* AI Chat Summarizer Form */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Chat Summarizer</h3>
            <p className="text-sm text-gray-600">Extract key information from candidate conversations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
              Chat Transcript
            </label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the chat transcript between HR and candidate here..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={isProcessing}
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || !transcript.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Information
              </>
            )}
          </button>
        </form>
      </div>

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-green-900">Extracted Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Availability</label>
              <p className="text-green-900">
                {extractedData.start_date || extractedData.end_date 
                  ? `${formatDate(extractedData.start_date)} - ${formatDate(extractedData.end_date)}`
                  : 'Not specified'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Salary Range</label>
              <p className="text-green-900">
                {extractedData.min_salary || extractedData.max_salary
                  ? `${formatSalary(extractedData.min_salary)} - ${formatSalary(extractedData.max_salary)}`
                  : 'Not specified'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Interest Level</label>
              <p className="text-green-900">
                {extractedData.interest_level 
                  ? `${extractedData.interest_level}/5`
                  : 'Not specified'
                }
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-green-700 mb-1">AI Summary</label>
              <p className="text-green-900">
                {extractedData.summary_text || 'No summary generated'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 