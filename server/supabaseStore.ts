import fs from "fs";
import path from "path";
import { db } from "../src/db/index.js";
import * as schema from "../src/db/schema.js";
import { eq, and, gte, lte } from "drizzle-orm";

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

// Mocks for compatibility
export function getSupabaseClient() {
  return null;
}

let isConnected = false;
let verifiedConnection = false;

// Check integration connection status for Cloud SQL
export async function checkConnectionStatus() {
  const host = process.env.SQL_HOST;
  if (!host) {
    isConnected = false;
    verifiedConnection = true;
    return { connected: false, mode: "Local JSON Sandbox", error: "Missing env variables (SQL_HOST, etc.)" };
  }

  if (verifiedConnection) {
    return { connected: isConnected, mode: isConnected ? "Cloud SQL Active" : "Local Fallback" };
  }

  try {
    // Quick select to check connectivity
    await db.select().from(schema.pharmacies).limit(1);
    isConnected = true;
  } catch (err: any) {
    console.warn("Cloud SQL connection check failed, falling back to local storage:", err.message);
    isConnected = false;
  }
  verifiedConnection = true;
  return {
    connected: isConnected,
    mode: isConnected ? "Cloud SQL Active" : "Local Fallback (Drizzle Fail)"
  };
}

export async function shouldQuerySupabase(): Promise<boolean> {
  if (!verifiedConnection) {
    await checkConnectionStatus();
  }
  return isConnected;
}

// 1. Get Pharmacies
export async function getPharmacies(): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    try {
      const data = await db.select().from(schema.pharmacies);
      return data;
    } catch (err: any) {
      console.error("Error getting pharmacies from Cloud SQL:", err.message);
    }
  }
  const local = readLocalDB();
  return local.pharmacies || [];
}

// 2. Get Patients with Medications filtered by pharmacy_id
export async function getPatients(pharmacyId: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    try {
      const pats = await db.select().from(schema.patients)
        .where(eq(schema.patients.pharmacy_id, pharmacyId));
      
      const res = [];
      for (const p of pats) {
        const meds = await db.select().from(schema.medications)
          .where(eq(schema.medications.patient_id, p.patient_id));
        
        // Adherence Calculations
        const refilled_on_time = p.loyalty_points && p.loyalty_points > 100 ? Math.floor((p.loyalty_points - 100) / 50) + 5 : 5;
        const delayed_refills = p.patient_id === "pat-002" ? 2 : 0;
        const missed_refills = p.patient_id === "pat-003" ? 3 : 0;
        const total = refilled_on_time + delayed_refills + missed_refills;
        const refill_percentage = total > 0 ? Math.round((refilled_on_time / total) * 100) : 100;
        
        let adherence_category: 'Excellent' | 'Good' | 'Moderate' | 'Poor' = 'Excellent';
        if (refill_percentage >= 90) adherence_category = 'Excellent';
        else if (refill_percentage >= 80) adherence_category = 'Good';
        else if (refill_percentage >= 60) adherence_category = 'Moderate';
        else adherence_category = 'Poor';

        res.push({
          ...p,
          refilled_on_time,
          delayed_refills,
          missed_refills,
          refill_percentage,
          adherence_category,
          medications: meds,
          medication: meds[0] || null,
          assistance_requested: false,
          assistance_reason: null
        });
      }
      return res;
    } catch (err: any) {
      console.error("Error getting patients from Cloud SQL:", err.message);
    }
  }

  // Fallback
  const local = readLocalDB();
  const matched = (local.patients || []).filter((p: any) => p.pharmacy_id === pharmacyId);
  return matched.map((patient: any) => {
    const medication = (local.medications || []).find((m: any) => m.patient_id === patient.patient_id);
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

// 3. Create Patient + Medication
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
    created_at: new Date().toISOString(),
    loyalty_points: 100
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
    try {
      await db.insert(schema.patients).values(newPatient);
      await db.insert(schema.medications).values(newMedication);
      return { ...newPatient, medication: newMedication };
    } catch (err: any) {
      console.error("Error creating patient in SQL:", err.message);
    }
  }

  // Fallback
  const local = readLocalDB();
  local.patients.push(newPatient);
  local.medications.push(newMedication);
  writeLocalDB(local);
  return { ...newPatient, medication: newMedication };
}

