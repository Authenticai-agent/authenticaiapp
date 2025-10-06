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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  AlertTitle
} from '../components/ui';
import { 
  Activity, 
  Heart, 
  Pill, 
  Award,
  AlertTriangle,
  CheckCircle,
  Plus,
  BarChart3
} from 'lucide-react';
import { healthHistoryAPI, gamificationAPI } from '../services/api';

interface LungFunctionReading {
  id: string;
  reading_date: string;
  peak_flow?: number;
  fev1?: number;
  fvc?: number;
  fev1_fvc_ratio?: number;
  notes?: string;
  device_used?: string;
}

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  medication_type: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
}

interface BiometricReading {
  id: string;
  reading_date: string;
  reading_type: string;
  value: number;
  unit: string;
  notes?: string;
  device_used?: string;
}

interface UserStats {
  total_points: number;
  current_level: number;
  level_progress: number;
  points_to_next_level: number;
  streak_days: number;
  badges_earned: string[];
  achievements_unlocked: number;
  health_score: number;
}

const HealthTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lungFunctionReadings, setLungFunctionReadings] = useState<LungFunctionReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [biometricReadings, setBiometricReadings] = useState<BiometricReading[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newLungReading, setNewLungReading] = useState({
    reading_date: new Date().toISOString().split('T')[0],
    peak_flow: '',
    fev1: '',
    fvc: '',
    notes: '',
    device_used: ''
  });

  const [newMedication, setNewMedication] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    medication_type: 'controller',
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [newBiometric, setNewBiometric] = useState({
    reading_date: new Date().toISOString().split('T')[0],
    reading_type: 'blood_pressure',
    value: '',
    unit: 'mmHg',
    notes: '',
    device_used: ''
  });

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      // Temporary mock data to test UI
      setLungFunctionReadings([
        {
          id: '1',
          reading_date: new Date().toISOString().split('T')[0],
          peak_flow: 450,
          fev1: 3.2,
          fvc: 4.1,
          fev1_fvc_ratio: 0.78,
          notes: 'Feeling good today',
          device_used: 'Peak flow meter'
        }
      ]);
      
      setMedications([
        {
          id: '1',
          medication_name: 'Albuterol',
          dosage: '100mcg',
          frequency: 'as needed',
          medication_type: 'rescue_inhaler',
          start_date: new Date().toISOString().split('T')[0],
          notes: 'For emergency use',
          is_active: true
        }
      ]);
      
      setBiometricReadings([
        {
          id: '1',
          reading_date: new Date().toISOString().split('T')[0],
          reading_type: 'blood_pressure',
          value: 120,
          unit: 'mmHg',
          notes: 'Normal reading',
          device_used: 'Digital monitor'
        }
      ]);
      
    } catch (err: any) {
      console.error('Error loading health data:', err);
      setError(typeof err === 'string' ? err : 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLungReading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const readingData = {
        ...newLungReading,
        peak_flow: newLungReading.peak_flow ? parseFloat(newLungReading.peak_flow) : null,
        fev1: newLungReading.fev1 ? parseFloat(newLungReading.fev1) : null,
        fvc: newLungReading.fvc ? parseFloat(newLungReading.fvc) : null
      };

      await healthHistoryAPI.addLungFunctionReading(readingData);
      
      // Reset form
      setNewLungReading({
        reading_date: new Date().toISOString().split('T')[0],
        peak_flow: '',
        fev1: '',
        fvc: '',
        notes: '',
        device_used: ''
      });
      
      // Reload data
      loadHealthData();
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add lung function reading');
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await healthHistoryAPI.addMedication(newMedication);
      
      // Reset form
      setNewMedication({
        medication_name: '',
        dosage: '',
        frequency: '',
        medication_type: 'controller',
        start_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Reload data
      loadHealthData();
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add medication');
    }
  };

  const handleAddBiometric = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const biometricData = {
        ...newBiometric,
        value: parseFloat(newBiometric.value)
      };

      await healthHistoryAPI.addBiometricReading(biometricData);
      
      // Reset form
      setNewBiometric({
        reading_date: new Date().toISOString().split('T')[0],
        reading_type: 'blood_pressure',
        value: '',
        unit: 'mmHg',
        notes: '',
        device_used: ''
      });
      
      // Reload data
      loadHealthData();
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add biometric reading');
    }
  };

  const handleDailyCheckin = async () => {
    try {
      const response = await gamificationAPI.dailyCheckin();
      // Show success message in the existing error state for now
      setError(null);
      // You could add a success state here if needed
      loadHealthData(); // Reload to update stats
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete daily check-in');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Tracking</h1>
          <p className="text-gray-600 mt-2">Comprehensive health monitoring and insights</p>
        </div>
        
        {userStats && (
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.current_level}</div>
              <div className="text-sm text-gray-500">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.total_points}</div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.streak_days}</div>
              <div className="text-sm text-gray-500">Day Streak</div>
            </div>
            <Button onClick={handleDailyCheckin} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Daily Check-in
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lung-function">Lung Function</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="biometrics">Biometrics</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Health Score Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Health Score</CardTitle>
                <Heart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {userStats?.health_score?.toFixed(0) || 0}/100
                </div>
                <Progress 
                  value={userStats?.health_score || 0} 
                  className="mt-2"
                />
                <p className="text-xs text-green-600 mt-2">
                  Based on tracking consistency
                </p>
              </CardContent>
            </Card>

            {/* Recent Lung Function */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Peak Flow</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lungFunctionReadings[0]?.peak_flow || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {lungFunctionReadings[0]?.reading_date ? 
                    new Date(lungFunctionReadings[0].reading_date).toLocaleDateString() : 
                    'No readings yet'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Active Medications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medications.length}</div>
                <p className="text-xs text-muted-foreground">
                  {medications.filter(m => m.medication_type === 'controller').length} controllers, {' '}
                  {medications.filter(m => m.medication_type === 'rescue_inhaler').length} rescue
                </p>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.achievements_unlocked || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats?.badges_earned?.length || 0} badges earned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Health Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lungFunctionReadings.slice(0, 3).map((reading) => (
                  <div key={reading.id} className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Lung Function Reading</p>
                      <p className="text-sm text-gray-600">
                        Peak Flow: {reading.peak_flow} L/min
                        {reading.fev1 && ` • FEV1: ${reading.fev1}L`}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(reading.reading_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {medications.slice(0, 2).map((medication) => (
                  <div key={medication.id} className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                    <Pill className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">{medication.medication_name}</p>
                      <p className="text-sm text-gray-600">
                        {medication.dosage} • {medication.frequency}
                      </p>
                    </div>
                    <Badge variant={medication.medication_type === 'controller' ? 'default' : 'secondary'}>
                      {medication.medication_type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lung-function" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Reading Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Add Lung Function Reading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddLungReading} className="space-y-4">
                  <div>
                    <Label htmlFor="reading_date">Date</Label>
                    <Input
                      id="reading_date"
                      type="date"
                      value={newLungReading.reading_date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLungReading({...newLungReading, reading_date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="peak_flow">Peak Flow (L/min)</Label>
                      <Input
                        id="peak_flow"
                        type="number"
                        step="0.1"
                        value={newLungReading.peak_flow}
                        onChange={(e) => setNewLungReading({...newLungReading, peak_flow: e.target.value})}
                        placeholder="e.g., 450"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fev1">FEV1 (L)</Label>
                      <Input
                        id="fev1"
                        type="number"
                        step="0.01"
                        value={newLungReading.fev1}
                        onChange={(e) => setNewLungReading({...newLungReading, fev1: e.target.value})}
                        placeholder="e.g., 3.2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fvc">FVC (L)</Label>
                    <Input
                      id="fvc"
                      type="number"
                      step="0.01"
                      value={newLungReading.fvc}
                      onChange={(e) => setNewLungReading({...newLungReading, fvc: e.target.value})}
                      placeholder="e.g., 4.1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="device_used">Device Used</Label>
                    <Input
                      id="device_used"
                      value={newLungReading.device_used}
                      onChange={(e) => setNewLungReading({...newLungReading, device_used: e.target.value})}
                      placeholder="e.g., Peak flow meter, Spirometer"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newLungReading.notes}
                      onChange={(e) => setNewLungReading({...newLungReading, notes: e.target.value})}
                      placeholder="Any additional notes..."
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reading
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Readings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Recent Readings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lungFunctionReadings.map((reading) => (
                    <div key={reading.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {new Date(reading.reading_date).toLocaleDateString()}
                        </div>
                        {reading.device_used && (
                          <Badge variant="outline">{reading.device_used}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {reading.peak_flow && (
                          <div>
                            <span className="text-gray-500">Peak Flow:</span>
                            <span className="ml-2 font-medium">{reading.peak_flow} L/min</span>
                          </div>
                        )}
                        {reading.fev1 && (
                          <div>
                            <span className="text-gray-500">FEV1:</span>
                            <span className="ml-2 font-medium">{reading.fev1} L</span>
                          </div>
                        )}
                        {reading.fvc && (
                          <div>
                            <span className="text-gray-500">FVC:</span>
                            <span className="ml-2 font-medium">{reading.fvc} L</span>
                          </div>
                        )}
                        {reading.fev1_fvc_ratio && (
                          <div>
                            <span className="text-gray-500">FEV1/FVC:</span>
                            <span className="ml-2 font-medium">{reading.fev1_fvc_ratio}</span>
                          </div>
                        )}
                      </div>
                      
                      {reading.notes && (
                        <p className="text-sm text-gray-600 mt-2">{reading.notes}</p>
                      )}
                    </div>
                  ))}
                  
                  {lungFunctionReadings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No lung function readings yet</p>
                      <p className="text-sm">Add your first reading to start tracking</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Medication Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Add Medication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedication} className="space-y-4">
                  <div>
                    <Label htmlFor="medication_name">Medication Name</Label>
                    <Input
                      id="medication_name"
                      value={newMedication.medication_name}
                      onChange={(e) => setNewMedication({...newMedication, medication_name: e.target.value})}
                      placeholder="e.g., Albuterol, Fluticasone"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        placeholder="e.g., 100mcg, 2 puffs"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select 
                        value={newMedication.frequency} 
                        onValueChange={(value) => setNewMedication({...newMedication, frequency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once daily">Once daily</SelectItem>
                          <SelectItem value="twice daily">Twice daily</SelectItem>
                          <SelectItem value="three times daily">Three times daily</SelectItem>
                          <SelectItem value="four times daily">Four times daily</SelectItem>
                          <SelectItem value="as needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="medication_type">Type</Label>
                    <Select 
                      value={newMedication.medication_type} 
                      onValueChange={(value) => setNewMedication({...newMedication, medication_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="controller">Controller</SelectItem>
                        <SelectItem value="rescue_inhaler">Rescue Inhaler</SelectItem>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="nasal">Nasal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newMedication.start_date}
                      onChange={(e) => setNewMedication({...newMedication, start_date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="med_notes">Notes</Label>
                    <Input
                      id="med_notes"
                      value={newMedication.notes}
                      onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                      placeholder="Prescribing doctor, side effects, etc."
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="w-5 h-5 mr-2" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{medication.medication_name}</h4>
                          <p className="text-sm text-gray-600">
                            {medication.dosage} • {medication.frequency}
                          </p>
                        </div>
                        <Badge variant={medication.medication_type === 'controller' ? 'default' : 'secondary'}>
                          {medication.medication_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Started: {new Date(medication.start_date).toLocaleDateString()}
                        {medication.end_date && (
                          <span> • Ended: {new Date(medication.end_date).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      {medication.notes && (
                        <p className="text-sm text-gray-600 mt-2">{medication.notes}</p>
                      )}
                    </div>
                  ))}
                  
                  {medications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No medications added yet</p>
                      <p className="text-sm">Add your medications to track adherence</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Additional tabs would be implemented similarly */}
        <TabsContent value="biometrics">
          <Card>
            <CardHeader>
              <CardTitle>Biometric Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Biometric tracking features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms">
          <Card>
            <CardHeader>
              <CardTitle>Symptom Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Enhanced symptom tracking features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Health Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Health goals management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthTracking;
