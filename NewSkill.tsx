import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { createSkill } from '@/db/api';
import type { SkillCategory, SkillType } from '@/types/index';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const categories: { value: SkillCategory; label: string }[] = [
  { value: 'coding', label: 'Coding' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'music', label: 'Music' },
  { value: 'finance', label: 'Finance' },
  { value: 'language', label: 'Language' },
  { value: 'writing', label: 'Writing' },
  { value: 'photography', label: 'Photography' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'other', label: 'Other' },
];

export default function NewSkill() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = (searchParams.get('type') as SkillType) || 'teach';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SkillCategory>('coding');
  const [type, setType] = useState<SkillType>(defaultType);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to add a skill');
      navigate('/login');
      return;
    }

    setLoading(true);

    const skill = await createSkill({
      title,
      description,
      category,
      type,
    });

    if (skill) {
      toast.success('Skill added successfully!');
      navigate('/dashboard');
    } else {
      toast.error('Failed to add skill');
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Skill</h1>
          <p className="text-muted-foreground">
            Share what you can teach or what you want to learn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skill Details</CardTitle>
            <CardDescription>
              Provide information about the skill you want to add
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Skill Type</Label>
                <RadioGroup value={type} onValueChange={(v) => setType(v as SkillType)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teach" id="teach" />
                    <Label htmlFor="teach" className="font-normal cursor-pointer">
                      I can teach this skill
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="learn" id="learn" />
                    <Label htmlFor="learn" className="font-normal cursor-pointer">
                      I want to learn this skill
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Skill Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Python Programming, Guitar Basics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as SkillCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the skill, what you'll cover, or what you're looking to learn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Skill'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