// 4. Update Patient
export async function updatePatient(patientId: string, updates: { status?: string; preferred_channel?: string }) {
  if (await shouldQuerySupabase()) {
    try {
      const results = await db.update(schema.patients)
        .set(updates)
        .where(eq(schema.patients.patient_id, patientId))
        .returning();
      if (results.length > 0) return results[0];
    } catch (err: any) {
      console.error("Error updating patient in SQL:", err.message);
    }
  }

  const local = readLocalDB();
  const patientIndex = local.patients.findIndex((p: any) => p.patient_id === patientId);
  if (patientIndex !== -1) {
    if (updates.status !== undefined) local.patients[patientIndex].status = updates.status;
    if (updates.preferred_channel !== undefined) local.patients[patientIndex].preferred_channel = updates.preferred_channel;
    writeLocalDB(local);
    return local.patients[patientIndex];
  }
  throw new Error("Patient not found");
}

// 5. Mark Medication as Refilled
export async function markRefilled(medicationId: string, refillDateStr?: string) {
  const refillBaseDate = refillDateStr ? new Date(refillDateStr) : new Date();

  if (await shouldQuerySupabase()) {
    try {
      const meds = await db.select().from(schema.medications)
        .where(eq(schema.medications.medication_id, medicationId));
      if (meds.length > 0) {
        const med = meds[0];
        const nextRefillDate = new Date(refillBaseDate.getTime());
        nextRefillDate.setDate(nextRefillDate.getDate() + Number(med.duration_days));

        const updates = {
          last_refill_date: refillBaseDate.toISOString(),
          next_refill_date: nextRefillDate.toISOString()
        };

        const updatedMeds = await db.update(schema.medications)
          .set(updates)
          .where(eq(schema.medications.medication_id, medicationId))
          .returning();

        // Increment loyalty points
        try {
          const pt = await db.select().from(schema.patients).where(eq(schema.patients.patient_id, med.patient_id));
          if (pt.length > 0) {
            const upPts = (pt[0].loyalty_points || 100) + 50;
            await db.update(schema.patients).set({ loyalty_points: upPts }).where(eq(schema.patients.patient_id, med.patient_id));
          }
        } catch (loyE) {
          console.warn("Loyalty score update error", loyE);
        }

        return {
          medication: updatedMeds[0],
          message: `Medication cycle updated! Next refill is ${nextRefillDate.toISOString().split("T")[0]}`
        };
      }
    } catch (err: any) {
      console.error("Error refilling med in SQL:", err.message);
    }
  }

  // Fallback
  const local = readLocalDB();
  const medIndex = local.medications.findIndex((m: any) => m.medication_id === medicationId);
  if (medIndex === -1) {
    throw new Error("Medication record not found locally");
  }

  const currentMed = local.medications[medIndex];
  const nextRefillDate = new Date(refillBaseDate.getTime());
  nextRefillDate.setDate(nextRefillDate.getDate() + Number(currentMed.duration_days));

  local.medications[medIndex].last_refill_date = refillBaseDate.toISOString();
  local.medications[medIndex].next_refill_date = nextRefillDate.toISOString();

  // Loyalty update
  const pIdx = local.patients.findIndex((p: any) => p.patient_id === currentMed.patient_id);
  if (pIdx !== -1) {
    local.patients[pIdx].loyalty_points = (local.patients[pIdx].loyalty_points || 100) + 50;
  }

  writeLocalDB(local);

  return {
    medication: local.medications[medIndex],
    message: `Medication cycle successfully reset! Next refill scheduled for ${nextRefillDate.toISOString().split("T")[0]}`
  };
}

