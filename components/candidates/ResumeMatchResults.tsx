import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { ResumeMatchResult } from '../../types';

interface ResumeMatchResultsProps {
  results: ResumeMatchResult[];
  isLoading?: boolean;
  totalResumesProcessed?: number;
}

export default function ResumeMatchResults({ 
  results, 
  isLoading = false,
  totalResumesProcessed
}: ResumeMatchResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">AI is analyzing resumes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No matches yet. Use one of the options above to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="w-4 h-4" />;
    if (score >= 6) return <Star className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-600" />
          AI Match Results ({results.length})
        </CardTitle>
        <p className="text-gray-600">
          AI-ranked candidates based on job requirements
          {totalResumesProcessed && (
            <span className="ml-2 text-sm">
              ({totalResumesProcessed} resumes processed)
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((candidate, index) => (
            <Card key={candidate.candidate_id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        #{index + 1} {candidate.candidate_name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`px-2 py-1 text-xs font-medium border ${getScoreColor(candidate.fit_score)}`}
                      >
                        <span className="flex items-center gap-1">
                          {getScoreIcon(candidate.fit_score)}
                          {candidate.fit_score}/10
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                {candidate.strengths && candidate.strengths.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Strengths
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {candidate.strengths.map((strength, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {candidate.concerns && candidate.concerns.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      Areas for Consideration
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {candidate.concerns.map((concern, idx) => (
                        <Badge key={idx} variant="outline" className="border-yellow-200 text-yellow-700 text-xs px-2 py-0.5">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {candidate.reasoning && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">AI Assessment</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {candidate.reasoning}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-xs">
            <strong>Note:</strong> This is a simplified MVP implementation. 
            Results show AI-ranked candidates from all available resumes in the system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 