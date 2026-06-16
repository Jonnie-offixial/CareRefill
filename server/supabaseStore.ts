// server/supabaseStore.ts
// Fully-featured database accessor with Supabase live and local db.json fallbacks
// Also handles user signup and login proxying to Supabase Auth.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "server", "db.json");

// Helper to read local json db as a fallback
export function readLocalDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, JSON.stringify({ 
        pharmacies: [], 
        patients: [], 
        medications: [], 
        reminders: [], 
        users: [], 
        templates: {},
        feedback: [],
        progress_metrics: [],
        appointments: [],
        consultations: []
      }, null, 2));
    }
    const data = fs.readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(data);
    // Ensure all tables are initialized as arrays in the parsed json
    if (!parsed.feedback) parsed.feedback = [];
    if (!parsed.progress_metrics) parsed.progress_metrics = [];
    if (!parsed.appointments) parsed.appointments = [];
    if (!parsed.consultations) parsed.consultations = [];
    return parsed;
  } catch (error) {
    console.error("Error reading db.json", error);
    return { 
      pharmacies: [], 
      patients: [], 
      medications: [], 
      reminders: [], 
      users: [], 
      templates: {},
      feedback: [],
      progress_metrics: [],
      appointments: [],
      consultations: []
    };
  }
}

// Helper to write local json db as a fallback
export function writeLocalDB(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing db.json", error);
  }
}

// Lazy Supabase client initialization
let cachedClient: SupabaseClient | null = null;
let testedConnection = false;
let isConnected = false;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key || url.trim() === "" || url.includes("Placeholder")) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    } catch (e: any) {
      console.log("Error creating Supabase client instance:", e?.message || e);
      return null;
    }
  }
  return cachedClient;
}

// Check integration connection status
export async function checkConnectionStatus() {
  const client = getSupabaseClient();
  if (!client) {
    return { connected: false, mode: "Local JSON Sandbox", error: "Missing env variables (SUPABASE_URL, etc.)" };
  }

  if (testedConnection) {
    return { connected: isConnected, mode: isConnected ? "Supabase Active" : "Local Fallback (Test Fail)" };
  }

  try {
    // Quick test query on pharmacies table
    const { data, error } = await client.from("pharmacies").select("pharmacy_id").limit(1);
    if (error) {
      console.log("Supabase table test info:", error.message);
      isConnected = false;
    } else {
      isConnected = true;
    }
  } catch (err: any) {
    console.log("Supabase connection handshake info:", err?.message || err);
    isConnected = false;
  }

  testedConnection = true;
  return {
    connected: isConnected,
    mode: isConnected ? "Supabase Active" : "Local Fallback (Handshake Fail)",
    warning: !isConnected ? "Did you copy and execute schema.sql in your Supabase SQL Editor?" : undefined
  };
}

// Helper to decide whether we should query Supabase
export async function shouldQuerySupabase(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  
  if (!testedConnection) {
    await checkConnectionStatus();
  }
  
  return isConnected;
}

// 1. Get Pharmacies
export async function getPharmacies(): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("pharmacies").select("*");
        if (!error && data) return data;
        console.log("Local query fallback for pharmacies:", error?.message);
      } catch (e: any) {
        console.log("Error fetching pharmacies from Supabase:", e?.message || e);
      }
    }
  }
  const db = readLocalDB();
  return db.pharmacies || [];
}

