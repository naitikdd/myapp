import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { getSkillById, createSession } from '@/db/api';
import type { Skill, LocationType } from '@/types/index';
import { CalendarIcon, Loader2, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format, addHours, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';

export default function BookSession() {
  const { skillId } = useParams<{ skillId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [locationType, setLocationType] = useState<LocationType>('online');
  const [locationDetails, setLocationDetails] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!skillId) return;

    const fetchSkill = async () => {
      const skillData = await getSkillById(skillId);
      if (!skillData) {
        toast.error('Skill not found');
        navigate('/search');
        return;
      }
      setSkill(skillData);
    };

    fetchSkill();
  }, [skillId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast.error('Please sign in to book a session');
      navigate('/login');
      return;
    }

    if (!date) {
      toast.error('Please select a date');
      return;
    }

    if (!skill) {
      toast.error('Skill not found');
      return;
    }

    // Check if user has enough credits
    if (profile.time_credits < duration) {
      toast.error('Insufficient time credits', {
        description: `You need ${duration} credits but only have ${profile.time_credits}`,
      });
      return;
    }

    setLoading(true);

    // Parse start time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = setMinutes(setHours(date, hours), minutes);
    const endDateTime = addHours(startDateTime, duration / 60);

    const session = await createSession({
      teacher_id: skill.user_id,
      skill_id: skill.id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration,
      location_type: locationType,
      location_details: locationDetails || undefined,
    });

    if (session) {
      toast.success('Session booked successfully!', {
        description: 'Waiting for teacher confirmation',
      });
      navigate('/sessions');
    } else {
      toast.error('Failed to book session');
      setLoading(false);
    }
  };

  if (!skill) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book a Session</h1>
          <p className="text-muted-foreground">
            Schedule a learning session for: <strong>{skill.title}</strong>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Choose your preferred date, time, and location</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="30"
                      step="30"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location Type *</Label>
                  <RadioGroup
                    value={locationType}
                    onValueChange={(v) => setLocationType(v as LocationType)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="font-normal cursor-pointer">
                        Online (Video call)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="on_campus" id="on_campus" />
                      <Label htmlFor="on_campus" className="font-normal cursor-pointer">
                        On Campus (In person)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationDetails">
                    Location Details {locationType === 'on_campus' && '*'}
                  </Label>
                  <Textarea
                    id="locationDetails"
                    placeholder={
                      locationType === 'online'
                        ? 'Meeting link will be shared after confirmation'
                        : 'e.g., Library Room 301, Student Center Cafe'
                    }
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    rows={3}
                    disabled={loading}
                    required={locationType === 'on_campus'}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Book Session'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{locationType === 'online' ? 'Online' : 'On Campus'}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cost</span>
                    <span className="text-lg font-bold">{duration} credits</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your balance</span>
                    <span className="font-medium">{profile?.time_credits || 0} credits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