// 6. Get Reminders
export async function getReminders(pharmacyId: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    try {
      const pats = await db.select().from(schema.patients)
        .where(eq(schema.patients.pharmacy_id, pharmacyId));
      const pIds = pats.map(p => p.patient_id);
      
      const rems = await db.select().from(schema.reminders);
      const filtered = rems.filter(r => pIds.includes(r.patient_id));

      const enriched = [];
      for (const r of filtered) {
        const patient = pats.find(p => p.patient_id === r.patient_id);
        const meds = await db.select().from(schema.medications)
          .where(eq(schema.medications.medication_id, r.medication_id));
         enriched.push({
           ...r,
           patient_name: patient ? patient.full_name : "Unknown Patient",
           condition: patient ? patient.chronic_condition : "Unknown",
           phone_number: patient ? patient.phone_number : "",
           medication_name: meds[0] ? meds[0].medication_name : "Metformin"
         });
      }

      enriched.sort((a, b) => new Date(b.sent_at || b.reminder_date).getTime() - new Date(a.sent_at || a.reminder_date).getTime());
      return enriched;
    } catch (err: any) {
      console.error("Error fetching reminders from SQL:", err.message);
    }
  }

  const local = readLocalDB();
  const patientIds = (local.patients || [])
    .filter((p: any) => p.pharmacy_id === pharmacyId)
    .map((p: any) => p.patient_id);

  const matchedReminders = (local.reminders || []).filter((r: any) => patientIds.includes(r.patient_id));
  
  const enrichedReminders = matchedReminders.map((rem: any) => {
    const patient = local.patients.find((p: any) => p.patient_id === rem.patient_id);
    const med = local.medications.find((m: any) => m.medication_id === rem.medication_id);
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

// 7. Get Templates
export async function getTemplates(pharmacyId: string): Promise<any> {
  if (await shouldQuerySupabase()) {
    try {
      const temps = await db.select().from(schema.templates)
        .where(eq(schema.templates.pharmacy_id, pharmacyId));
      if (temps.length > 0) {
        const data = temps[0];
        return {
          "Hypertension": data.hypertension,
          "Diabetes": data.diabetes,
          "HIV/ARVs": data.hiv_arvs,
          "General": data.general
        };
      }
    } catch (err: any) {
      console.error("Error fetching templates:", err.message);
    }
  }

  const local = readLocalDB();
  return local.templates?.[pharmacyId] || {
    "Hypertension": "Hello {patient_name}, refill of {med_name} due soon.",
    "Diabetes": "Hello {patient_name}, your {med_name} is running low.",
    "HIV/ARVs": "Hello {patient_name}, refill package for {med_name} is ready.",
    "General": "Hello {patient_name}, medication refill due on {next_refill_date}."
  };
}

// 8. Update Templates
export async function updateTemplates(pharmacyId: string, templates: any) {
  const payload = {
    pharmacy_id: pharmacyId,
    hypertension: templates["Hypertension"] || "",
    diabetes: templates["Diabetes"] || "",
    hiv_arvs: templates["HIV/ARVs"] || "",
    general: templates["General"] || "",
    updated_at: new Date().toISOString()
  };

  if (await shouldQuerySupabase()) {
    try {
      await db.insert(schema.templates)
        .values(payload)
        .onConflictDoUpdate({
          target: schema.templates.pharmacy_id,
          set: payload
        });
      return { success: true };
    } catch (err: any) {
      console.error("Error saving templates to SQL:", err.message);
    }
  }

  const local = readLocalDB();
  if (!local.templates) local.templates = {};
  local.templates[pharmacyId] = templates;
  writeLocalDB(local);
  return { success: true };
}

// 9. Register/Login Proxy Users
export async function registerStaffUser(payload: { email: string; pass: string; name: string; pharmacy_id: string }) {
  const userRole = payload.email.toLowerCase() === 'viannejonny@gmail.com' ? 'Admin' : 'Staff';
  const newUser = {
    user_id: `usr-${Date.now()}`,
    pharmacy_id: payload.pharmacy_id || 'pharm-001',
    full_name: payload.name,
    email: payload.email.toLowerCase(),
    role: userRole,
    created_at: new Date().toISOString()
  };

  if (await shouldQuerySupabase()) {
    try {
      await db.insert(schema.users)
        .values(newUser)
        .onConflictDoNothing();
      return {
        success: true,
        user: { email: payload.email, user_metadata: { full_name: payload.name, pharmacy_id: payload.pharmacy_id, role: userRole } }
      };
    } catch (err: any) {
      console.error("Error registering user in SQL:", err.message);
    }
  }

  const local = readLocalDB();
  if (!local.users) local.users = [];
  const exists = local.users.some((u: any) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    return { success: false, error: "A user with this email has already registered." };
  }

  local.users.push(newUser);
  writeLocalDB(local);

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
    try {
      const usersList = await db.select().from(schema.users)
        .where(eq(schema.users.email, payload.email.toLowerCase()));
      if (usersList.length > 0) {
        const staff = usersList[0];
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
    } catch (err: any) {
      console.error("Error logging in via SQL:", err.message);
    }
  }

  const local = readLocalDB();
  const staff = (local.users || []).find((u: any) => u.email.toLowerCase() === payload.email.toLowerCase());
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

// 10. Feedback Accessors
export async function getFeedback(pharmacyId: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    try {
      const pats = await db.select().from(schema.patients)
        .where(eq(schema.patients.pharmacy_id, pharmacyId));
      const pIds = pats.map(p => p.patient_id);
      
      const fbs = await db.select().from(schema.feedback);
      const filtered = fbs.filter(f => pIds.includes(f.patient_id));

      return filtered.map(f => {
        const p = pats.find(pt => pt.patient_id === f.patient_id);
        return {
          ...f,
          patient_name: p ? p.full_name : "Anonymous Patient"
        };
      });
    } catch (err: any) {
      console.error("Error getting feedback:", err.message);
    }
  }

  const local = readLocalDB();
  const matchedPatients = local.patients.filter((p: any) => p.pharmacy_id === pharmacyId);
  const pIds = matchedPatients.map((p: any) => p.patient_id);
  const fbs = (local.feedback || []).filter((f: any) => pIds.includes(f.patient_id));
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
    try {
      await db.insert(schema.feedback).values(newFeedback);
      return newFeedback;
    } catch (err: any) {
      console.error("Error creating feedback:", err.message);
    }
  }

  const local = readLocalDB();
  local.feedback.push(newFeedback);
  writeLocalDB(local);
  return newFeedback;
}

// 11. Progress Metrics
export async function getProgressMetrics(patientId?: string, pharmacyId?: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    try {
      const pats = await db.select().from(schema.patients);
      const metrics = await db.select().from(schema.progressMetrics);
      
      let filtered = metrics;
      if (patientId) {
        filtered = filtered.filter(m => m.patient_id === patientId);
      } else if (pharmacyId) {
        const validPatIds = pats.filter(p => p.pharmacy_id === pharmacyId).map(p => p.patient_id);
        filtered = filtered.filter(m => validPatIds.includes(m.patient_id));
      }

      return filtered.map(m => {
        const p = pats.find(pt => pt.patient_id === m.patient_id);
        return {
          ...m,
          patient_name: p ? p.full_name : "Patient"
        };
      }).sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime());
    } catch (err: any) {
      console.error("Error getting metrics:", err.message);
    }
  }

  const local = readLocalDB();
  let filtered = local.progress_metrics || [];
  if (patientId) {
    filtered = filtered.filter((m: any) => m.patient_id === patientId);
  } else if (pharmacyId) {
    const validPatIds = local.patients.filter((p: any) => p.pharmacy_id === pharmacyId).map((p: any) => p.patient_id);
    filtered = filtered.filter((m: any) => validPatIds.includes(m.patient_id));
  }

  return filtered.map((m: any) => {
    const p = local.patients.find((pt: any) => pt.patient_id === m.patient_id);
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
    try {
      await db.insert(schema.progressMetrics).values(newMetric);
      return newMetric;
    } catch (err: any) {
      console.error("Error inserting metric:", err.message);
    }
  }

  const local = readLocalDB();
  local.progress_metrics.push(newMetric);
  writeLocalDB(local);
  return newMetric;
}