// 2. Get Patients with Medication Detail by Pharmacy
export async function getPatients(pharmacyId: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("patients")
          .select(`
            *,
            medications (*)
          `)
          .eq("pharmacy_id", pharmacyId);
        
        if (!error && data) {
          return data.map(p => ({
            ...p,
            medication: p.medications?.[0] || null
          }));
        }
        console.log("Local query fallback for patients:", error?.message);
      } catch (e: any) {
        console.log("Error loading patients from Supabase:", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  const matched = (db.patients || []).filter((p: any) => p.pharmacy_id === pharmacyId);
  return matched.map((patient: any) => {
    const medication = (db.medications || []).find((m: any) => m.patient_id === patient.patient_id);
    
    // Calculate adherence stats elegantly from stored fields or seed defaults
    const refilled_on_time = patient.refilled_on_time !== undefined ? patient.refilled_on_time : (patient.patient_id === "pat-001" ? 8 : (patient.patient_id === "pat-002" ? 5 : 2));
    const delayed_refills = patient.delayed_refills !== undefined ? patient.delayed_refills : (patient.patient_id === "pat-001" ? 0 : (patient.patient_id === "pat-002" ? 2 : 1));
    const missed_refills = patient.missed_refills !== undefined ? patient.missed_refills : (patient.patient_id === "pat-001" ? 0 : (patient.patient_id === "pat-002" ? 0 : 3));
    
    const total = refilled_on_time + delayed_refills + missed_refills;
    const refill_percentage = total > 0 ? Math.round((refilled_on_time / total) * 100) : 100;
    
    let adherence_category: 'Excellent' | 'Good' | 'Moderate' | 'Poor' = 'Excellent';
    if (refill_percentage >= 90) adherence_category = 'Excellent';
    else if (refill_percentage >= 80) adherence_category = 'Good';
    else if (refill_percentage >= 60) adherence_category = 'Moderate';
    else adherence_category = 'Poor';

    return {
      ...patient,
      refilled_on_time,
      delayed_refills,
      missed_refills,
      refill_percentage,
      adherence_category,
      assistance_requested: patient.assistance_requested !== undefined ? patient.assistance_requested : false,
      assistance_reason: patient.assistance_reason || null,
      medication: medication || null
    };
  });
}

// 3. Create Patient and Medication
export async function createPatient(payload: {
  pharmacy_id: string;
  full_name: string;
  phone_number: string;
  chronic_condition: string;
  preferred_channel: string;
  medication_name: string;
  dosage: string;
  duration_days: number;
  last_refill_date?: string;
}): Promise<any> {
  const client = getSupabaseClient();

  const patient_id = `pat-${Date.now()}`;
  const medication_id = `med-${Date.now()}`;
  const lastRefill = payload.last_refill_date ? new Date(payload.last_refill_date) : new Date();
  const nextRefill = new Date(lastRefill.getTime());
  nextRefill.setDate(nextRefill.getDate() + Number(payload.duration_days));

  const newPatient = {
    patient_id,
    pharmacy_id: payload.pharmacy_id,
    full_name: payload.full_name,
    phone_number: payload.phone_number,
    chronic_condition: payload.chronic_condition,
    preferred_channel: payload.preferred_channel || "WhatsApp",
    status: "Active",
    created_at: new Date().toISOString()
  };

  const newMedication = {
    medication_id,
    patient_id,
    medication_name: payload.medication_name,
    dosage: payload.dosage || "1 pill daily",
    duration_days: Number(payload.duration_days),
    last_refill_date: lastRefill.toISOString(),
    next_refill_date: nextRefill.toISOString()
  };

  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        // Create patient
        const { error: pErr } = await client.from("patients").insert(newPatient);
        if (pErr) throw pErr;

        // Create medication
        const { error: mErr } = await client.from("medications").insert(newMedication);
        if (mErr) throw mErr;

        return { ...newPatient, medication: newMedication };
      } catch (e: any) {
        console.log("Supabase info - patient creation redirected locally:", e?.message || e);
      }
    }
  }

  // Fallback to local
  const db = readLocalDB();
  db.patients.push(newPatient);
  db.medications.push(newMedication);
  writeLocalDB(db);

  return { ...newPatient, medication: newMedication };
}

// 4. Update Patient Status/Preferred Channel
export async function updatePatient(patientId: string, updates: { status?: string; preferred_channel?: string }) {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("patients")
          .update(updates)
          .eq("patient_id", patientId)
          .select()
          .single();
        
        if (!error && data) return data;
        console.log("Local query fallback for patient update:", error?.message);
      } catch (e: any) {
        console.log("Error updating patient in Supabase:", e?.message || e);
      }
    }
  }

  const db = readLocalDB();
  const patientIndex = db.patients.findIndex((p: any) => p.patient_id === patientId);
  if (patientIndex !== -1) {
    if (updates.status !== undefined) db.patients[patientIndex].status = updates.status;
    if (updates.preferred_channel !== undefined) db.patients[patientIndex].preferred_channel = updates.preferred_channel;
    writeLocalDB(db);
    return db.patients[patientIndex];
  }
  throw new Error("Patient not found");
}

