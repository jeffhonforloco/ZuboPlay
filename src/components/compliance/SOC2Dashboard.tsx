// SOC 2 Compliance Dashboard Component
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Lock,
  Eye,
  Database,
  Settings,
  Download,
  RefreshCw
} from "lucide-react";
import { soc2ComplianceManager } from "@/lib/compliance/soc2/complianceManager";
import { logger } from "@/lib/logging/logger";

interface ComplianceDashboardData {
  overallScore: number;
  controlsImplemented: number;
  totalControls: number;
  openIncidents: number;
  pendingAudits: number;
  nextReviewDate: string;
  recentFindings: string[];
}

interface TrustServiceCriteria {
  name: string;
  score: number;
  status: 'compliant' | 'non-compliant' | 'partially-compliant';
  icon: React.ReactNode;
  color: string;
}

const SOC2Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<ComplianceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await soc2ComplianceManager.getComplianceDashboard();
      setDashboardData(data);
    } catch (error) {
      logger.error('Failed to load SOC 2 dashboard data', { error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
    } catch (error) {
      logger.error('Failed to refresh SOC 2 dashboard', { error: (error as Error).message });
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const report = await soc2ComplianceManager.generateComplianceReport(startDate, endDate);
      
      // In a real implementation, you would download or display the report
      logger.info('SOC 2 compliance report generated', {
        reportId: report.reportId,
        overallScore: report.overallScore
      });
      
      // For now, just log the report
      console.log('SOC 2 Compliance Report:', report);
    } catch (error) {
      logger.error('Failed to generate SOC 2 report', { error: (error as Error).message });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'partially-compliant': return 'text-yellow-600 bg-yellow-50';
      case 'non-compliant': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'partially-compliant': return <AlertTriangle className="w-4 h-4" />;
      case 'non-compliant': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const trustServiceCriteria: TrustServiceCriteria[] = [
    {
      name: 'Security',
      score: 95,
      status: 'compliant',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      name: 'Availability',
      score: 98,
      status: 'compliant',
      icon: <Database className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      name: 'Processing Integrity',
      score: 92,
      status: 'compliant',
      icon: <Settings className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    {
      name: 'Confidentiality',
      score: 88,
      status: 'partially-compliant',
      icon: <Lock className="w-5 h-5" />,
      color: 'text-orange-600'
    },
    {
      name: 'Privacy',
      score: 90,
      status: 'compliant',
      icon: <Eye className="w-5 h-5" />,
      color: 'text-indigo-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SOC 2 compliance dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Dashboard</h3>
        <p className="text-muted-foreground mb-4">There was an error loading the SOC 2 compliance dashboard.</p>
        <Button onClick={loadDashboardData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SOC 2 Compliance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage SOC 2 compliance controls</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleGenerateReport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Overall Compliance Score</h2>
          <Badge className={`${getStatusColor('compliant')} flex items-center gap-1`}>
            {getStatusIcon('compliant')}
            Compliant
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-primary">
            {dashboardData.overallScore.toFixed(1)}%
          </div>
          <div className="flex-1">
            <Progress value={dashboardData.overallScore} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {dashboardData.controlsImplemented} of {dashboardData.totalControls} controls implemented
            </p>
          </div>
        </div>
      </Card>

      {/* Trust Service Criteria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {trustServiceCriteria.map((criteria, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`${criteria.color} flex items-center gap-2`}>
                {criteria.icon}
                <span className="font-medium">{criteria.name}</span>
              </div>
              <Badge className={`${getStatusColor(criteria.status)} flex items-center gap-1`}>
                {getStatusIcon(criteria.status)}
                {criteria.status.replace('-', ' ')}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="font-semibold">{criteria.score}%</span>
              </div>
              <Progress value={criteria.score} className="h-2" />
            </div>
          </Card>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Controls</p>
              <p className="text-2xl font-bold text-foreground">
                {dashboardData.controlsImplemented}/{dashboardData.totalControls}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Incidents</p>
              <p className="text-2xl font-bold text-foreground">{dashboardData.openIncidents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Audits</p>
              <p className="text-2xl font-bold text-foreground">{dashboardData.pendingAudits}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Review</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(dashboardData.nextReviewDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Findings */}
      {dashboardData.recentFindings.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Findings</h3>
          <div className="space-y-2">
            {dashboardData.recentFindings.map((finding, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-foreground">{finding}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Compliance Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
            <Shield className="w-5 h-5 mb-2" />
            <span className="font-semibold">Security Controls</span>
            <span className="text-sm text-muted-foreground">Manage security controls</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
            <Database className="w-5 h-5 mb-2" />
            <span className="font-semibold">Availability Monitoring</span>
            <span className="text-sm text-muted-foreground">Monitor system availability</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
            <Settings className="w-5 h-5 mb-2" />
            <span className="font-semibold">Processing Controls</span>
            <span className="text-sm text-muted-foreground">Manage processing integrity</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
            <Lock className="w-5 h-5 mb-2" />
            <span className="font-semibold">Confidentiality</span>
            <span className="text-sm text-muted-foreground">Manage data confidentiality</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
            <Eye className="w-5 h-5 mb-2" />
            <span className="font-semibold">Privacy Controls</span>
            <span className="text-sm text-muted-foreground">Manage privacy compliance</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
            <FileText className="w-5 h-5 mb-2" />
            <span className="font-semibold">Audit Trail</span>
            <span className="text-sm text-muted-foreground">View compliance audit trail</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SOC2Dashboard;
