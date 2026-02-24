import { supabase } from './supabase';
import type {
  Profile,
  Skill,
  Session,
  Rating,
  Transaction,
  SkillCategory,
  SkillType,
  SessionStatus,
  LocationType,
} from '@/types/index';

// Profile API
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
}

export async function getAllProfiles(limit = 50): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// Skills API
export async function createSkill(skill: {
  title: string;
  description?: string;
  category: SkillCategory;
  type: SkillType;
  image?: string;
}): Promise<Skill | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('skills')
    .insert({
      user_id: user.id,
      title: skill.title,
      description: skill.description || null,
      category: skill.category,
      type: skill.type,
      image: skill.image || null,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating skill:', error);
    return null;
  }
  return data;
}

export async function getSkillsByUser(userId: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user skills:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getSkillsByType(
  type: SkillType,
  category?: SkillCategory,
  limit = 50
): Promise<Skill[]> {
  let query = supabase
    .from('skills')
    .select('*, user:profiles!skills_user_id_fkey(*)')
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getSkillById(skillId: string): Promise<Skill | null> {
  const { data, error } = await supabase
    .from('skills')
    .select('*, user:profiles!skills_user_id_fkey(*)')
    .eq('id', skillId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching skill:', error);
    return null;
  }
  return data;
}

export async function updateSkill(
  skillId: string,
  updates: Partial<Skill>
): Promise<Skill | null> {
  const { data, error } = await supabase
    .from('skills')
    .update(updates)
    .eq('id', skillId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating skill:', error);
    return null;
  }
  return data;
}

export async function deleteSkill(skillId: string): Promise<boolean> {
  const { error } = await supabase.from('skills').delete().eq('id', skillId);

  if (error) {
    console.error('Error deleting skill:', error);
    return false;
  }
  return true;
}

// Sessions API
export async function createSession(session: {
  teacher_id: string;
  skill_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  location_type: LocationType;
  location_details?: string;
}): Promise<Session | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      teacher_id: session.teacher_id,
      learner_id: user.id,
      skill_id: session.skill_id,
      start_time: session.start_time,
      end_time: session.end_time,
      duration: session.duration,
      location_type: session.location_type,
      location_details: session.location_details || null,
      status: 'pending',
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }
  return data;
}

export async function getSessionsByUser(userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(
      '*, teacher:profiles!sessions_teacher_id_fkey(*), learner:profiles!sessions_learner_id_fkey(*), skill:skills(*)'
    )
    .or(`teacher_id.eq.${userId},learner_id.eq.${userId}`)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select(
      '*, teacher:profiles!sessions_teacher_id_fkey(*), learner:profiles!sessions_learner_id_fkey(*), skill:skills(*)'
    )
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return data;
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus
): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating session status:', error);
    return null;
  }
  return data;
}

export async function completeSession(sessionId: string): Promise<boolean> {
  // Get session details
  const session = await getSessionById(sessionId);
  if (!session) return false;

  // Update session status
  const updatedSession = await updateSessionStatus(sessionId, 'completed');
  if (!updatedSession) return false;

  // Create transactions
  const { error: earnError } = await supabase.from('transactions').insert({
    from_user_id: session.learner_id,
    to_user_id: session.teacher_id,
    session_id: sessionId,
    amount: session.duration,
    type: 'earn',
  });

  const { error: spendError } = await supabase.from('transactions').insert({
    from_user_id: session.learner_id,
    to_user_id: session.teacher_id,
    session_id: sessionId,
    amount: session.duration,
    type: 'spend',
  });

  if (earnError || spendError) {
    console.error('Error creating transactions:', earnError || spendError);
    return false;
  }

  // Update user credits
  const { error: teacherError } = await supabase.rpc('increment_credits', {
    user_id: session.teacher_id,
    amount: session.duration,
  });

  const { error: learnerError } = await supabase.rpc('decrement_credits', {
    user_id: session.learner_id,
    amount: session.duration,
  });

  if (teacherError || learnerError) {
    console.error('Error updating credits:', teacherError || learnerError);
    return false;
  }

  return true;
}

// Ratings API
export async function createRating(rating: {
  session_id: string;
  rated_id: string;
  rating: number;
  feedback?: string;
}): Promise<Rating | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('ratings')
    .insert({
      session_id: rating.session_id,
      rater_id: user.id,
      rated_id: rating.rated_id,
      rating: rating.rating,
      feedback: rating.feedback || null,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating rating:', error);
    return null;
  }
  return data;
}

export async function getRatingsByUser(userId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*, session:sessions(*), rater:profiles!ratings_rater_id_fkey(*)')
    .eq('rated_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getAverageRating(userId: string): Promise<number> {
  const ratings = await getRatingsByUser(userId);
  if (ratings.length === 0) return 0;

  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / ratings.length;
}

// Transactions API
export async function getTransactionsByUser(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(
      '*, from_user:profiles!transactions_from_user_id_fkey(*), to_user:profiles!transactions_to_user_id_fkey(*), session:sessions(*)'
    )
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// Search API
export async function searchSkills(
  query: string,
  type?: SkillType,
  category?: SkillCategory
): Promise<Skill[]> {
  let dbQuery = supabase
    .from('skills')
    .select('*, user:profiles!skills_user_id_fkey(*)')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (type) {
    dbQuery = dbQuery.eq('type', type);
  }

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Error searching skills:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}