// 5. Mark Med as Refilled (Resets the cycle)
export async function markRefilled(medicationId: string, refillDateStr?: string) {
  const refillBaseDate = refillDateStr ? new Date(refillDateStr) : new Date();

  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        // Get medication first to get duration days
        const { data: med, error: fErr } = await client
          .from("medications")
          .select("*")
          .eq("medication_id", medicationId)
          .single();
        
        if (!fErr && med) {
          const nextRefillDate = new Date(refillBaseDate.getTime());
          nextRefillDate.setDate(nextRefillDate.getDate() + Number(med.duration_days));

          const updates = {
            last_refill_date: refillBaseDate.toISOString(),
            next_refill_date: nextRefillDate.toISOString()
          };

          const { data: updatedMed, error: uErr } = await client
            .from("medications")
            .update(updates)
            .eq("medication_id", medicationId)
            .select()
            .single();

          if (!uErr && updatedMed) {
            return {
              medication: updatedMed,
              message: `Medication cycle updated! Next refill is ${nextRefillDate.toISOString().split("T")[0]}`
            };
          }
        }
      } catch (e: any) {
        console.log("Supabase info - medication refill redirected locally:", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  const medIndex = db.medications.findIndex((m: any) => m.medication_id === medicationId);
  if (medIndex === -1) {
    throw new Error("Medication record not found locally");
  }

  const currentMed = db.medications[medIndex];
  const nextRefillDate = new Date(refillBaseDate.getTime());
  nextRefillDate.setDate(nextRefillDate.getDate() + Number(currentMed.duration_days));

  db.medications[medIndex].last_refill_date = refillBaseDate.toISOString();
  db.medications[medIndex].next_refill_date = nextRefillDate.toISOString();
  writeLocalDB(db);

  return {
    medication: db.medications[medIndex],
    message: `Medication cycle successfully reset! Next refill scheduled for ${nextRefillDate.toISOString().split("T")[0]}`
  };
}

// 6. Get Reminders
export async function getReminders(pharmacyId: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        // Read all reminders for patients under this pharmacy
        const { data, error } = await client
          .from("reminders")
          .select(`
            *,
            patients!inner (*),
            medications (*)
          `)
          .eq("patients.pharmacy_id", pharmacyId);

        if (!error && data) {
          const mapped = data.map((rem: any) => ({
            ...rem,
            patient_name: rem.patients?.full_name || "Unknown Patient",
            condition: rem.patients?.chronic_condition || "Unknown",
            phone_number: rem.patients?.phone_number || "",
            medication_name: rem.medications?.medication_name || "Metformin"
          }));

          mapped.sort((a, b) => {
            const dateA = new Date(a.sent_at || a.reminder_date);
            const dateB = new Date(b.sent_at || b.reminder_date);
            return dateB.getTime() - dateA.getTime();
          });

          return mapped;
        }
        console.log("Local query fallback for reminders:", error?.message);
      } catch (e: any) {
        console.log("Error loading reminders from Supabase:", e?.message || e);
      }
    }
  }

  // Local fallback
  const db = readLocalDB();
  const patientIds = db.patients
    .filter((p: any) => p.pharmacy_id === pharmacyId)
    .map((p: any) => p.patient_id);

  const matchedReminders = db.reminders.filter((r: any) => patientIds.includes(r.patient_id));
  
  const enrichedReminders = matchedReminders.map((rem: any) => {
    const patient = db.patients.find((p: any) => p.patient_id === rem.patient_id);
    const med = db.medications.find((m: any) => m.medication_id === rem.medication_id);
    return {
      ...rem,
      patient_name: patient ? patient.full_name : "Unknown Patient",
      condition: patient ? patient.chronic_condition : "Unknown",
      phone_number: patient ? patient.phone_number : "",
      medication_name: med ? med.medication_name : "Metformin"
    };
  });

  enrichedReminders.sort((a: any, b: any) => {
    const dateA = new Date(a.sent_at || a.reminder_date);
    const dateB = new Date(b.sent_at || b.reminder_date);
    return dateB.getTime() - dateA.getTime();
  });

  return enrichedReminders;
}

