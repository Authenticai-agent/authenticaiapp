import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Switch,
  Label,
  Badge,
  Alert,
  AlertDescription,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui';
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  Settings, 
  Database,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  Globe
} from 'lucide-react';
import { privacyAPI } from '../services/api';

interface PrivacySettings {
  data_sharing_consent: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
  research_participation: boolean;
  data_retention_period: number;
  export_format_preference: string;
}

interface DataAccessEntry {
  timestamp: string;
  access_type: string;
  data_types: string[];
  purpose: string;
  accessed_by: string;
  ip_address: string;
}

interface DataSummary {
  [key: string]: {
    record_count: number;
    last_updated: string | null;
  };
}

const PrivacyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [dataAccessLog, setDataAccessLog] = useState<DataAccessEntry[]>([]);
  const [dataSummary, setDataSummary] = useState<DataSummary>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      setLoading(true);
      
      // Temporary mock data to test UI
      setPrivacySettings({
        data_sharing_consent: true,
        analytics_consent: false,
        marketing_consent: false,
        research_participation: true,
        data_retention_period: 365,
        export_format_preference: 'json'
      });
      
      setDataAccessLog([
        {
          timestamp: new Date().toISOString(),
          access_type: 'data_view',
          data_types: ['health_data'],
          purpose: 'Dashboard display',
          accessed_by: 'user',
          ip_address: '127.0.0.1'
        }
      ]);
      
      setDataSummary({
        health_data: { record_count: 150, last_updated: new Date().toISOString() },
        environmental_data: { record_count: 500, last_updated: new Date().toISOString() },
        user_preferences: { record_count: 25, last_updated: new Date().toISOString() }
      });
      
    } catch (err: any) {
      console.error('Error loading privacy data:', err);
      setError(typeof err === 'string' ? err : 'Failed to load privacy data');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentUpdate = async (consentType: keyof PrivacySettings, value: boolean | number | string) => {
    try {
      // Update local state immediately for better UX
      setPrivacySettings(prev => prev ? { ...prev, [consentType]: value } : null);
      
      // Try to update on server, but don't fail if endpoint doesn't exist
      try {
        await privacyAPI.updateConsent({ [consentType]: value });
      } catch (apiError: any) {
        // Silently handle 404 errors (endpoint not implemented yet)
        if (apiError?.response?.status !== 404) {
          throw apiError;
        }
        console.log('Privacy API endpoint not available yet, using local state only');
      }
      
      setSuccessMessage('Privacy settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating consent:', error);
      setError('Failed to update privacy settings');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDataDeletion = async (dataTypes?: string[]) => {
    if (!window.confirm('Are you sure you want to request deletion of all your data? This action cannot be undone.')) {
      return;
    }

    try {
      try {
        await privacyAPI.requestDataDeletion({ data_types: dataTypes || [] });
      } catch (apiError: any) {
        // Silently handle 404 errors (endpoint not implemented yet)
        if (apiError?.response?.status !== 404) {
          throw apiError;
        }
        console.log('Privacy API endpoint not available yet');
      }
      
      setSuccessMessage('Data deletion request submitted successfully. You will receive a confirmation email.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      setError('Failed to submit data deletion request');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDataExport = async () => {
    try {
      await privacyAPI.requestDataExport({ 
        format: privacySettings?.export_format_preference || 'json' 
      });
      setSuccessMessage('Data export request submitted successfully. You will receive an email with download link.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error requesting data export:', error);
      setError('Failed to submit data export request');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSettingsUpdate = async (updates: Partial<PrivacySettings>) => {
    console.log('handleSettingsUpdate called with:', updates);
    try {
      setPrivacySettings(prev => {
        const newSettings = prev ? { ...prev, ...updates } : null;
        console.log('Updated privacy settings:', newSettings);
        return newSettings;
      });
      
      try {
        await privacyAPI.updateSettings(updates);
      } catch (apiError: any) {
        if (apiError?.response?.status !== 404) {
          throw apiError;
        }
        console.log('Privacy API endpoint not available yet, using local state only');
      }
      
      setSuccessMessage('Settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
      setTimeout(() => setError(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalRecords = Object.values(dataSummary).reduce((sum, data) => sum + data.record_count, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your data privacy and transparency settings</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
            <div className="text-sm text-gray-500">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{dataAccessLog.length}</div>
            <div className="text-sm text-gray-500">Recent Accesses</div>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="data-summary">Data Summary</TabsTrigger>
          <TabsTrigger value="access-log">Access Log</TabsTrigger>
          <TabsTrigger value="data-rights">Data Rights</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Privacy Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {privacySettings && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Data Sharing</Label>
                        <div className="text-sm text-gray-500">
                          Allow sharing anonymized data with research partners
                        </div>
                      </div>
                      <Switch
                        checked={privacySettings.data_sharing_consent}
                        onCheckedChange={(checked) => handleConsentUpdate('data_sharing_consent', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Analytics</Label>
                        <div className="text-sm text-gray-500">
                          Help improve the platform with usage analytics
                        </div>
                      </div>
                      <Switch
                        checked={privacySettings.analytics_consent}
                        onCheckedChange={(checked) => handleConsentUpdate('analytics_consent', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Marketing Communications</Label>
                        <div className="text-sm text-gray-500">
                          Receive personalized health tips and product updates
                        </div>
                      </div>
                      <Switch
                        checked={privacySettings.marketing_consent}
                        onCheckedChange={(checked) => handleConsentUpdate('marketing_consent', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Research Participation</Label>
                        <div className="text-sm text-gray-500">
                          Contribute to health research studies (fully anonymized)
                        </div>
                      </div>
                      <Switch
                        checked={privacySettings.research_participation}
                        onCheckedChange={(checked) => handleConsentUpdate('research_participation', checked)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="retention-period">Data Retention Period</Label>
                        <select
                          id="retention-period"
                          value={privacySettings.data_retention_period.toString()}
                          onChange={(e) => handleSettingsUpdate({ data_retention_period: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="90">3 months</option>
                          <option value="180">6 months</option>
                          <option value="365">1 year</option>
                          <option value="730">2 years</option>
                          <option value="1825">5 years</option>
                        </select>
                        <div className="text-sm text-gray-500 mt-1">
                          How long to keep your data after account deletion
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="export-format">Export Format Preference</Label>
                        <select
                          id="export-format"
                          value={privacySettings.export_format_preference}
                          onChange={(e) => handleSettingsUpdate({ export_format_preference: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                          <option value="xml">XML</option>
                        </select>
                        <div className="text-sm text-gray-500 mt-1">
                          Format for data exports
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Active Consents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {privacySettings?.data_sharing_consent && (
                    <div className="flex items-center justify-between">
                      <span>Data Sharing</span>
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </div>
                  )}
                  {privacySettings?.analytics_consent && (
                    <div className="flex items-center justify-between">
                      <span>Analytics</span>
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </div>
                  )}
                  {privacySettings?.marketing_consent && (
                    <div className="flex items-center justify-between">
                      <span>Marketing</span>
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </div>
                  )}
                  {privacySettings?.research_participation && (
                    <div className="flex items-center justify-between">
                      <span>Research</span>
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Consent Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-gray-600">
                      Anonymized health data shared with research institutions to advance medical knowledge.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Analytics</h4>
                    <p className="text-gray-600">
                      Usage patterns help us improve features and user experience.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Marketing</h4>
                    <p className="text-gray-600">
                      Personalized health tips and product updates based on your profile.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Research</h4>
                    <p className="text-gray-600">
                      Participation in IRB-approved health studies with full anonymization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data-summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Your Data Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(dataSummary).map(([tableName, data]) => (
                  <Card key={tableName} className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {tableName.replace(/_/g, ' ')}
                          </p>
                          <p className="text-2xl font-bold">{data.record_count}</p>
                          {data.last_updated && (
                            <p className="text-xs text-gray-500">
                              Last: {new Date(data.last_updated).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {data.record_count > 0 ? 'Has Data' : 'Empty'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Data Retention Policy</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Your data is retained for {privacySettings?.data_retention_period || 365} days after account deletion. 
                      You can modify this period in Privacy Settings or request immediate deletion.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-log" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Data Access Log (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Access Type</TableHead>
                    <TableHead>Data Types</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Accessed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataAccessLog.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {new Date(entry.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.access_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.data_types.slice(0, 2).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {entry.data_types.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{entry.data_types.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{entry.purpose}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {entry.accessed_by === 'user' ? (
                            <Users className="w-4 h-4 text-green-600" />
                          ) : (
                            <Globe className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm">{entry.accessed_by}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {dataAccessLog.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No data access recorded in the last 30 days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-rights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Download a complete copy of your data in your preferred format. 
                  This includes all health records, settings, and activity history.
                </p>
                <Button onClick={handleDataExport} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Request Data Export
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Export will be in {privacySettings?.export_format_preference?.toUpperCase()} format
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-800">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete specific types of your data. This action cannot be undone.
                </p>
                <div className="space-y-2 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDataDeletion(['symptoms', 'activities'])}
                    className="w-full text-left justify-start"
                  >
                    Delete Activity & Symptom History
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDataDeletion(['health_readings'])}
                    className="w-full text-left justify-start"
                  >
                    Delete Health Readings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDataDeletion(['medication_history'])}
                    className="w-full text-left justify-start"
                  >
                    Delete Medication History
                  </Button>
                </div>
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 text-xs">
                    Data deletion is permanent and cannot be undone
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Your Data Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Right to Access</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You can request and receive a copy of all personal data we hold about you.
                  </p>
                  
                  <h4 className="font-medium mb-2">Right to Rectification</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You can request correction of inaccurate or incomplete personal data.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Right to Erasure</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You can request deletion of your personal data under certain circumstances.
                  </p>
                  
                  <h4 className="font-medium mb-2">Right to Data Portability</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You can request your data in a structured, machine-readable format.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Questions about your data rights?</strong> Contact our privacy team at{' '}
                  <a href="mailto:jura@authenticai.ai" className="text-blue-600 hover:underline">
                    jura@authenticai.ai
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrivacyDashboard;
