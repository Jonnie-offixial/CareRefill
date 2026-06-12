import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import {
  getSupabaseClient,
  checkConnectionStatus,
  getPharmacies,
  getPatients,
  createPatient,
  updatePatient,
  markRefilled,
  getReminders,
  getTemplates,
  updateTemplates,
  registerStaffUser,
  loginStaffUser,
  readLocalDB,
  writeLocalDB,
  getFeedback,
  createFeedback,
  getProgressMetrics,
  createProgressMetric,
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getConsultations,
  createConsultation,
  answerConsultation
} from "./server/supabaseStore.js";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini SDK lazily
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ==========================================
// API ROUTES
// ==========================================

// Connection status & details
app.get("/api/status", async (req, res) => {
  const dbStatus = await checkConnectionStatus();
  res.json({
    ...dbStatus,
    credentials: {
      whatsapp: !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN),
      africas_talking: !!(process.env.AFRICASTALKING_USERNAME && process.env.AFRICASTALKING_API_KEY),
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER),
      gemini: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY")
    }
  });
});

// Authentication Proxy endpoints
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name, pharmacy_id } = req.body;
  if (!email || !password || !name || !pharmacy_id) {
    return res.status(400).json({ error: "All registry fields list are required." });
  }
  const result = await registerStaffUser({ email, pass: password, name, pharmacy_id });
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json({ error: result.error });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const result = await loginStaffUser({ email, pass: password });
  if (result.success) {
    res.json(result);
  } else {
    res.status(401).json({ error: result.error });
  }
});