// 7. Get Templates Config
export async function getTemplates(pharmacyId: string): Promise<any> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("templates")
          .select("*")
          .eq("pharmacy_id", pharmacyId)
          .single();
        
        if (!error && data) {
          return {
            "Hypertension": data.hypertension,
            "Diabetes": data.diabetes,
            "HIV/ARVs": data.hiv_arvs,
            "General": data.general
          };
        }
      } catch (e: any) {
        console.log("Error getting templates from Supabase:", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  return db.templates?.[pharmacyId] || {
    "Hypertension": "Hello {patient_name}, refill of {med_name} due soon.",
    "Diabetes": "Hello {patient_name}, your {med_name} is running low.",
    "HIV/ARVs": "Hello {patient_name}, refill package for {med_name} is ready.",
    "General": "Hello {patient_name}, medication refill due on {next_refill_date}."
  };
}

// Update Templates Config
export async function updateTemplates(pharmacyId: string, templates: any) {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload = {
          pharmacy_id: pharmacyId,
          hypertension: templates["Hypertension"] || "",
          diabetes: templates["Diabetes"] || "",
          hiv_arvs: templates["HIV/ARVs"] || "",
          general: templates["General"] || "",
          updated_at: new Date().toISOString()
        };

        const { data, error } = await client
          .from("templates")
          .upsert(payload, { onConflict: "pharmacy_id" })
          .select()
          .single();
        
        if (!error) return { success: true };
        console.log("Failed saving templates to Supabase:", error.message);
      } catch (e: any) {
        console.log("Error updating templates in Supabase:", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  if (!db.templates) db.templates = {};
  db.templates[pharmacyId] = templates;
  writeLocalDB(db);
  return { success: true };
}

// 8. proxy authentications directly to Supabase User Database
export async function registerStaffUser(payload: { email: string; pass: string; name: string; pharmacy_id: string }) {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: payload.email,
          password: payload.pass,
          options: {
            data: {
              full_name: payload.name,
              pharmacy_id: payload.pharmacy_id
            }
          }
        });
        if (error) throw error;
        return { success: true, user: data.user };
      } catch (err: any) {
        console.log("Supabase signup redirected locally:", err.message);
        return { success: false, error: err.message };
      }
    }
  }

  // Local fallback persistence
  const db = readLocalDB();
  if (!db.users) db.users = [];

  const exists = db.users.some((u: any) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    return { success: false, error: "A user with this email has already registered." };
  }

  const userRole = payload.email.toLowerCase() === 'viannejonny@gmail.com' ? 'Admin' : 'Staff';
  const newUser = {
    user_id: `usr-${Date.now()}`,
    pharmacy_id: payload.pharmacy_id || 'pharm-001',
    full_name: payload.name,
    email: payload.email,
    role: userRole,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  writeLocalDB(db);

  return { 
    success: true, 
    user: { 
      email: payload.email, 
      user_metadata: { 
        full_name: payload.name, 
        pharmacy_id: payload.pharmacy_id,
        role: userRole
      } 
    }, 
    mode: "Local Mock Database" 
  };
}

export async function loginStaffUser(payload: { email: string; pass: string }) {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: payload.email,
          password: payload.pass
        });
        if (error) throw error;
        return {
          success: true,
          user: data.user,
          session: data.session
        };
      } catch (err: any) {
        console.log("Supabase login check info:", err.message);
        return { success: false, error: err.message };
      }
    }
  }

  // Fallback: check local db user list
  const db = readLocalDB();
  const staff = (db.users || []).find((u: any) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (staff) {
    return {
      success: true,
      user: {
        email: staff.email,
        user_metadata: {
          full_name: staff.full_name,
          pharmacy_id: staff.pharmacy_id,
          role: staff.role
        }
      }
    };
  }

  return { success: false, error: "Authentication credentials incorrect. Enter registered staff emails (e.g. sarah@kcp.ug)." };
}

// ==========================================
// NEW PATIENT ENGAGEMENT HUB ACCESSORS
// ==========================================