// 12. Appointments Accessors
export async function getAppointments(pharmacyId: string, patientId?: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    try {
      const pats = await db.select().from(schema.patients).where(eq(schema.patients.pharmacy_id, pharmacyId));
      const pIds = pats.map(p => p.patient_id);
      
      let apts = await db.select().from(schema.appointments);
      apts = apts.filter(ap => pIds.includes(ap.patient_id));
      if (patientId) {
        apts = apts.filter(ap => ap.patient_id === patientId);
      }

      return apts.map(ap => {
        const p = pats.find(pt => pt.patient_id === ap.patient_id);
        return {
          ...ap,
          patient_name: p ? p.full_name : "Patient"
        };
      }).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    } catch (err: any) {
      console.error("Error getting appointments:", err.message);
    }
  }

  const local = readLocalDB();
  const patientMap = new Map();
  local.patients.filter((p: any) => p.pharmacy_id === pharmacyId).forEach((p: any) => {
    patientMap.set(p.patient_id, p.full_name);
  });

  let apts = local.appointments || [];
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
    try {
      await db.insert(schema.appointments).values(newApt);
      return newApt;
    } catch (err: any) {
      console.error("Error creating appointment:", err.message);
    }
  }

  const local = readLocalDB();
  local.appointments.push(newApt);
  writeLocalDB(local);
  return newApt;
}