// 1. Get all Pharmacies (for Tenant Switcher)
app.get("/api/pharmacies", async (req, res) => {
  try {
    const list = await getPharmacies();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Refresh / Reset database to defaults
app.post("/api/reset-db", async (req, res) => {
  try {
    const backupPath = path.join(process.cwd(), "server", "backup.json");
    let content;
    if (fs.existsSync(backupPath)) {
      content = fs.readFileSync(backupPath, "utf-8");
    } else {
      content = JSON.stringify({
        "pharmacies": [
          {
            "pharmacy_id": "pharm-001",
            "pharmacy_name": "Kampala Community Pharmacy",
            "address": "Plot 42, Kampala Road, Kampala",
            "phone_number": "+256 701 123456",
            "color_theme": "teal"
          },
          {
            "pharmacy_id": "pharm-002",
            "pharmacy_name": "Arua First Care Pharmacy",
            "address": "Gulu-Arua Highway, Arua City",
            "phone_number": "+256 772 987654",
            "color_theme": "emerald"
          },
          {
            "pharmacy_id": "pharm-003",
            "pharmacy_name": "Elgon Wellness Chemists",
            "address": "Republic Street, Mbale City",
            "phone_number": "+256 752 456789",
            "color_theme": "indigo"
          }
        ],
        "patients": [
          {
            "patient_id": "pat-001",
            "pharmacy_id": "pharm-001",
            "full_name": "Abraham Mulondo",
            "phone_number": "+256 788 123456",
            "chronic_condition": "Diabetes",
            "preferred_channel": "WhatsApp",
            "status": "Active",
            "created_at": "2026-05-15T08:00:00Z"
          },
          {
            "patient_id": "pat-002",
            "pharmacy_id": "pharm-001",
            "full_name": "Sarah Namubiru",
            "phone_number": "+256 701 445566",
            "chronic_condition": "Hypertension",
            "preferred_channel": "SMS",
            "status": "Active",
            "created_at": "2026-05-20T09:30:00Z"
          },
          {
            "patient_id": "pat-003",
            "pharmacy_id": "pharm-001",
            "full_name": "John Mugisha",
            "phone_number": "+256 752 998877",
            "chronic_condition": "HIV/ARVs",
            "preferred_channel": "Both",
            "status": "Active",
            "created_at": "2026-05-10T11:00:00Z"
          }
        ],
        "medications": [
          {
            "medication_id": "med-001",
            "patient_id": "pat-001",
            "medication_name": "Metformin",
            "dosage": "500mg twice daily with meals",
            "duration_days": 30,
            "last_refill_date": "2026-05-15T08:00:00Z",
            "next_refill_date": "2026-06-14T08:00:00Z"
          },
          {
            "medication_id": "med-002",
            "patient_id": "pat-002",
            "medication_name": "Amlodipine",
            "dosage": "10mg once daily in the morning",
            "duration_days": 30,
            "last_refill_date": "2026-05-20T09:30:00Z",
            "next_refill_date": "2026-06-19T09:30:00Z"
          },
          {
            "medication_id": "med-003",
            "patient_id": "pat-003",
            "medication_name": "Acriptega (TLD)",
            "dosage": "1 tablet once daily before bed",
            "duration_days": 90,
            "last_refill_date": "2026-03-14T11:00:00Z",
            "next_refill_date": "2026-06-12T11:00:00Z"
          }
        ],
        "reminders": [],
        "users": [
          {
            "user_id": "usr-001",
            "pharmacy_id": "pharm-001",
            "full_name": "Dr. Sarah Mukasa",
            "email": "sarah@kcp.ug",
            "role": "Pharmacist"
          }
        ],
        "templates": {
          "pharm-001": {
            "Hypertension": "Hello {patient_name}, this is private reminder from {pharmacy_name}. Your medication for {med_name} will run out on {next_refill_date}. Please visit Plot 42 or call +256 701 123456 to arrange pick-up. Stay healthy!",
            "Diabetes": "Dear {patient_name}, this is {pharmacy_name}. Your {med_name} refill is due on {next_refill_date}. We have pre-packed your dosage. Please stop by or call us if you need help with transport. Thank you.",
            "HIV/ARVs": "Dear {patient_name}, friendly reminder from {pharmacy_name}. Your wellness package for {med_name} is ready for pick-up on {next_refill_date}. Thank you for trusting Kampala Community Pharmacy with your health support.",
            "General": "Hello {patient_name}, your chronic medication {med_name} from {pharmacy_name} will run out on {next_refill_date}. Please stop by for your refill. Thank you."
          }
        },
        "config": {
          "whatsapp_enabled": true,
          "sms_enabled": true,
          "reminder_sender_phone": "+256 701 113355",
          "use_ai_customizer": true
        }
      }, null, 2);
    }
    
    // Always write fallback json
    const parsed = JSON.parse(content);
    writeLocalDB(parsed);

    // If Supabase is connected we can output instructions
    const sb = getSupabaseClient();
    if (sb) {
      // Hand-upsert to Supabase
      for (const rx of parsed.pharmacies || []) {
        await sb.from("pharmacies").upsert(rx);
      }
      for (const rx of parsed.patients || []) {
        await sb.from("patients").upsert(rx);
      }
      for (const rx of parsed.medications || []) {
        await sb.from("medications").upsert(rx);
      }
      // Insert default template blocks
      for (const [pId, t] of Object.entries(parsed.templates || {})) {
        const temp: any = t;
        await sb.from("templates").upsert({
          pharmacy_id: pId,
          hypertension: temp.Hypertension || "",
          diabetes: temp.Diabetes || "",
          hiv_arvs: temp["HIV/ARVs"] || temp.hiv_arvs || "",
          general: temp.General || ""
        }, { onConflict: "pharmacy_id" });
      }
    }

    res.json({ success: true, message: sb ? "Database initialized in Supabase and local JSON fallback." : "Database successfully re-seeded to JSON fallback defaults." });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 3. Get Patient Directory with medication details filtered by pharmacy_id
app.get("/api/patients", async (req, res) => {
  const pharmacy_id = req.query.pharmacy_id as string;
  if (!pharmacy_id) {
    return res.status(400).json({ error: "Missing pharmacy_id parameter" });
  }
  try {
    const list = await getPatients(pharmacy_id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create Patient + Medication
app.post("/api/patients", async (req, res) => {
  const { pharmacy_id, full_name, phone_number, chronic_condition, preferred_channel, medication_name, dosage, duration_days, last_refill_date } = req.body;

  if (!pharmacy_id || !full_name || !phone_number || !chronic_condition || !medication_name || !duration_days) {
    return res.status(400).json({ error: "All required patient & medication details must be filled." });
  }

  try {
    const freshPatient = await createPatient({
      pharmacy_id,
      full_name,
      phone_number,
      chronic_condition,
      preferred_channel,
      medication_name,
      dosage,
      duration_days: Number(duration_days),
      last_refill_date
    });
    res.json({ success: true, patient: freshPatient });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update patient status or preferred channel
app.patch("/api/patients/:patient_id", async (req, res) => {
  const { patient_id } = req.params;
  const { status, preferred_channel } = req.body;

  try {
    const updated = await updatePatient(patient_id, { status, preferred_channel });
    res.json({ success: true, patient: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Mark Medication as Refilled (Calculates next refill date automatically)
app.post("/api/refills", async (req, res) => {
  const { medication_id, refill_date } = req.body;
  if (!medication_id) {
    return res.status(400).json({ error: "Missing medication_id" });
  }

  try {
    const response = await markRefilled(medication_id, refill_date);
    res.json({
      success: true,
      medication: response.medication,
      message: response.message
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Reminders/Outbox Logs
app.get("/api/reminders", async (req, res) => {
  const pharmacy_id = req.query.pharmacy_id as string;
  if (!pharmacy_id) {
    return res.status(400).json({ error: "Missing pharmacy_id parameter" });
  }

  try {
    const list = await getReminders(pharmacy_id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get Templates Configuration for a Tenant
app.get("/api/templates", async (req, res) => {
  const { pharmacy_id } = req.query;
  if (!pharmacy_id) {
    return res.status(400).json({ error: "Missing pharmacy_id" });
  }

  try {
    const tMap = await getTemplates(pharmacy_id as string);
    res.json(tMap);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update templates
app.post("/api/templates", async (req, res) => {
  const { pharmacy_id, templates } = req.body;
  if (!pharmacy_id || !templates) {
    return res.status(400).json({ error: "Missing pharmacy_id or templates data" });
  }

  try {
    await updateTemplates(pharmacy_id, templates);
    res.json({ success: true, message: "Templates updated successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Update global system configs
app.get("/api/config", (req, res) => {
  const db = readLocalDB();
  res.json(db.config || { whatsapp_enabled: true, sms_enabled: true });
});

app.post("/api/config", (req, res) => {
  const db = readLocalDB();
  db.config = {
    ...db.config,
    ...req.body
  };
  writeLocalDB(db);
  res.json({ success: true, config: db.config });
});

// 9. Personalize Reminder message via Gemini 1.5/2.0 Flash
app.post("/api/gemini/personalize", async (req, res) => {
  const { patient_name, condition, med_name, next_refill_date, language, pharmacy_name } = req.body;

  if (!patient_name || !condition || !med_name || !next_refill_date) {
    return res.status(400).json({ error: "Missing required personalization details." });
  }

  const ai = getGeminiClient();
  const selectedLanguage = language || "English";
  const pName = pharmacy_name || "Community Pharmacy";

  if (!ai) {
    // Fallbacks
    let localizedTxt = "";
    if (selectedLanguage === "Luganda") {
      localizedTxt = `Gyebaleko ${patient_name}, twetegereza eddagala lyo erya ${med_name} erya ${condition} erigenda okuggwaako nga ${next_refill_date}. Sembera ku ${pName} omukole refill. Webale!`;
    } else if (selectedLanguage === "Swahili") {
      localizedTxt = `Hujambo ${patient_name}, tunajali afya yako. Dawa yako ya ${med_name} ya ugonjwa wa ${condition} itaisha tarehe ${next_refill_date}. Tafadhali fika ${pName} upate dozi mpya. Afya kwanza!`;
    } else {
      localizedTxt = `Dear ${patient_name}, friendly reminder from ${pName}. Your chronic medicine ${med_name} is due for refill on ${next_refill_date}. Please stop by to collect your packet soon.`;
    }
    return res.json({
      message: localizedTxt,
      source: "local-fallback",
      hasKey: false
    });
  }

  try {
    const prompt = `Write an empathetic, gentle pharmacy medication refill notification message for a patient in East Africa.
    
    Details:
    - Patient Name: ${patient_name}
    - Chronic Condition: ${condition}
    - Medication: ${med_name}
    - Refill Date: ${next_refill_date}
    - Pharmacy: ${pName}
    - Desired Language: ${selectedLanguage} (must be strictly in this language, keeping clinical terms like medication name correct)
    
    Guidelines:
    - If the condition is HIV/ARVs, do NOT mention the condition directly, instead refer to it respectfully as "wellness package" or "routine therapy" to protect privacy.
    - If Hypertension or Diabetes, refer to it encouragingly.
    - Tone must be supportive and clear.
    - Keep it concise, suitable for WhatsApp or SMS (no longer than 2.5 sentences).
    - Do not use markdown (bolding with single * is okay for WhatsApp like *healthy*).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7
      }
    });

    const aiText = response.text || "Fallback message generation.";
    res.json({
      message: aiText.trim(),
      source: "gemini-2.5-flash",
      hasKey: true
    });
  } catch (err) {
    console.error("Gemini personalization error", err);
    res.json({
      message: `Hello ${patient_name}, friendly reminder from ${pName}. Your chronic medication ${med_name} is running out on ${next_refill_date}. Please stop by.`,
      source: "error-fallback",
      error: String(err)
    });
  }
});

// ==========================================
// PATIENT ENGAGEMENT HUB ENDPOINTS
// ==========================================

// 1. Patient Feedback Routes
app.get("/api/feedback", async (req, res) => {
  const pharmacy_id = req.query.pharmacy_id as string;
  if (!pharmacy_id) {
    return res.status(400).json({ error: "Missing pharmacy_id parameter" });
  }
  try {
    const list = await getFeedback(pharmacy_id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/feedback", async (req, res) => {
  const { patient_id, rating, comment, category } = req.body;
  if (!patient_id || !rating || !comment) {
    return res.status(400).json({ error: "Patient ID, rating and comment are required." });
  }
  try {
    const freshFeedback = await createFeedback({ patient_id, rating, comment, category });
    res.json({ success: true, feedback: freshFeedback });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Patient Progress Monitoring Routes
app.get("/api/progress-metrics", async (req, res) => {
  const patient_id = req.query.patient_id as string;
  const pharmacy_id = req.query.pharmacy_id as string;
  
  try {
    const list = await getProgressMetrics(patient_id, pharmacy_id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/progress-metrics", async (req, res) => {
  const { patient_id, systolic_bp, diastolic_bp, blood_sugar, sugar_type, wellness_level, symptoms } = req.body;
  if (!patient_id || !wellness_level) {
    return res.status(400).json({ error: "Patient ID and wellness level are required." });
  }
  try {
    const freshMetric = await createProgressMetric({
      patient_id,
      systolic_bp,
      diastolic_bp,
      blood_sugar,
      sugar_type,
      wellness_level,
      symptoms
    });
    res.json({ success: true, metric: freshMetric });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Appointment Booking Routes
app.get("/api/appointments", async (req, res) => {
  const pharmacy_id = req.query.pharmacy_id as string;
  const patient_id = req.query.patient_id as string;
  if (!pharmacy_id) {
    return res.status(400).json({ error: "Missing pharmacy_id parameter" });
  }
  try {
    const list = await getAppointments(pharmacy_id, patient_id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { patient_id, doctor_name, appointment_date, reason } = req.body;
  if (!patient_id || !doctor_name || !appointment_date || !reason) {
    return res.status(400).json({ error: "Patient ID, clinician name, appointment date and reason are required." });
  }
  try {
    const freshAppointment = await createAppointment({
      patient_id,
      doctor_name,
      appointment_date,
      reason
    });
    res.json({ success: true, appointment: freshAppointment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/appointments/:appointment_id", async (req, res) => {
  const { appointment_id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Missing status parameter" });
  }
  try {
    const updated = await updateAppointmentStatus(appointment_id, status);
    res.json({ success: true, appointment: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Doctor-Patient Consultations Routes
app.get("/api/consultations", async (req, res) => {
  const pharmacy_id = req.query.pharmacy_id as string;
  const patient_id = req.query.patient_id as string;
  if (!pharmacy_id) {
    return res.status(400).json({ error: "Missing pharmacy_id parameter" });
  }
  try {
    const list = await getConsultations(pharmacy_id, patient_id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/consultations", async (req, res) => {
  const { patient_id, question } = req.body;
  if (!patient_id || !question) {
    return res.status(400).json({ error: "Patient ID and question are required." });
  }
  try {
    const freshConsultation = await createConsultation({ patient_id, question });
    res.json({ success: true, consultation: freshConsultation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/consultations/:consultation_id/answer", async (req, res) => {
  const { consultation_id } = req.params;
  const { answer } = req.body;
  if (!answer) {
    return res.status(400).json({ error: "Answer text is required." });
  }
  try {
    const updated = await answerConsultation(consultation_id, answer);
    res.json({ success: true, consultation: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Clinician Drafting Assistance Route using Gemini
app.post("/api/gemini/consult-draft", async (req, res) => {
  const { question, patient_name, condition, medication_name } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Patient question is required for Gemini auto-drafting." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant clinical static smart rule engine mapping fallbacks based on question keywords
    let draft = "Dear patient, thank you for reaching out. Please make sure to follow your medication schedules precisely. ";
    const q = question.toLowerCase();
    if (q.includes("miss") || q.includes("forgot")) {
      draft = `Dear ${patient_name || "patient"}, if you missed a dose of ${medication_name || "your chronic medication"}, take it as soon as you remember. However, if it is nearly time for your next scheduled dose, skip the missed dose and resume your regular timing. Do NOT double the dose to catch up. Please stop by the pharmacy if you experience any unexpected symptoms.`;
    } else if (q.includes("side effect") || q.includes("dizzy") || q.includes("nausea")) {
      draft = `Dear ${patient_name || "patient"}, regarding the symptoms you explained, some initial side effects like mild dizziness can occur when initiating ${medication_name || "treatment"} for ${condition || "your chronic condition"}. We recommend sitting down or standing up slowly. Please monitor your levels closely, and if this persists for more than 3-5 days, let Dr. Sarah know so we can review the dosage.`;
    } else if (q.includes("alcohol") || q.includes("drink")) {
      draft = `Dear ${patient_name || "patient"}, we advise avoiding or strictly limiting alcohol while taking ${medication_name || "your medicine"}. Alcohol can interact severely, potentially causing blood pressure drops or altering efficacy. Let's arrange a brief clinical check-in to discuss this safely.`;
    } else {
      draft = `Dear ${patient_name || "patient"}, thank you for your query regarding ${medication_name || "your medication"}. This is logged for clinical review. We advise seeking immediate attention if symptoms are acute, or visiting our pharmacy counter to explore adjustments. Stay healthy!`;
    }

    return res.json({
      draft: draft,
      source: "local-rule-engine",
      hasKey: false
    });
  }

  try {
    const prompt = `You are an expert AI clinical drafting assistant helping a licensed pharmacist/doctor draft a response to a patient in East Africa.
    
    Patient Details:
    - Name: ${patient_name || "Patient"}
    - Condition: ${condition || "Chronic disease"}
    - Medication: ${medication_name || "Therapy"}
    - Patient's Question: "${question}"
    
    Instructions:
    1. Write a professional, empathetic, and clinically safe DRAFT reply on behalf of the medical officer.
    2. Suggest concrete advice (e.g. if missed dose, standard precautions; if side effect, monitoring guidelines).
    3. Include a friendly reminder to stay faithful to wellness goals.
    4. Keep it concise (no more than 3 sentences).
    5. Start direct with 'Dear [Name], ...'
    6. Do not include markdown formatting or legal meta headers.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2
      }
    });

    res.json({
      draft: (response.text || "").trim(),
      source: "gemini-2.5-flash",
      hasKey: true
    });
  } catch (err: any) {
    console.error("Gemini draft error:", err);
    res.json({
      draft: `Dear patient, thank you for consulting us. Your question regarding your medication has been received. Please consult one of our officers at Kampala Community Pharmacy for direct clinical advice.`,
      source: "error-fallback",
      error: err.message
    });
  }
});


// 10. Automated Scheduler Execution Simulator (8 AM Scheduler)
// Handled directly or by proxying to the Supabase Edge Function if fully configured!
app.post("/api/trigger-scheduler", async (req, res) => {
  const { pharmacy_id, simulation_date } = req.body;
  if (!pharmacy_id) {
    return res.status(400).json({ error: "Missing pharmacy_id" });
  }

  const sb = getSupabaseClient();
  const dbStatus = await checkConnectionStatus();

  // If Supabase is fully connected, let's trigger the real edge function or locally calculate on Supabase records!
  if (sb && dbStatus.connected) {
    console.log("Triggering 8 AM Scheduler directly on Supabase dataset...");
    // Let's run a fetch to our local Edge Function mock or real endpoint if they prefer!
    // Rather than crashing if the edge function url isn't deployed, we can execute the scheduler logic directly here
    // using Supabase tables! This is exceptionally clever and ensures immediate out-of-the-box working.
    try {
      const simDate = simulation_date ? new Date(simulation_date) : new Date();
      simDate.setHours(8, 0, 0, 0);

      const { data: pharmacy, error: pharmErr } = await sb.from("pharmacies").select("*").eq("pharmacy_id", pharmacy_id).single();
      if (pharmErr || !pharmacy) {
        return res.status(404).json({ error: "Pharmacy not found in Supabase tables." });
      }

      const { data: activePatients, error: patErr } = await sb
        .from("patients")
        .select("*, medications(*)")
        .eq("pharmacy_id", pharmacy_id)
        .eq("status", "Active");

      if (patErr) throw patErr;

      const { data: pTemplate, error: tErr } = await sb.from("templates").select("*").eq("pharmacy_id", pharmacy_id).single();
      const templates = pTemplate ? {
        "Hypertension": pTemplate.hypertension,
        "Diabetes": pTemplate.diabetes,
        "HIV/ARVs": pTemplate.hiv_arvs,
        "General": pTemplate.general
      } : {
        "Hypertension": "Hello {patient_name}, refill of {med_name} due soon.",
        "Diabetes": "Hello {patient_name}, your {med_name} is running low.",
        "HIV/ARVs": "Hello {patient_name}, refill package for {med_name} is ready.",
        "General": "Hello {patient_name}, medication refill due on {next_refill_date}."
      };

      const outboxes: any[] = [];
      let skippedCount = 0;

      for (const p of activePatients || []) {
        const med = p.medications?.[0];
        if (!med) continue;

        const dueDate = new Date(med.next_refill_date);
        dueDate.setHours(8, 0, 0, 0);

        const diffTime = dueDate.getTime() - simDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        let qualifies = false;
        let categoryText = "";

        if (diffDays === 7) { qualifies = true; categoryText = "7 days until refill alert"; }
        else if (diffDays === 3) { qualifies = true; categoryText = "3 days until refill alert"; }
        else if (diffDays === 0) { qualifies = true; categoryText = "Due Today alert"; }
        else if (diffDays < 0 && diffDays >= -5) { qualifies = true; categoryText = `${Math.abs(diffDays)} days OVERDUE alert`; }

        if (!qualifies) continue;

        const dateStr = simDate.toISOString().split("T")[0];
        const { data: dupMatches } = await sb
          .from("reminders")
          .select("reminder_id")
          .eq("patient_id", p.patient_id)
          .eq("medication_id", med.medication_id)
          .gte("reminder_date", `${dateStr}T00:00:00Z`)
          .lte("reminder_date", `${dateStr}T23:59:59Z`);

        if (dupMatches && dupMatches.length > 0) {
          skippedCount++;
          continue;
        }

        const template = templates[p.chronic_condition] || templates.General || "Hello {patient_name}, medication {med_name} refill alert at {pharmacy_name}.";
        const rawMsg = template
          .replace(/{patient_name}/g, p.full_name)
          .replace(/{pharmacy_name}/g, pharmacy.pharmacy_name)
          .replace(/{med_name}/g, med.medication_name)
          .replace(/{next_refill_date}/g, med.next_refill_date.split("T")[0]);

        const channels = p.preferred_channel === "Both" ? ["WhatsApp", "SMS"] : [p.preferred_channel];

        for (const channel of channels) {
          const digits = p.phone_number.replace(/\D/g, '');
          const isFailedMock = digits.length < 8;

          // Perform real dispatch requests if configs are active!
          try {
            if (channel === "WhatsApp" && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
              const cleanPhone = p.phone_number.replace(/\+/g, "").trim();
              await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  to: cleanPhone,
                  type: "text",
                  text: { body: rawMsg }
                })
              });
            } else if (channel === "SMS") {
              const username = process.env.AFRICASTALKING_USERNAME;
              const apiKey = process.env.AFRICASTALKING_API_KEY;
              if (username && apiKey) {
                const fData = new URLSearchParams();
                fData.append("username", username);
                fData.append("to", p.phone_number);
                fData.append("message", rawMsg);

                await fetch("https://api.africastalking.com/version1/messaging", {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    apiKey: apiKey
                  },
                  body: fData
                });
              }
            }
          } catch (e) {
            console.error("Real dispatch error:", e);
          }

          const reminderObj = {
            reminder_id: `rem-sb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            patient_id: p.patient_id,
            medication_id: med.medication_id,
            reminder_date: simDate.toISOString(),
            channel,
            status: isFailedMock ? "Failed" : "Sent",
            message: rawMsg,
            sent_at: new Date().toISOString(),
            category: categoryText
          };

          await sb.from("reminders").insert(reminderObj);
          outboxes.push({
            ...reminderObj,
            patient_name: p.full_name,
            phone: p.phone_number
          });
        }
      }

      return res.json({
        success: true,
        source: "supabase-live-eval",
        simulation_run_at: simDate.toISOString(),
        reminders_sent_count: outboxes.filter(r => r.status === "Sent").length,
        reminders_failed_count: outboxes.filter(r => r.status === "Failed").length,
        skipped_duplicates_count: skippedCount,
        details: outboxes.map(o => ({
          reminder_id: o.reminder_id,
          patient_name: o.patient_name,
          phone: o.phone,
          channel: o.channel,
          status: o.status,
          text: o.message,
          type: o.category
        }))
      });
    } catch (err: any) {
      console.error("Evaluation runtime failed, failing back beautifully", err);
    }
  }

  // Backup Local Fallback Implementation (fully self-contained)
  const db = readLocalDB();
  const pharmacy = db.pharmacies.find((ph: any) => ph.pharmacy_id === pharmacy_id);
  if (!pharmacy) {
    return res.status(404).json({ error: "Pharmacy not found in local records." });
  }

  const simDate = simulation_date ? new Date(simulation_date) : new Date();
  simDate.setHours(8, 0, 0, 0);

  const matchedPatients = db.patients.filter((p: any) => p.pharmacy_id === pharmacy_id && p.status === "Active");
  const pharmacyTemplates = db.templates?.[pharmacy_id] || {
    "Hypertension": "Hello {patient_name}, refill of {med_name} due soon.",
    "Diabetes": "Hello {patient_name}, your {med_name} is running low.",
    "HIV/ARVs": "Hello {patient_name}, refill package for {med_name} is ready.",
    "General": "Hello {patient_name}, medication refill due on {next_refill_date}."
  };

  const generatedReminders: any[] = [];
  let skippedDuplicates = 0;

  for (const patient of matchedPatients) {
    const med = db.medications.find((m: any) => m.patient_id === patient.patient_id);
    if (!med) continue;

    const duedate = new Date(med.next_refill_date);
    duedate.setHours(8, 0, 0, 0);

    const diffTime = duedate.getTime() - simDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let qualifies = false;
    let categoryText = "";

    if (diffDays === 7) { qualifies = true; categoryText = "7 days until refill alert"; }
    else if (diffDays === 3) { qualifies = true; categoryText = "3 days until refill alert"; }
    else if (diffDays === 0) { qualifies = true; categoryText = "Due Today alert"; }
    else if (diffDays < 0 && diffDays >= -5) { qualifies = true; categoryText = `${Math.abs(diffDays)} days OVERDUE alert`; }

    if (qualifies) {
      const dateStr = simDate.toISOString().split("T")[0];
      const isDuplicate = db.reminders.some((r: any) => 
        r.patient_id === patient.patient_id && 
        r.medication_id === med.medication_id &&
        r.reminder_date.startsWith(dateStr)
      );

      if (isDuplicate) {
        skippedDuplicates++;
        continue;
      }

      let template = pharmacyTemplates[patient.chronic_condition] || pharmacyTemplates.General || "Hello {patient_name}, medication {med_name} refill alert at {pharmacy_name}.";
      let rawMessage = template
        .replace(/{patient_name}/g, patient.full_name)
        .replace(/{pharmacy_name}/g, pharmacy.pharmacy_name)
        .replace(/{med_name}/g, med.medication_name)
        .replace(/{next_refill_date}/g, med.next_refill_date.split("T")[0]);

      const channels: ('WhatsApp' | 'SMS')[] = patient.preferred_channel === "Both" ? ["WhatsApp", "SMS"] : [patient.preferred_channel];

      for (const channel of channels) {
        const digits = patient.phone_number.replace(/\D/g, '');
        const isFailedMock = digits.length < 8;

        const reminder = {
          reminder_id: `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          patient_id: patient.patient_id,
          medication_id: med.medication_id,
          reminder_date: simDate.toISOString(),
          channel,
          status: isFailedMock ? "Failed" : "Sent",
          message: rawMessage,
          sent_at: new Date().toISOString(),
          category: categoryText
        };

        db.reminders.push(reminder);
        generatedReminders.push(reminder);
      }
    }
  }

  writeLocalDB(db);

  res.json({
    success: true,
    source: "local-eval-fallback",
    simulation_run_at: simDate.toISOString(),
    reminders_sent_count: generatedReminders.filter(r => r.status === "Sent").length,
    reminders_failed_count: generatedReminders.filter(r => r.status === "Failed").length,
    skipped_duplicates_count: skippedDuplicates,
    details: generatedReminders.map(r => {
      const pObj = db.patients.find((p: any) => p.patient_id === r.patient_id);
      return {
        reminder_id: r.reminder_id,
        patient_name: pObj?.full_name,
        phone: pObj?.phone_number,
        channel: r.channel,
        status: r.status,
        text: r.message,
        type: r.category
      };
    })
  });
});

// ==========================================
// ADMIN CONTROL PANEL ENDPOINTS
// ==========================================

// 1. Get Global Platform Analytics & Entity Registers
app.get("/api/admin/stats", async (req, res) => {
  try {
    const sb = getSupabaseClient();
    const dbStatus = await checkConnectionStatus();
    const isSupabase = !!sb && dbStatus.connected;
    
    let pharmaciesList: any[] = [];
    let patientsList: any[] = [];
    let remindersList: any[] = [];
    let feedbackList: any[] = [];
    let appointmentsList: any[] = [];
    let usersList: any[] = [];

    if (isSupabase) {
      try {
        const { data: ph } = await sb.from("pharmacies").select("*");
        pharmaciesList = ph || [];
        const { data: pa } = await sb.from("patients").select("*");
        patientsList = pa || [];
        const { data: re } = await sb.from("reminders").select("*");
        remindersList = re || [];
        const { data: fb } = await sb.from("feedback").select("*");
        feedbackList = fb || [];
        const { data: ap } = await sb.from("appointments").select("*");
        appointmentsList = ap || [];
        
        // Supabase users fallback
        const db = readLocalDB();
        usersList = db.users || [];
      } catch (err) {
        console.warn("Falling back to local db on admin load error:", err);
        const db = readLocalDB();
        pharmaciesList = db.pharmacies || [];
        patientsList = db.patients || [];
        remindersList = db.reminders || [];
        feedbackList = db.feedback || [];
        appointmentsList = db.appointments || [];
        usersList = db.users || [];
      }
    } else {
      const db = readLocalDB();
      pharmaciesList = db.pharmacies || [];
      patientsList = db.patients || [];
      remindersList = db.reminders || [];
      feedbackList = db.feedback || [];
      appointmentsList = db.appointments || [];
      usersList = db.users || [];
    }

    // Compute Metrics dynamically
    const totalPharmacies = pharmaciesList.length;
    const totalPatients = patientsList.length;
    const totalReminders = remindersList.length;
    const totalFeedback = feedbackList.length;
    const totalAppointments = appointmentsList.length;

    const activePatients = patientsList.filter((p: any) => p.status === "Active").length;
    const inactivePatients = patientsList.filter((p: any) => p.status === "Inactive").length;

    const conditionCounts: Record<string, number> = {};
    patientsList.forEach((p: any) => {
      const cond = p.chronic_condition || "Other";
      conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
    });

    const averageRating = feedbackList.length > 0
      ? Number((feedbackList.reduce((acc: number, f: any) => acc + (f.rating || 0), 0) / feedbackList.length).toFixed(1))
      : 5.0;

    res.json({
      success: true,
      mode: isSupabase ? "Supabase Live" : "Local Sandbox Database",
      totalPharmacies,
      totalPatients,
      totalReminders,
      totalFeedback,
      totalAppointments,
      activePatients,
      inactivePatients,
      conditionCounts,
      averageRating,
      pharmacies: pharmaciesList,
      users: usersList
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// 2. Add New Pharmacy (Cross-Tenant Workspace Setup)
app.post("/api/admin/pharmacies", async (req, res) => {
  const { pharmacy_id, pharmacy_name, address, phone_number, color_theme } = req.body;
  if (!pharmacy_id || !pharmacy_name || !address || !phone_number) {
    return res.status(400).json({ error: "All pharmacy registration details are required." });
  }

  try {
    const rx = {
      pharmacy_id,
      pharmacy_name,
      address,
      phone_number,
      color_theme: color_theme || "teal",
      created_at: new Date().toISOString()
    };

    const db = readLocalDB();
    if (!db.pharmacies) db.pharmacies = [];
    const exists = db.pharmacies.some((p: any) => p.pharmacy_id === pharmacy_id);
    if (exists) {
      return res.status(400).json({ error: `Pharmacy ID '${pharmacy_id}' is already registered.` });
    }

    db.pharmacies.push(rx);
    
    // Auto-create blank custom templates for this new pharmacy
    if (!db.templates) db.templates = {};
    db.templates[pharmacy_id] = {
      "Hypertension": `Hello {patient_name}, private reminder from ${pharmacy_name}. Your {med_name} refill is due on {next_refill_date}.`,
      "Diabetes": `Hello {patient_name}, diabetes health support refill for {med_name} is due at ${pharmacy_name} on {next_refill_date}.`,
      "HIV/ARVs": `Dear {patient_name}, friendly health alert from ${pharmacy_name}. Refill package for {med_name} is ready for pickup.`,
      "General": `Hello {patient_name}, friendly refill message from ${pharmacy_name}. Your chronic medication {med_name} due {next_refill_date}.`
    };

    writeLocalDB(db);

    const sb = getSupabaseClient();
    const dbStatus = await checkConnectionStatus();
    if (sb && dbStatus.connected) {
      try {
        await sb.from("pharmacies").upsert(rx);
        await sb.from("templates").upsert({
          pharmacy_id,
          hypertension: db.templates[pharmacy_id]["Hypertension"],
          diabetes: db.templates[pharmacy_id]["Diabetes"],
          hiv_arvs: db.templates[pharmacy_id]["HIV/ARVs"],
          general: db.templates[pharmacy_id]["General"]
        }, { onConflict: "pharmacy_id" });
      } catch (err: any) {
        console.warn("Supabase synced error during pharmacy register:", err.message);
      }
    }

    res.json({ success: true, pharmacy: rx });
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// 3. Edit Pharmacy Details
app.put("/api/admin/pharmacies/:pharmacy_id", async (req, res) => {
  const { pharmacy_id } = req.params;
  const { pharmacy_name, address, phone_number, color_theme } = req.body;

  try {
    const db = readLocalDB();
    const index = (db.pharmacies || []).findIndex((p: any) => p.pharmacy_id === pharmacy_id);
    if (index === -1) {
      return res.status(404).json({ error: "Pharmacy workspace not found." });
    }

    db.pharmacies[index] = {
      ...db.pharmacies[index],
      pharmacy_name: pharmacy_name || db.pharmacies[index].pharmacy_name,
      address: address || db.pharmacies[index].address,
      phone_number: phone_number || db.pharmacies[index].phone_number,
      color_theme: color_theme || db.pharmacies[index].color_theme
    };

    writeLocalDB(db);

    const sb = getSupabaseClient();
    const dbStatus = await checkConnectionStatus();
    if (sb && dbStatus.connected) {
      try {
        await sb.from("pharmacies").update({
          pharmacy_name: db.pharmacies[index].pharmacy_name,
          address: db.pharmacies[index].address,
          phone_number: db.pharmacies[index].phone_number,
          color_theme: db.pharmacies[index].color_theme
        }).eq("pharmacy_id", pharmacy_id);
      } catch (err: any) {
        console.warn("Supabase update fail:", err.message);
      }
    }

    res.json({ success: true, pharmacy: db.pharmacies[index] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// 4. Delete Pharmacy Workspace
app.delete("/api/admin/pharmacies/:pharmacy_id", async (req, res) => {
  const { pharmacy_id } = req.params;

  try {
    const db = readLocalDB();
    db.pharmacies = (db.pharmacies || []).filter((p: any) => p.pharmacy_id !== pharmacy_id);
    
    // Cascade delete local patient records as well
    const patientsToDelete = (db.patients || [])
      .filter((p: any) => p.pharmacy_id === pharmacy_id)
      .map((p: any) => p.patient_id);

    db.patients = (db.patients || []).filter((p: any) => p.pharmacy_id !== pharmacy_id);
    db.medications = (db.medications || []).filter((m: any) => !patientsToDelete.includes(m.patient_id));
    db.reminders = (db.reminders || []).filter((r: any) => !patientsToDelete.includes(r.patient_id));
    
    if (db.templates) {
      delete db.templates[pharmacy_id];
    }

    writeLocalDB(db);

    const sb = getSupabaseClient();
    const dbStatus = await checkConnectionStatus();
    if (sb && dbStatus.connected) {
      try {
        await sb.from("pharmacies").delete().eq("pharmacy_id", pharmacy_id);
      } catch (err: any) {
        console.error("Supabase delete failed:", err.message);
      }
    }

    res.json({ success: true, message: `Pharmacy '${pharmacy_id}' was cascade-purged safely.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// 5. Manage User Role (Promote Roles)
app.post("/api/admin/users/role", async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role variables are required." });
  }

  try {
    const db = readLocalDB();
    if (!db.users) db.users = [];
    
    const index = db.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      db.users[index].role = role;
      writeLocalDB(db);
      return res.json({ success: true, user: db.users[index] });
    } else {
      const newUser = {
        user_id: `usr-${Date.now()}`,
        pharmacy_id: "pharm-001",
        full_name: email.split('@')[0],
        email: email,
        role: role,
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      writeLocalDB(db);
      return res.json({ success: true, user: newUser });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// ==========================================
// VITE OR STATIC FILE HANDLER
// ==========================================

async function startPlatform() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pharmacy Refill Bot server running on http://0.0.0.0:${PORT}`);
  });
}

startPlatform();
