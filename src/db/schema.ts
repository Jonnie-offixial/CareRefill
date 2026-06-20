import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const pharmacies = pgTable("pharmacies", {
  pharmacy_id: text("pharmacy_id").primaryKey(),
  pharmacy_name: text("pharmacy_name").notNull(),
  address: text("address").notNull(),
  phone_number: text("phone_number").notNull(),
  color_theme: text("color_theme").default("teal"),
  status: text("status").default("Active"),
  plan_tier: text("plan_tier").default("Standard"),
  message_usage: integer("message_usage").default(0),
  message_limit: integer("message_limit").default(1000),
});

export const patients = pgTable("patients", {
  patient_id: text("patient_id").primaryKey(),
  pharmacy_id: text("pharmacy_id")
    .references(() => pharmacies.pharmacy_id)
    .notNull(),
  full_name: text("full_name").notNull(),
  phone_number: text("phone_number").notNull(),
  chronic_condition: text("chronic_condition").notNull(),
  preferred_channel: text("preferred_channel").default("WhatsApp"),
  status: text("status").default("Active"),
  created_at: text("created_at").notNull(),
  loyalty_points: integer("loyalty_points").default(100),
});

export const medications = pgTable("medications", {
  medication_id: text("medication_id").primaryKey(),
  patient_id: text("patient_id")
    .references(() => patients.patient_id)
    .notNull(),
  medication_name: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  duration_days: integer("duration_days").notNull(),
  last_refill_date: text("last_refill_date").notNull(),
  next_refill_date: text("next_refill_date").notNull(),
});

export const reminders = pgTable("reminders", {
  reminder_id: text("reminder_id").primaryKey(),
  patient_id: text("patient_id")
    .references(() => patients.patient_id)
    .notNull(),
  medication_id: text("medication_id")
    .references(() => medications.medication_id)
    .notNull(),
  reminder_date: text("reminder_date").notNull(),
  channel: text("channel").notNull(), // WhatsApp or SMS
  status: text("status").notNull(), // Sent or Failed
  message: text("message").notNull(),
  sent_at: text("sent_at"),
  category: text("category"),
});

export const users = pgTable("users", {
  user_id: text("user_id").primaryKey(), // Using Firebase Auth UID or custom
  pharmacy_id: text("pharmacy_id")
    .references(() => pharmacies.pharmacy_id)
    .notNull(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // Pharmacist, Attendant, Admin
  created_at: text("created_at").notNull(),
});

export const templates = pgTable("templates", {
  pharmacy_id: text("pharmacy_id").primaryKey()
    .references(() => pharmacies.pharmacy_id),
  hypertension: text("hypertension").notNull(),
  diabetes: text("diabetes").notNull(),
  hiv_arvs: text("hiv_arvs").notNull(),
  general: text("general").notNull(),
  updated_at: text("updated_at"),
});

export const feedback = pgTable("feedback", {
  feedback_id: text("feedback_id").primaryKey(),
  patient_id: text("patient_id")
    .references(() => patients.patient_id)
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  category: text("category").notNull(),
  created_at: text("created_at").notNull(),
});

export const progressMetrics = pgTable("progress_metrics", {
  metric_id: text("metric_id").primaryKey(),
  patient_id: text("patient_id")
    .references(() => patients.patient_id)
    .notNull(),
  systolic_bp: integer("systolic_bp"),
  diastolic_bp: integer("diastolic_bp"),
  blood_sugar: integer("blood_sugar"),
  sugar_type: text("sugar_type"),
  wellness_level: text("wellness_level").notNull(),
  symptoms: text("symptoms"),
  logged_date: text("logged_date").notNull(),
});

export const appointments = pgTable("appointments", {
  appointment_id: text("appointment_id").primaryKey(),
  patient_id: text("patient_id")
    .references(() => patients.patient_id)
    .notNull(),
  doctor_name: text("doctor_name").notNull(),
  appointment_date: text("appointment_date").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull(), // Scheduled, Completed, Cancelled
  created_at: text("created_at").notNull(),
});

export const consultations = pgTable("consultations", {
  consultation_id: text("consultation_id").primaryKey(),
  patient_id: text("patient_id")
    .references(() => patients.patient_id)
    .notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  answered_at: text("answered_at"),
  status: text("status").notNull(), // Pending, Answered
  created_at: text("created_at").notNull(),
});