// 1. Feedback Accessors
export async function getFeedback(pharmacyId: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("feedback")
          .select(`
            *,
            patients!inner (*)
          `)
          .eq("patients.pharmacy_id", pharmacyId);
        
        if (!error && data) {
          return data.map(f => ({
            ...f,
            patient_name: f.patients?.full_name || "Anonymous Patient"
          }));
        }
        console.log("Local query fallback for feedback:", error?.message);
      } catch (e: any) {
        console.log("Error fetching feedback from Supabase", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  const matchedPatients = db.patients.filter((p: any) => p.pharmacy_id === pharmacyId);
  const pIds = matchedPatients.map((p: any) => p.patient_id);
  const fbs = (db.feedback || []).filter((f: any) => pIds.includes(f.patient_id));
  return fbs.map((f: any) => {
    const pat = matchedPatients.find((p: any) => p.patient_id === f.patient_id);
    return {
      ...f,
      patient_name: pat ? pat.full_name : "Anonymous Patient"
    };
  });
}

export async function createFeedback(payload: { patient_id: string; rating: number; comment: string; category: string }): Promise<any> {
  const newFeedback = {
    feedback_id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    patient_id: payload.patient_id,
    rating: Number(payload.rating),
    comment: payload.comment,
    category: payload.category || "Other",
    created_at: new Date().toISOString()
  };

  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("feedback").insert(newFeedback).select().single();
        if (!error) return data || newFeedback;
        console.log("Feedback insert to Supabase info:", error.message);
      } catch (e: any) {
        console.log("Error creating feedback in Supabase", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  db.feedback.push(newFeedback);
  writeLocalDB(db);
  return newFeedback;
}

// 2. Progress Metrics Accessors
export async function getProgressMetrics(patientId?: string, pharmacyId?: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from("progress_metrics").select(`
          *,
          patients!inner (*)
        `);
        
        if (patientId) {
          query = query.eq("patient_id", patientId);
        } else if (pharmacyId) {
          query = query.eq("patients.pharmacy_id", pharmacyId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(m => ({
            ...m,
            patient_name: m.patients?.full_name || "Patient"
          })).sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime());
        }
      } catch (e: any) {
        console.log("Error getting metrics from Supabase", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  let filtered = db.progress_metrics || [];
  
  if (patientId) {
    filtered = filtered.filter((m: any) => m.patient_id === patientId);
  } else if (pharmacyId) {
    const validPatIds = db.patients.filter((p: any) => p.pharmacy_id === pharmacyId).map((p: any) => p.patient_id);
    filtered = filtered.filter((m: any) => validPatIds.includes(m.patient_id));
  }

  return filtered.map((m: any) => {
    const p = db.patients.find((pt: any) => pt.patient_id === m.patient_id);
    return {
      ...m,
      patient_name: p ? p.full_name : "Patient"
    };
  }).sort((a: any, b: any) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime());
}

export async function createProgressMetric(payload: {
  patient_id: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  blood_sugar?: number;
  sugar_type?: string;
  wellness_level: string;
  symptoms?: string;
}): Promise<any> {
  const newMetric = {
    metric_id: `met-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    patient_id: payload.patient_id,
    systolic_bp: payload.systolic_bp ? Number(payload.systolic_bp) : null,
    diastolic_bp: payload.diastolic_bp ? Number(payload.diastolic_bp) : null,
    blood_sugar: payload.blood_sugar ? Number(payload.blood_sugar) : null,
    sugar_type: payload.sugar_type || null,
    wellness_level: payload.wellness_level,
    symptoms: payload.symptoms || "",
    logged_date: new Date().toISOString()
  };

  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("progress_metrics").insert(newMetric).select().single();
        if (!error) return data || newMetric;
        console.log("Metric save in Supabase info:", error.message);
      } catch (e: any) {
        console.log("Error inserting metrics into Supabase", e?.message || e);
      }
    }
  }

  const db = readLocalDB();
  db.progress_metrics.push(newMetric);
  writeLocalDB(db);
  return newMetric;
}

// 3. Appointments Accessors
export async function getAppointments(pharmacyId: string, patientId?: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from("appointments").select(`
          *,
          patients!inner (*)
        `).eq("patients.pharmacy_id", pharmacyId);

        if (patientId) {
          query = query.eq("patient_id", patientId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(ap => ({
            ...ap,
            patient_name: ap.patients?.full_name || "Patient"
          })).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
        }
      } catch (e: any) {
        console.log("Error loading appointments from Supabase", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  const patientMap = new Map();
  db.patients.filter((p: any) => p.pharmacy_id === pharmacyId).forEach((p: any) => {
    patientMap.set(p.patient_id, p.full_name);
  });

  let apts = db.appointments || [];
  apts = apts.filter((ap: any) => patientMap.has(ap.patient_id));
  if (patientId) {
    apts = apts.filter((ap: any) => ap.patient_id === patientId);
  }

  return apts.map((ap: any) => ({
    ...ap,
    patient_name: patientMap.get(ap.patient_id) || "Patient"
  })).sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
}

export async function createAppointment(payload: {
  patient_id: string;
  doctor_name: string;
  appointment_date: string;
  reason: string;
  status?: string;
}): Promise<any> {
  const newApt = {
    appointment_id: `ap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    patient_id: payload.patient_id,
    doctor_name: payload.doctor_name,
    appointment_date: payload.appointment_date,
    reason: payload.reason,
    status: payload.status || "Successful",
    created_at: new Date().toISOString()
  };

  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("appointments").insert(newApt).select().single();
        if (!error) return data || newApt;
        console.log("Failed inserting appointment to Supabase, info:", error.message);
      } catch (e: any) {
        console.log("Error creating appointment in Supabase", e?.message || e);
      }
    }
  }

  const db = readLocalDB();
  db.appointments.push(newApt);
  writeLocalDB(db);
  return newApt;
}

