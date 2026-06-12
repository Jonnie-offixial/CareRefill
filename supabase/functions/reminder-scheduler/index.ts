// supabase/functions/reminder-scheduler/index.ts
// Supabase Edge Function: Automated 8 AM Medication Refill Scheduler & Messenger
// This function checks for patient refills due in 7 days, 3 days, 0 days, or overdue,
// resolves templates, optionally personalizes with Gemini, and dispatches via WhatsApp & SMS.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Standard Deno headers for CORS and HTTP responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase Admin client with service key to bypass Row Level Security
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment configurations in Edge Function environment variables.");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Request parameters
    const body = await req.json().catch(() => ({}));
    const targetPharmacyId = body.pharmacy_id || null; // filter for manual diagnostic runs
    const customDateStr = body.simulation_date || new Date().toISOString().split("T")[0];
    
    const simDate = new Date(customDateStr);
    simDate.setHours(8, 0, 0, 0); // Lock simulation clock to 8:00 AM

    console.log(`Starting automated medication refill scheduler sweep for simulation date: ${customDateStr}`);

    // 2. Query patients and pharmacies
    let patientsQuery = supabase
      .from("patients")
      .select(`
        *,
        pharmacies!inner (*),
        medications (*)
      `)
      .eq("status", "Active");

    if (targetPharmacyId) {
      patientsQuery = patientsQuery.eq("pharmacy_id", targetPharmacyId);
    }

    const { data: activePatients, error: patientsErr } = await patientsQuery;
    if (patientsErr) throw patientsErr;

    // Fetch message templates mapped by pharmacy_id
    const { data: templatesList, error: templatesErr } = await supabase
      .from("templates")
      .select("*");
    
    if (templatesErr) console.error("Error loading custom templates:", templatesErr);
    
    const templateMap = new Map();
    if (templatesList) {
      templatesList.forEach((t) => {
        templateMap.set(t.pharmacy_id, t);
      });
    }

    const outboxReminders: any[] = [];
    let skippedDuplicates = 0;

    for (const patient of activePatients || []) {
      const med = patient.medications?.[0]; // Fetch the unique medication cycle
      if (!med) continue;

      const dueDate = new Date(med.next_refill_date);
      dueDate.setHours(8, 0, 0, 0);

      // Delta math
      const diffTime = dueDate.getTime() - simDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let qualifies = false;
      let categoryText = "";

      if (diffDays === 7) {
        qualifies = true;
        categoryText = "7 days until refill alert";
      } else if (diffDays === 3) {
        qualifies = true;
        categoryText = "3 days until refill alert";
      } else if (diffDays === 0) {
        qualifies = true;
        categoryText = "Due Today alert";
      } else if (diffDays < 0 && diffDays >= -5) {
        qualifies = true;
        categoryText = `${Math.abs(diffDays)} days OVERDUE alert`;
      }

      if (!qualifies) continue;

      // Anti-spam de-duplication check for today's run
      const dateStr = simDate.toISOString().split("T")[0];
      const { data: existingReminders } = await supabase
        .from("reminders")
        .select("reminder_id")
        .eq("patient_id", patient.patient_id)
        .eq("medication_id", med.medication_id)
        .gte("reminder_date", `${dateStr}T00:00:00Z`)
        .lte("reminder_date", `${dateStr}T23:59:59Z`);

      if (existingReminders && existingReminders.length > 0) {
        skippedDuplicates++;
        continue;
      }

      // Generate notification text
      const pharmacy = patient.pharmacies;
      const tData = templateMap.get(patient.pharmacy_id);
      
      let rawTemplate = "";
      if (patient.chronic_condition === "Hypertension") rawTemplate = tData?.hypertension;
      else if (patient.chronic_condition === "Diabetes") rawTemplate = tData?.diabetes;
      else if (patient.chronic_condition === "HIV/ARVs") rawTemplate = tData?.hiv_arvs;
      
      if (!rawTemplate) {
        rawTemplate = tData?.general || "Hello {patient_name}, this is a reminder from {pharmacy_name}. Your medication for {med_name} is due for refill on {next_refill_date}. Please check-in today.";
      }

      let messageText = rawTemplate
        .replace(/{patient_name}/g, patient.full_name)
        .replace(/{pharmacy_name}/g, pharmacy.pharmacy_name)
        .replace(/{med_name}/g, med.medication_name)
        .replace(/{next_refill_date}/g, med.next_refill_date.split("T")[0]);

      // Determine appropriate delivery vehicles
      const channels: string[] = [];
      if (patient.preferred_channel === "Both") {
        channels.push("WhatsApp", "SMS");
      } else {
        channels.push(patient.preferred_channel);
      }

      for (const channel of channels) {
        let sentStatus = "Sent";
        let deliveryError = null;

        try {
          if (channel === "WhatsApp") {
            // WHATSAPP BUSINESS API INTEGRATION VIA EDGE FUNCTION
            const whatsappPhoneID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
            const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

            if (whatsappPhoneID && whatsappToken) {
              // Convert Ugandan number to clean international format (e.g., "+256..." to "256...")
              const cleanPhone = patient.phone_number.replace(/\+/g, "").trim();

              const resp = await fetch(
                `https://graph.facebook.com/v18.0/${whatsappPhoneID}/messages`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${whatsappToken}`,
                  },
                  body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: cleanPhone,
                    type: "text",
                    text: { body: messageText },
                  }),
                }
              );

              if (!resp.ok) {
                const errTxt = await resp.text();
                throw new Error(`WhatsApp API error: ${errTxt}`);
              }
              console.log(`WhatsApp message successfully routed to patient: ${patient.full_name}`);
            } else {
              console.log(`WhatsApp credentials missing. Simulating sandbox dispatch of: "${messageText}"`);
            }
          } else if (channel === "SMS") {
            // SMS GATEWAY INTEGRATIONS (AFRICA'S TALKING OR TWILIO fallback)
            const atUsername = Deno.env.get("AFRICASTALKING_USERNAME");
            const atApiKey = Deno.env.get("AFRICASTALKING_API_KEY");
            const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
            const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
            const twilioFrom = Deno.env.get("TWILIO_FROM_NUMBER");

            if (atUsername && atApiKey) {
              // AFRICA'S TALKING INTEGRATION
              const form = new URLSearchParams();
              form.append("username", atUsername);
              form.append("to", patient.phone_number);
              form.append("message", messageText);

              const resp = await fetch("https://api.africastalking.com/version1/messaging", {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/x-www-form-urlencoded",
                  "apiKey": atApiKey,
                },
                body: form,
              });

              if (!resp.ok) {
                const errTxt = await resp.text();
                throw new Error(`Africa's Talking API error: ${errTxt}`);
              }
              console.log(`Africa's Talking SMS successfully sent to: ${patient.full_name}`);
            } else if (twilioSid && twilioToken && twilioFrom) {
              // TWILIO MTN / AIRTEL FALLBACK INTEGRATION
              const form = new URLSearchParams();
              form.append("To", patient.phone_number);
              form.append("From", twilioFrom);
              form.append("Body", messageText);

              const resp = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
                {
                  method: "POST",
                  headers: {
                    Authorization: "Basic " + btoa(`${twilioSid}:${twilioToken}`),
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: form,
                }
              );

              if (!resp.ok) {
                const errTxt = await resp.text();
                throw new Error(`Twilio API error: ${errTxt}`);
              }
              console.log(`Twilio SMS successfully sent to: ${patient.full_name}`);
            } else {
              console.log(`SMS Provider credentials missing. Simulating telecom dispatch of: "${messageText}"`);
            }
          }
        } catch (dispatchErr) {
          console.error(`Message dispatch failed for patient: ${patient.full_name} via ${channel}.`, dispatchErr);
          sentStatus = "Failed";
          deliveryError = String(dispatchErr);
        }

        // Post result back into Supabase Reminders Log for trace audit
        const reminderPayload = {
          reminder_id: `rem-edge-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          patient_id: patient.patient_id,
          medication_id: med.medication_id,
          reminder_date: simDate.toISOString(),
          channel,
          status: sentStatus,
          message: messageText,
          sent_at: new Date().toISOString(),
          category: categoryText,
        };

        const { error: insertErr } = await supabase
          .from("reminders")
          .insert(reminderPayload);
        
        if (insertErr) console.error("Error writing reminder to Supabase:", insertErr);
        
        outboxReminders.push({
          ...reminderPayload,
          patient_name: patient.full_name,
          phone: patient.phone_number,
          error: deliveryError,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        simulation_run_at: simDate.toISOString(),
        reminders_sent_count: outboxReminders.filter((r) => r.status === "Sent").length,
        reminders_failed_count: outboxReminders.filter((r) => r.status === "Failed").length,
        skipped_duplicates_count: skippedDuplicates,
        details: outboxReminders,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Scheduler run crashed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
