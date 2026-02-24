import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getSkillsByUser, getSessionsByUser, getRatingsByUser } from '@/db/api';
import type { Skill, Session, Rating } from '@/types/index';
import { Plus, BookOpen, Calendar, Star, Coins, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { profile } = useAuth();
  const [teachSkills, setTeachSkills] = useState<Skill[]>([]);
  const [learnSkills, setLearnSkills] = useState<Skill[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      try {
        const [skillsData, sessionsData, ratingsData] = await Promise.all([
          getSkillsByUser(profile.id),
          getSessionsByUser(profile.id),
          getRatingsByUser(profile.id),
        ]);

        setTeachSkills(skillsData.filter((s) => s.type === 'teach'));
        setLearnSkills(skillsData.filter((s) => s.type === 'learn'));
        setSessions(sessionsData);
        setRatings(ratingsData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : '0.0';

  const upcomingSessions = sessions.filter(
    (s) => s.status === 'confirmed' && new Date(s.start_time) > new Date()
  );

  const completedSessions = sessions.filter((s) => s.status === 'completed');

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-8 bg-muted" />
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Skeleton className="h-32 bg-muted" />
            <Skeleton className="h-32 bg-muted" />
            <Skeleton className="h-32 bg-muted" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.username}! Manage your skills and sessions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Time Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.time_credits || 0}</div>
              <p className="text-xs text-muted-foreground">Available for learning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating}</div>
              <p className="text-xs text-muted-foreground">
                From {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSessions.length}</div>
              <p className="text-xs text-muted-foreground">Total exchanges</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{session.skill?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.start_time).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/sessions">View Details</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Management */}
        <Tabs defaultValue="teach" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teach">Skills I Teach</TabsTrigger>
            <TabsTrigger value="learn">Skills I Want to Learn</TabsTrigger>
          </TabsList>

          <TabsContent value="teach" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Skills I Can Teach</h3>
                <p className="text-sm text-muted-foreground">
                  Share your expertise with others
                </p>
              </div>
              <Button asChild>
                <Link to="/skills/new?type=teach">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Link>
              </Button>
            </div>

            {teachSkills.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't added any teaching skills yet
                  </p>
                  <Button asChild>
                    <Link to="/skills/new?type=teach">Add Your First Skill</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teachSkills.map((skill) => (
                  <Card key={skill.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{skill.title}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary">{skill.category}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {skill.description}
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to={`/skills/${skill.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="learn" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Skills I Want to Learn</h3>
                <p className="text-sm text-muted-foreground">
                  Track what you're interested in learning
                </p>
              </div>
              <Button asChild>
                <Link to="/skills/new?type=learn">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Link>
              </Button>
            </div>

            {learnSkills.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't added any learning goals yet
                  </p>
                  <Button asChild>
                    <Link to="/skills/new?type=learn">Add Learning Goal</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {learnSkills.map((skill) => (
                  <Card key={skill.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{skill.title}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary">{skill.category}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {skill.description}
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to={`/search?category=${skill.category}`}>Find Teachers</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
