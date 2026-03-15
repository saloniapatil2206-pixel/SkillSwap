import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Profile = {
    id: string;
    name: string;
    email: string;
    bio: string | null;
    avatar_url: string | null;
    teach_skills: { name: string; level: string }[];
    learn_skills: string[];
    preferred_mode: string;
    available_days: string[];
    available_slots: string[];
    linkedin: string | null;
    github: string | null;
    twitter: string | null;
    is_onboarded: boolean;
};

export type Booking = {
    id: string;
    learner_id: string;
    mentor_id: string;
    mentor_name: string;
    mentor_avatar: string | null;
    skill: string;
    date: string;
    time: string;
    mode: string;
    status: string;
    notes: string | null;
    duration: string;
    jitsi_room: string | null;
    created_at: string;
};

export type Message = {
    id: string;
    sender_id: string;
    receiver_id: string;
    text: string;
    delivered: boolean;
    created_at: string;
};