export async function updateAppointmentStatus(appointmentId: string, status: string): Promise<any> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("appointments")
          .update({ status })
          .eq("appointment_id", appointmentId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e: any) {
        console.log("Error writing appointment status update in Supabase", e?.message || e);
      }
    }
  }

  const db = readLocalDB();
  const idx = db.appointments.findIndex((ap: any) => ap.appointment_id === appointmentId);
  if (idx !== -1) {
    db.appointments[idx].status = status;
    writeLocalDB(db);
    return db.appointments[idx];
  }
  throw new Error("Appointment not found");
}

// 4. Consultations Accessors
export async function getConsultations(pharmacyId: string, patientId?: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from("consultations").select(`
          *,
          patients!inner (*)
        `).eq("patients.pharmacy_id", pharmacyId);

        if (patientId) {
          query = query.eq("patient_id", patientId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(con => ({
            ...con,
            patient_name: con.patients?.full_name || "Patient"
          })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      } catch (e: any) {
        console.log("Error loading consultations from Supabase", e?.message || e);
      }
    }
  }

  // Fallback
  const db = readLocalDB();
  const patientMap = new Map();
  db.patients.filter((p: any) => p.pharmacy_id === pharmacyId).forEach((p: any) => {
    patientMap.set(p.patient_id, p.full_name);
  });

  let cons = db.consultations || [];
  cons = cons.filter((c: any) => patientMap.has(c.patient_id));
  if (patientId) {
    cons = cons.filter((c: any) => c.patient_id === patientId);
  }

  return cons.map((c: any) => ({
    ...c,
    patient_name: patientMap.get(c.patient_id) || "Patient"
  })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createConsultation(payload: { patient_id: string; question: string }): Promise<any> {
  const newCon = {
    consultation_id: `con-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    patient_id: payload.patient_id,
    question: payload.question,
    answer: null,
    answered_at: null,
    status: "Pending",
    created_at: new Date().toISOString()
  };

  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("consultations").insert(newCon).select().single();
        if (!error) return data || newCon;
      } catch (e: any) {
        console.log("Error posting consultation in Supabase", e?.message || e);
      }
    }
  }

  const db = readLocalDB();
  db.consultations.push(newCon);
  writeLocalDB(db);
  return newCon;
}

export async function answerConsultation(consultationId: string, answer: string): Promise<any> {
  const updates = {
    answer,
    answered_at: new Date().toISOString(),
    status: "Answered"
  };

  if (await shouldQuerySupabase()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("consultations")
          .update(updates)
          .eq("consultation_id", consultationId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e: any) {
        console.log("Error answering consultation in Supabase", e?.message || e);
      }
    }
  }

  const db = readLocalDB();
  const idx = db.consultations.findIndex((c: any) => c.consultation_id === consultationId);
  if (idx !== -1) {
    db.consultations[idx].answer = answer;
    db.consultations[idx].answered_at = updates.answered_at;
    db.consultations[idx].status = "Answered";
    writeLocalDB(db);
    return db.consultations[idx];
  }
  throw new Error("Consultation not found");
}