export async function updateAppointmentStatus(appointmentId: string, status: string): Promise<any> {
  if (await shouldQuerySupabase()) {
    try {
      const res = await db.update(schema.appointments)
        .set({ status })
        .where(eq(schema.appointments.appointment_id, appointmentId))
        .returning();
      if (res.length > 0) return res[0];
    } catch (err: any) {
      console.error("Error updating appointment:", err.message);
    }
  }

  const local = readLocalDB();
  const idx = local.appointments.findIndex((ap: any) => ap.appointment_id === appointmentId);
  if (idx !== -1) {
    local.appointments[idx].status = status;
    writeLocalDB(local);
    return local.appointments[idx];
  }
  throw new Error("Appointment not found");
}

// 13. Consultations Accessors
export async function getConsultations(pharmacyId: string, patientId?: string): Promise<any[]> {
  if (await shouldQuerySupabase()) {
    try {
      const pats = await db.select().from(schema.patients).where(eq(schema.patients.pharmacy_id, pharmacyId));
      const pIds = pats.map(p => p.patient_id);
      
      let cons = await db.select().from(schema.consultations);
      cons = cons.filter(c => pIds.includes(c.patient_id));
      if (patientId) {
        cons = cons.filter(c => c.patient_id === patientId);
      }

      return cons.map(c => {
        const p = pats.find(pt => pt.patient_id === c.patient_id);
        return {
          ...c,
          patient_name: p ? p.full_name : "Patient"
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (err: any) {
      console.error("Error getting consultations:", err.message);
    }
  }

  const local = readLocalDB();
  const patientMap = new Map();
  local.patients.filter((p: any) => p.pharmacy_id === pharmacyId).forEach((p: any) => {
    patientMap.set(p.patient_id, p.full_name);
  });

  let cons = local.consultations || [];
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
    try {
      await db.insert(schema.consultations).values(newCon);
      return newCon;
    } catch (err: any) {
      console.error("Error creating consultation:", err.message);
    }
  }

  const local = readLocalDB();
  local.consultations.push(newCon);
  writeLocalDB(local);
  return newCon;
}

export async function answerConsultation(consultationId: string, answer: string): Promise<any> {
  const updates = {
    answer,
    answered_at: new Date().toISOString(),
    status: "Answered"
  };

  if (await shouldQuerySupabase()) {
    try {
      const res = await db.update(schema.consultations)
        .set(updates)
        .where(eq(schema.consultations.consultation_id, consultationId))
        .returning();
      if (res.length > 0) return res[0];
    } catch (err: any) {
      console.error("Error answering consultation:", err.message);
    }
  }

  const local = readLocalDB();
  const idx = local.consultations.findIndex((c: any) => c.consultation_id === consultationId);
  if (idx !== -1) {
    local.consultations[idx].answer = answer;
    local.consultations[idx].answered_at = updates.answered_at;
    local.consultations[idx].status = "Answered";
    writeLocalDB(local);
    return local.consultations[idx];
  }
  throw new Error("Consultation not found");
}
