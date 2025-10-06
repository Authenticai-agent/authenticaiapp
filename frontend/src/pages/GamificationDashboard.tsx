import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  Award,
  Zap,
  Crown,
  Medal,
  Gift,
  Users,
  CheckCircle,
  Clock,
  Flame,
  Heart,
  Activity
} from 'lucide-react';
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
  Progress,
  Badge,
  Alert,
  AlertDescription,
  AlertTitle
} from '../components/ui';
import { gamificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface UserStats {
  total_points: number;
  current_level: number;
  level_progress: number;
  points_to_next_level: number;
  streak_days: number;
  badges_earned: string[];
  achievements_unlocked: number;
  health_score: number;
  last_activity: string | null;
}

interface Achievement {
  type: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  status: 'locked' | 'unlocked';
  unlocked_at?: string;
}

interface Challenge {
  id: string;
  challenge_name: string;
  description: string;
  challenge_type: string;
  target_value: number;
  current_progress: number;
  completion_percentage: number;
  points_reward: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
}

const GamificationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [motivation, setMotivation] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Temporary mock data to test UI
      setUserStats({
        total_points: 1250,
        current_level: 5,
        level_progress: 75,
        points_to_next_level: 250,
        streak_days: 7,
        badges_earned: ['early_bird', 'consistent_tracker'],
        achievements_unlocked: 3,
        health_score: 85,
        last_activity: new Date().toISOString()
      });
      
      setAchievements([
        {
          type: 'daily_checkin',
          name: 'Early Bird',
          description: 'Complete 7 daily check-ins',
          points: 100,
          icon: 'trophy',
          status: 'unlocked',
          unlocked_at: new Date().toISOString()
        }
      ]);
      
      setChallenges([
        {
          id: '1',
          challenge_name: 'Weekly Wellness',
          description: 'Track your health for 7 days',
          challenge_type: 'daily',
          target_value: 7,
          current_progress: 5,
          completion_percentage: 71,
          points_reward: 200,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        }
      ]);
      
      setLeaderboard([
        { rank: 1, username: 'HealthHero', points: 2500, level: 8 },
        { rank: 2, username: 'WellnessWarrior', points: 2200, level: 7 },
        { rank: 3, username: 'You', points: 1250, level: 5 }
      ]);
      
      setMotivation([
        'Great job on your health journey!',
        'Keep up the consistent tracking!',
        'You\'re making excellent progress!'
      ]);
      
    } catch (err: any) {
      console.error('Error loading gamification data:', err);
      setError(typeof err === 'string' ? err : 'Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const handleDailyCheckin = async () => {
    try {
      const response = await gamificationAPI.dailyCheckin();
      toast.success(`Daily check-in completed! You earned ${response.data.points_earned} points. Streak: ${response.data.streak_days} days`);
      loadGamificationData(); // Reload to update stats
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete daily check-in');
    }
  };


  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const response = await gamificationAPI.completeChallenge(challengeId);
      toast.success(`Challenge completed! You earned ${response.data.points_earned} points!`);
      loadGamificationData(); // Reload to update data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete challenge');
    }
  };


  const getStreakEmoji = (days: number): string => {
    if (days === 0) return '😴';
    if (days < 7) return '🔥';
    if (days < 30) return '🚀';
    if (days < 100) return '⭐';
    return '👑';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gamification Dashboard</h1>
          <p className="text-gray-600">Track your progress, earn rewards, and stay motivated!</p>
        </div>

        {/* Daily Check-in Button */}
        <div className="mb-6">
          <Button onClick={handleDailyCheckin} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            Daily Check-in
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="motivation">Motivation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {userStats && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Total Points</CardTitle>
                    <Star className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700">{userStats.total_points.toLocaleString()}</div>
                    <p className="text-xs text-blue-600 mt-2">
                      {userStats.points_to_next_level} points to next level
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">Current Level</CardTitle>
                    <Crown className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-700">{userStats.current_level}</div>
                    <Progress value={userStats.level_progress} className="mt-2" />
                    <p className="text-xs text-purple-600 mt-1">
                      {userStats.level_progress.toFixed(0)}% to level {userStats.current_level + 1}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800">Streak</CardTitle>
                    <Flame className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-700 flex items-center">
                      {userStats.streak_days}
                      <span className="ml-2 text-xl">{getStreakEmoji(userStats.streak_days)}</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-2">
                      {userStats.streak_days === 0 ? 'Start your streak today!' : 'days in a row'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Health Score</CardTitle>
                    <Heart className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-700">{userStats.health_score.toFixed(0)}/100</div>
                    <Progress value={userStats.health_score} className="mt-2" />
                    <p className="text-xs text-green-600 mt-1">
                      Based on tracking consistency
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements
                      .filter(a => a.status === 'unlocked')
                      .slice(0, 6)
                      .map((achievement) => (
                        <div key={achievement.type} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-yellow-800">{achievement.name}</h4>
                            <p className="text-sm text-yellow-700">{achievement.description}</p>
                            <div className="flex items-center mt-1">
                              <Star className="w-3 h-3 text-yellow-600 mr-1" />
                              <span className="text-xs text-yellow-600">{achievement.points} points</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {achievements.filter(a => a.status === 'unlocked').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No achievements unlocked yet</p>
                      <p className="text-sm">Start tracking your health to earn your first achievement!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Active Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {challenges.slice(0, 3).map((challenge) => (
                      <div key={challenge.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{challenge.challenge_name}</h4>
                            <p className="text-sm text-gray-600">{challenge.description}</p>
                          </div>
                          <Badge variant="outline">
                            {challenge.points_reward} points
                          </Badge>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress: {challenge.current_progress}/{challenge.target_value}</span>
                            <span>{challenge.completion_percentage.toFixed(0)}%</span>
                          </div>
                          <Progress value={challenge.completion_percentage} />
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-500">
                            Ends: {new Date(challenge.end_date).toLocaleDateString()}
                          </span>
                          {challenge.completion_percentage >= 100 && (
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteChallenge(challenge.id)}
                            >
                              Claim Reward
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {challenges.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No active challenges</p>
                        <p className="text-sm">New challenges will appear as you progress</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unlocked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Unlocked ({achievements.filter(a => a.status === 'unlocked').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements
                    .filter(a => a.status === 'unlocked')
                    .map((achievement) => (
                      <div key={achievement.type} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-800">{achievement.name}</h4>
                          <p className="text-sm text-green-700">{achievement.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-green-600 mr-1" />
                              <span className="text-xs text-green-600">{achievement.points} points</span>
                            </div>
                            {achievement.unlocked_at && (
                              <span className="text-xs text-green-500">
                                {new Date(achievement.unlocked_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Locked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-600">
                  <Trophy className="w-5 h-5 mr-2" />
                  Available ({achievements.filter(a => a.status === 'locked').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements
                    .filter(a => a.status === 'locked')
                    .map((achievement) => (
                      <div key={achievement.type} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-75">
                        <div className="text-2xl grayscale">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-700">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">{achievement.points} points</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className={challenge.completion_percentage >= 100 ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base">{challenge.challenge_name}</span>
                    <Badge variant={challenge.completion_percentage >= 100 ? 'default' : 'outline'}>
                      {challenge.points_reward} pts
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{challenge.current_progress}/{challenge.target_value}</span>
                      </div>
                      <Progress value={challenge.completion_percentage} />
                      <p className="text-xs text-gray-500 mt-1">
                        {challenge.completion_percentage.toFixed(0)}% complete
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Ends {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {challenge.challenge_type}
                      </Badge>
                    </div>
                    
                    {challenge.completion_percentage >= 100 && (
                      <Button 
                        className="w-full mt-3" 
                        onClick={() => handleCompleteChallenge(challenge.id)}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Claim Reward
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {challenges.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Challenges</h3>
                <p className="text-gray-600">
                  Challenges will appear as you continue your health journey. Keep tracking your health data to unlock new challenges!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className={`flex items-center space-x-4 p-3 rounded-lg ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200">
                      {entry.rank === 1 && <Crown className="w-4 h-4 text-yellow-600" />}
                      {entry.rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                      {entry.rank === 3 && <Award className="w-4 h-4 text-orange-600" />}
                      {entry.rank > 3 && <span className="text-sm font-medium">{entry.rank}</span>}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{entry.username}</span>
                        <Badge variant="outline" className="text-xs">
                          Level {entry.level}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{entry.points.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {leaderboard.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Leaderboard will be available soon</p>
                  <p className="text-sm">Keep tracking to see how you compare with others!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motivation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Your Personal Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {motivation.map((message, index) => (
                  <Alert key={index} className="border-blue-200 bg-blue-50">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      {message}
                    </AlertDescription>
                  </Alert>
                ))}
                
                {motivation.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start tracking your health to receive personalized motivation!</p>
                  </div>
                )}
              </div>
              
              {userStats && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">Quick Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-700">{userStats.current_level}</div>
                      <div className="text-xs text-purple-600">Current Level</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-700">{userStats.streak_days}</div>
                      <div className="text-xs text-purple-600">Day Streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-700">{userStats.achievements_unlocked}</div>
                      <div className="text-xs text-purple-600">Achievements</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-700">{userStats.health_score.toFixed(0)}</div>
                      <div className="text-xs text-purple-600">Health Score</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default GamificationDashboard;
