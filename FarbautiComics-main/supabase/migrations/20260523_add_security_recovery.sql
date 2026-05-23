-- Create security questions table
CREATE TABLE IF NOT EXISTS security_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user security answers table
CREATE TABLE IF NOT EXISTS user_security_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES security_questions(id),
  answer_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Create recovery codes table
CREATE TABLE IF NOT EXISTS recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 year'
);

-- Insert default security questions in Spanish
INSERT INTO security_questions (question) VALUES
  ('¿Cuál es el nombre de tu mascota?'),
  ('¿En qué ciudad naciste?'),
  ('¿Cuál es el apellido de tu madre?'),
  ('¿Cuál es tu película favorita?'),
  ('¿Cuál es tu libro favorito?'),
  ('¿Cuál es tu color favorito?'),
  ('¿Cuál es el nombre de tu mejor amigo?'),
  ('¿Cuál es tu comida favorita?'),
  ('¿En qué año aprendiste a conducir?'),
  ('¿Cuál es el nombre de tu primera escuela?')
ON CONFLICT DO NOTHING;
