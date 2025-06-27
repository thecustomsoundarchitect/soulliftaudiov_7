import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Brain, Download, Upload, Zap } from "lucide-react";
import { 
  approveSoulHug, 
  unapproveSoulHug, 
  getApprovalStats,
  canApproveHugs,
  type ApprovalStats 
} from "@/services/approvalService";

interface TrainingDashboardProps {
  soulHugs: Array<{
    id: string;
    message: string;
    tone: string;
    relationship: string;
    occasion: string;
    approved?: boolean;
    createdAt?: any;
  }>;
}

export default function TrainingDashboard({ soulHugs }: TrainingDashboardProps) {
  const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const canApprove = canApproveHugs();

  useEffect(() => {
    loadApprovalStats();
  }, []);

  const loadApprovalStats = async () => {
    try {
      const stats = await getApprovalStats();
      setApprovalStats(stats);
    } catch (error) {
      console.error('Error loading approval stats:', error);
    }
  };

  const handleApproval = async (hugId: string, approve: boolean) => {
    if (!canApprove) return;
    
    setProcessing(hugId);
    try {
      if (approve) {
        await approveSoulHug(hugId);
      } else {
        await unapproveSoulHug(hugId);
      }
      
      // Refresh stats
      await loadApprovalStats();
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Failed to update approval status');
    } finally {
      setProcessing(null);
    }
  };

  const downloadTrainingData = () => {
    window.open('/api/admin/export-training-data', '_blank');
  };

  const approvedCount = soulHugs.filter(hug => hug.approved).length;
  const totalCount = soulHugs.length;

  return (
    <div className="space-y-6">
      
      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Approved for Training</p>
                <p className="text-3xl font-bold">{approvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Soul Hugs</p>
                <p className="text-3xl font-bold">{totalCount}</p>
              </div>
              <Brain className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Training Ready</p>
                <p className="text-3xl font-bold">
                  {approvedCount >= 10 ? 'Yes' : 'No'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Actions */}
      <Card className="bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Fine-Tuning Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={downloadTrainingData}
              disabled={approvedCount === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Training Data ({approvedCount} approved)
            </Button>
            
            {approvedCount >= 10 && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" />
                Start Fine-Tuning
              </Button>
            )}
          </div>
          
          {approvedCount < 10 && (
            <p className="text-sm text-gray-300">
              You need at least 10 approved Soul Hugs to start fine-tuning. 
              Currently have {approvedCount}/10.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Soul Hug Approval List */}
      <Card className="bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle>Soul Hug Approval Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {soulHugs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No Soul Hugs found</p>
            ) : (
              soulHugs.map((hug) => (
                <div
                  key={hug.id}
                  className={`p-4 border rounded-lg ${
                    hug.approved 
                      ? 'border-green-400/50 bg-green-600/20' 
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-600/40 text-blue-200">
                          {hug.tone}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-600/40 text-green-200">
                          {hug.relationship}
                        </Badge>
                        <Badge variant="secondary" className="bg-orange-600/40 text-orange-200">
                          {hug.occasion}
                        </Badge>
                        {hug.approved && (
                          <Badge className="bg-green-600 text-white">
                            Approved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-3">
                        {hug.message}
                      </p>
                    </div>
                    
                    {canApprove && (
                      <div className="flex gap-2 ml-4">
                        {!hug.approved ? (
                          <Button
                            onClick={() => handleApproval(hug.id, true)}
                            disabled={processing === hug.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleApproval(hug.id, false)}
                            disabled={processing === hug.id}
                            size="sm"
                            variant="outline"
                            className="text-red-400 border-red-400 hover:bg-red-600/20"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}