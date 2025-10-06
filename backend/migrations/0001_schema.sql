-- Authenticai core schema (idempotent)

-- Users table assumed to exist in Supabase auth or app schema. This migration
-- focuses on feature tables referenced by the application.

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  prediction_date timestamptz,
  risk_score double precision not null,
  risk_level text not null,
  factors jsonb,
  recommendations jsonb,
  model_version text,
  confidence_score double precision,
  emergency_warnings jsonb
);

create index if not exists idx_predictions_user_created on predictions (user_id, created_at desc);

create table if not exists coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_type text not null,
  content text not null,
  delivery_method text not null default 'voice',
  user_feedback integer,
  delivered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_coaching_sessions_user_created on coaching_sessions (user_id, created_at desc);

create table if not exists lung_function_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  reading_date date not null,
  peak_flow double precision,
  fev1 double precision,
  fvc double precision,
  fev1_fvc_ratio double precision,
  notes text,
  device_used text,
  created_at timestamptz not null default now()
);

create index if not exists idx_lung_fn_user_date on lung_function_readings (user_id, reading_date desc);

create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  medication_name text not null,
  dosage text not null,
  frequency text not null,
  medication_type text not null,
  start_date date not null,
  end_date date,
  prescribing_doctor text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_medications_user_active on medications (user_id, is_active);

create table if not exists medication_doses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  medication_id uuid not null,
  dose_time timestamptz not null,
  amount_taken text not null,
  effectiveness_rating integer,
  side_effects text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_med_doses_user_time on medication_doses (user_id, dose_time desc);

create table if not exists biometric_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  reading_date date not null,
  reading_type text not null,
  value double precision not null,
  unit text not null,
  notes text,
  device_used text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bio_user_type_date on biometric_readings (user_id, reading_type, reading_date desc);

create table if not exists detailed_symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  symptom_date timestamptz not null,
  symptoms jsonb not null,
  severity integer not null,
  duration_minutes integer,
  triggers jsonb,
  location text,
  weather_conditions text,
  activity_level text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_symptoms_user_date on detailed_symptoms (user_id, symptom_date desc);

create table if not exists health_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  goal_type text not null,
  target_value double precision,
  target_date date,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_goals_user_active on health_goals (user_id, is_active);


