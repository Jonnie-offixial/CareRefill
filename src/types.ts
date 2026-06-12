export interface Pharmacy {
  pharmacy_id: string;
  pharmacy_name: string;
  address: string;
  phone_number: string;
  color_theme?: string; // e.g. emerald, teal, indigo, sky
}

export interface Patient {
  patient_id: string;
  pharmacy_id: string;
  full_name: string;
  phone_number: string;
  chronic_condition: 'Hypertension' | 'Diabetes' | 'HIV/ARVs' | 'Asthma' | 'Epilepsy' | 'Chronic Kidney Disease' | 'Tuberculosis (TB)' | 'Heart Failure' | 'Depression/Mental Health' | 'Other';
  preferred_channel: 'WhatsApp' | 'SMS' | 'Both';
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Medication {
  medication_id: string;
  patient_id: string;
  medication_name: string;
  dosage: string; // e.g., "50mg daily", "1 tablet morning/evening"
  duration_days: number; // e.g., 30, 60, 90
  last_refill_date: string; // ISO date
  next_refill_date: string; // ISO date
}

export interface ReminderLog {
  reminder_id: string;
  patient_id: string;
  medication_id: string;
  reminder_date: string; // Date checked/run
  channel: 'WhatsApp' | 'SMS';
  status: 'Pending' | 'Sent' | 'Failed';
  message: string;
  sent_at?: string; // ISO date
}

export interface PharmacyUser {
  user_id: string;
  pharmacy_id: string;
  full_name: string;
  email: string;
  role: 'Pharmacist' | 'Attendant' | 'Admin';
}

export interface SystemStats {
  totalPatients: number;
  dueThisWeek: number;
  overdue: number;
  sentToday: number;
}

export interface DeliveryStatusUpdate {
  reminder_id: string;
  status: 'Sent' | 'Failed';
  channel: 'WhatsApp' | 'SMS';
}

export interface Feedback {
  feedback_id: string;
  patient_id: string;
  rating: number; // 1 to 5
  comment: string;
  category: 'Reminders' | 'Refills' | 'Pharmacy Service' | 'Other';
  created_at: string;
  patient_name?: string;
}

export interface ProgressMetric {
  metric_id: string;
  patient_id: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  blood_sugar?: number;
  sugar_type?: 'Fasting' | 'Random' | 'Post-Meal';
  wellness_level: 'Great' | 'Good' | 'Fair' | 'Poor';
  symptoms?: string;
  logged_date: string;
  patient_name?: string;
}

export interface Appointment {
  appointment_id: string;
  patient_id: string;
  doctor_name: string;
  appointment_date: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at: string;
  patient_name?: string;
}

export interface Consultation {
  consultation_id: string;
  patient_id: string;
  question: string;
  answer?: string | null;
  answered_at?: string;
  status: 'Pending' | 'Answered';
  created_at: string;
  patient_name?: string;
}

