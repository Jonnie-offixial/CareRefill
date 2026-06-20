import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Palette, 
  Clock, 
  MessageSquare, 
  Smartphone, 
  Send, 
  Mail, 
  Shield, 
  Users, 
  Bell, 
  Globe, 
  Download, 
  Database, 
  CreditCard, 
  Calendar, 
  Award, 
  Sparkles, 
  Lock, 
  Settings, 
  Key, 
  FileCheck, 
  LockKeyhole, 
  Volume2, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  HeartHandshake, 
  Tv2, 
  Activity, 
  AlertTriangle,
  History,
  Eye,
  EyeOff,
  Terminal,
  RefreshCw,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface SettingsPanelProps {
  pharmacyId?: string;
  currentPharmacyName?: string;
  currentPhoneNumber?: string;
  currentAddress?: string;
  onBrandingSave?: (data: { name: string; phone: string; website: string; address: string; logoUrl?: string }) => void;
  showGlobalToast?: (msg: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

// Defining categories to group the 24 modules
type SettingSection = 
  | 'profile' | 'pharmacy_info' | 'branding' | 'reminders' | 'templates' 
  | 'channels' | 'whatsapp' | 'sms' | 'email' | 'security' | 'user_management'
  | 'patient_settings' | 'notifications' | 'appointment_settings' | 'loyalty'
  | 'inventory' | 'ai_settings' | 'language' | 'backup' | 'billing' 
  | 'audit_logs' | 'developer' | 'privacy' | 'super_admin';

interface Group {
  groupName: string;
  items: { id: SettingSection; label: string; icon: React.ComponentType<any> }[];
}

export default function SettingsPanel({ 
  pharmacyId = 'pharm-001', 
  currentPharmacyName = 'City Pharmacy Kampala',
  currentPhoneNumber = '+256 700 123 456',
  currentAddress = 'Plot 14, Kampala Road, Kampala',
  onBrandingSave,
  showGlobalToast
}: SettingsPanelProps) {
  
  const [activeSection, setActiveSection] = useState<SettingSection>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Helper inside Settings to toast or fallback to alert
  const triggerToast = (title: string, desc: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (showGlobalToast) {
      showGlobalToast(title, desc, type);
    } else {
      alert(`${title}: ${desc}`);
    }
  };

  // 1. Profile Settings State
  const [profName, setProfName] = useState(() => localStorage.getItem('cp_prof_name') || 'Dr. Sarah Mukasa');
  const [profEmail, setProfEmail] = useState(() => localStorage.getItem('cp_prof_email') || 'sarah.mukasa@citypharmacy.ug');
  const [profPhone, setProfPhone] = useState(() => localStorage.getItem('cp_prof_phone') || '+256 701 445588');
  const [profTwoFactor, setProfTwoFactor] = useState(() => localStorage.getItem('cp_prof_2fa') === 'true');
  const [profLang, setProfLang] = useState(() => localStorage.getItem('cp_prof_lang') || 'English');
  const [profTimezone, setProfTimezone] = useState(() => localStorage.getItem('cp_prof_tz') || 'Africa/Kampala (GMT+3)');
  const [profPasswordCurrent, setProfPasswordCurrent] = useState('');
  const [profPasswordNew, setProfPasswordNew] = useState('');

  // 2. Pharmacy Information Settings State
  const [pharmName, setPharmName] = useState(() => localStorage.getItem('cp_pharm_name') || currentPharmacyName);
  const [pharmLicense, setPharmLicense] = useState(() => localStorage.getItem('cp_pharm_license') || 'NDA/UG/CP/2026/0491');
  const [pharmAddress, setPharmAddress] = useState(() => localStorage.getItem('cp_pharm_address') || currentAddress);
  const [pharmCity, setPharmCity] = useState(() => localStorage.getItem('cp_pharm_city') || 'Kampala');
  const [pharmCountry, setPharmCountry] = useState(() => localStorage.getItem('cp_pharm_country') || 'Uganda');
  const [pharmWebsite, setPharmWebsite] = useState(() => localStorage.getItem('cp_pharm_web') || 'www.citypharmacy.ug');
  const [pharmEmail, setPharmEmail] = useState(() => localStorage.getItem('cp_pharm_email') || 'support@citypharmacy.ug');
  const [pharmPhone, setPharmPhone] = useState(() => localStorage.getItem('cp_pharm_phone') || currentPhoneNumber);

  // 3. Branding Settings State
  const [brandLogo, setBrandLogo] = useState(() => localStorage.getItem('cp_brand_logo') || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=120&auto=format&fit=crop&q=80');
  const [brandPrimary, setBrandPrimary] = useState(() => localStorage.getItem('cp_brand_primary') || '#10B981');
  const [brandSecondary, setBrandSecondary] = useState(() => localStorage.getItem('cp_brand_secondary') || '#064E3B');
  const [brandFooter, setBrandFooter] = useState(() => localStorage.getItem('cp_brand_footer') || 'Providing trusted clinical adherence support. WhatsApp Careline.');
  const [brandTwitter, setBrandTwitter] = useState(() => localStorage.getItem('cp_brand_tw') || 'https://twitter.com/citypharm_ug');
  const [brandWebsiteUrl, setBrandWebsiteUrl] = useState(() => localStorage.getItem('cp_brand_weburl') || 'https://citypharmacy.ug');

  // 4. Reminder Settings State
  const [remRefill7d, setRemRefill7d] = useState(true);
  const [remRefill3d, setRemRefill3d] = useState(true);
  const [remRefill1d, setRemRefill1d] = useState(true);
  const [remRefillSame, setRemRefillSame] = useState(false);
  const [remApt7d, setRemApt7d] = useState(false);
  const [remApt3d, setRemApt3d] = useState(true);
  const [remApt1d, setRemApt1d] = useState(true);
  const [remTime, setRemTime] = useState('08:00');

  // 5. Message Templates Settings State
  const [templateRefillText, setTemplateRefillText] = useState(() => localStorage.getItem('cp_tpl_refill') || 
`Hello {patient_name},

This is {pharmacy_name}.

Your chronic medication for {medication_name} is running low and due for refill on {next_refill_date}. 

Please reply with "YES" to confirm and auto-package your next container for immediate pick up or dispatch.`);

  const [templateAptText, setTemplateAptText] = useState(() => localStorage.getItem('cp_tpl_apt') || 
`Hello {patient_name},

This is {pharmacy_name}. This is a gentle reminder of your clinical consultation appointment booked for {next_refill_date}.

Reply with "CONFIRM" to lock in your care session with the doctor.`);

  const [templateThanksText, setTemplateThanksText] = useState(() => localStorage.getItem('cp_tpl_thanks') || 
`Thank you {patient_name}! 

Your medication refill for {medication_name} is successfully processed at {pharmacy_name}. Our clinician team is packaging your dosage now.`);

  const [templateFollowText, setTemplateFollowText] = useState(() => localStorage.getItem('cp_tpl_follow') || 
`Hello {patient_name},

We noticed you missed your refill date for {medication_name}. Adherence is essential to stabilize your stats. 

Reply with "HELP" to speak directly with our clinical counseling support desk.`);

  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<'refill' | 'apt' | 'thanks' | 'follow'>('refill');

  // 6. Communication Settings Channels State
  const [chanWhatsApp, setChanWhatsApp] = useState(true);
  const [chanSMS, setChanSMS] = useState(true);
  const [chanEmail, setChanEmail] = useState(false);
  const [chanVoice, setChanVoice] = useState(false);
  const [chanDefault, setChanDefault] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');

  // 7. WhatsApp Integration Settings State
  const [waPhoneId, setWaPhoneId] = useState(() => localStorage.getItem('cp_wa_phone_id') || '109848520334812');
  const [waToken, setWaToken] = useState(() => localStorage.getItem('cp_wa_token') || 'EAAG3k0rSZB00BAOp9ZB8Ie... (Encrypted)');
  const [waVerifyToken, setWaVerifyToken] = useState(() => localStorage.getItem('cp_wa_verify') || 'care_refill_webhook_secret_ug');
  const [waWebhookUrl, setWaWebhookUrl] = useState('https://carerefill.ug/api/v1/webhooks/whatsapp');
  const [waStatus, setWaStatus] = useState<'Connected' | 'Unconfigured'>('Connected');

  // 8. SMS Provider Settings State
  const [smsProvider, setSmsProvider] = useState<'AfricasTalking' | 'Twilio' | 'Infobip'>('AfricasTalking');
  const [smsApiKey, setSmsApiKey] = useState(() => localStorage.getItem('cp_sms_key') || 'at_sk_84dd0048e... (Encrypted)');
  const [smsSenderId, setSmsSenderId] = useState(() => localStorage.getItem('cp_sms_sender') || 'CARE_REFILL');
  const [smsUsername, setSmsUsername] = useState(() => localStorage.getItem('cp_sms_user') || 'citypharmacy_sms_admin');
  const [smsStatus, setSmsStatus] = useState<'Connected' | 'Disconnected'>('Connected');

  // 9. Email Settings State
  const [emailProvider, setEmailProvider] = useState<'Resend' | 'SendGrid' | 'SMTP'>('Resend');
  const [smtpHost, setSmtpHost] = useState('smtp.resend.com');
  const [smtpPort, setSmtpPort] = '465';
  const [smtpUser, setSmtpUser] = useState('resend_client_ug');
  const [smtpPass, setSmtpPass] = useState('re_93Fhdwkda...');

  // 10. Security Settings State
  const [secRecaptchaSite, setSecRecaptchaSite] = useState('6Ld_eSUpAAAAAO8F349Hdkf...');
  const [secRecaptchaSecret, setSecRecaptchaSecret] = useState('6Ld_eSUpAAAAAI823fhdkfj...');
  const [secTimeout, setSecTimeout] = useState('30');
  const [secDevices, setSecDevices] = useState([
    { id: 1, device: 'iPad Pro - Pharmacy Counter A', location: 'Kampala, Uganda', ip: '197.239.5.42', lastActive: 'Active Now' },
    { id: 2, device: 'Google Pixel 8 - Dr. Sarah Mobile', location: 'Arua, Uganda', ip: '197.243.12.88', lastActive: '2 hours ago' },
    { id: 3, device: 'MacBook Pro M3 - Owner Main Desk', location: 'Kampala, Uganda', ip: '197.239.5.101', lastActive: 'Yesterday' }
  ]);

  // 11. User Management State
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Dr. Sarah Mukasa', role: 'Pharmacy Owner', email: 'sarah.mukasa@citypharmacy.ug', status: 'Active' },
    { id: 2, name: 'Dr. Emmanuel Okot', role: 'Pharmacist', email: 'emmanuel.okot@citypharmacy.ug', status: 'Active' },
    { id: 3, name: 'Grace Nakimera', role: 'Nurse', email: 'grace.n@citypharmacy.ug', status: 'Active' },
    { id: 4, name: 'Peter Ssekandi', role: 'Receptionist', email: 'peter.s@citypharmacy.ug', status: 'Suspended' }
  ]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Pharmacy Owner' | 'Pharmacist' | 'Nurse' | 'Receptionist'>('Pharmacist');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  // 12. Patient Settings Defaults State
  const [chronicConditions, setChronicConditions] = useState<string[]>(['Hypertension', 'Diabetes', 'HIV/ARVs', 'Asthma']);
  const [newCustomCondition, setNewCustomCondition] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [defaultReminderChannel, setDefaultReminderChannel] = useState('WhatsApp');

  // 13. Notification Settings Alerts Toggle State
  const [notifReg, setNotifReg] = useState(true);
  const [notifFailed, setNotifFailed] = useState(true);
  const [notifOverdue, setNotifOverdue] = useState(true);
  const [notifLowStock, setNotifLowStock] = useState(true);
  const [notifSubExpiry, setNotifSubExpiry] = useState(false);
  const [notifMethodInApp, setNotifMethodInApp] = useState(true);
  const [notifMethodEmail, setNotifMethodEmail] = useState(true);
  const [notifMethodSMS, setNotifMethodSMS] = useState(false);

  // 14. Appointment Settings Duration & Working Hours
  const [aptDuration, setAptDuration] = useState<'15 minutes' | '30 minutes' | '1 hour'>('30 minutes');
  const [aptWorkingHoursStart, setAptWorkingHoursStart] = useState('08:00');
  const [aptWorkingHoursEnd, setAptWorkingHoursEnd] = useState('17:00');
  const [aptWorkingDays, setAptWorkingDays] = useState({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
  });

  // 15. Loyalty Program Settings State
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [loyaltyPointsPerRefill, setLoyaltyPointsPerRefill] = useState('10');
  const [loyaltyDiscountPercent, setLoyaltyDiscountPercent] = useState('5');
  const [loyaltyBonusPoints, setLoyaltyBonusPoints] = useState('50');
  const [loyaltyThreshold, setLoyaltyThreshold] = useState('100');

  // 16. Inventory Settings State
  const [invThreshold, setInvThreshold] = useState('35');
  const [invAutoAlerts, setInvAutoAlerts] = useState(true);
  const [invForecasting, setInvForecasting] = useState('Moving Average (90d)');
  const [invSupplier, setInvSupplier] = useState('Joint Medical Stores (JMS) Uganda');

  // 17. AI Settings State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiGenerateMessages, setAiGenerateMessages] = useState(true);
  const [aiPersonalization, setAiPersonalization] = useState<'Conservative' | 'Balanced' | 'Empathetic'>('Empathetic');
  const [aiRiskPrediction, setAiRiskPrediction] = useState(true);
  const [aiLanguagePref, setAiLanguagePref] = useState('Multiple (Luganda + English Mixed)');

  // 18. Language Settings State
  const [langEnglishEnabled, setLangEnglishEnabled] = useState(true);
  const [langLugandaEnabled, setLangLugandaEnabled] = useState(true);
  const [langSwahiliEnabled, setLangSwahiliEnabled] = useState(true);
  const [langFrenchEnabled, setLangFrenchEnabled] = useState(false);

  // 19. Backup and Restore State
  const [backupSchedule, setBackupSchedule] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  // 20. Subscription & Billing State
  const [billingPlan, setBillingPlan] = useState('Regional Chain Care');
  const [messagesSent, setMessagesSent] = useState(14840);
  const [messagesLimit, setMessagesLimit] = useState(30000);
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-0601', date: '2026-06-01', amount: 'UGX 180,000', status: 'PAID' },
    { id: 'INV-2026-0501', date: '2026-05-01', amount: 'UGX 180,000', status: 'PAID' },
    { id: 'INV-2026-0401', date: '2026-04-01', amount: 'UGX 180,000', status: 'PAID' }
  ]);

  // 21. Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { timestamp: '2026-06-20 12:35:12', user: 'Dr. Sarah Mukasa', action: 'Configured new WhatsApp integration Meta ID', ip: '197.239.5.42' },
    { timestamp: '2026-06-20 11:20:05', user: 'Dr. Emmanuel Okot', action: 'Updated medication stock forecasts for Atorvastatin', ip: '197.243.12.88' },
    { timestamp: '2026-06-20 09:14:48', user: 'System Chronometer', action: 'Automated 11 chronic adherence refill notifications dispatched', ip: '127.0.0.1' },
    { timestamp: '2026-06-19 17:40:22', user: 'Grace Nakimera', action: 'Logged patient outcome outcome - Missed Clinic review', ip: '197.239.5.43' },
    { timestamp: '2026-06-19 14:05:10', user: 'Dr. Sarah Mukasa', action: 'Modified message templates refill script variables', ip: '197.239.5.42' }
  ]);

  // 22. API and Developer Settings State
  const [devApiKey, setDevApiKey] = useState('cr_live_sec_749e00cd1ab44ef3381fa8b839ec9b02a9');
  const [showDevApiKey, setShowDevApiKey] = useState(false);
  const [devWebhookUrl, setDevWebhookUrl] = useState('https://partner-clinic.ug/api/refill-alerts');

  // 23. Privacy and Consent Settings State
  const [privacyConsentForms, setPrivacyConsentForms] = useState('Active HIPAA/GDPR Dual Consent - Revision June 2026');
  const [privacyDataRetentionYears, setPrivacyDataRetentionYears] = useState('5');
  const [privacyCaregiverPermissions, setPrivacyCaregiverPermissions] = useState(true);

  // 24. Super Admin State (for Platform Owner)
  const isSuperAdminEmail = 'viannejonny@gmail.com';
  const superAdminPharmacies = [
    { id: 'pharm-001', name: 'City Pharmacy Kampala Main', tenantsCount: 412, status: 'Active', revenue: 'UGX 1,850,000' },
    { id: 'pharm-002', name: 'Arua Care Clinic Branch', tenantsCount: 108, status: 'Active', revenue: 'UGX 780,000' },
    { id: 'pharm-003', name: 'Mbale Adherence District Center', tenantsCount: 220, status: 'Active', revenue: 'UGX 1,120,000' },
    { id: 'pharm-004', name: 'Gulu Northern Adherence Hub', tenantsCount: 85, status: 'SUSPENDED', revenue: 'UGX 0' }
  ];

  // Grouped Sidebar items representing all 24 Modules
  const sidebarGroups: Group[] = [
    {
      groupName: '1. ACCOUNT & PROFILE',
      items: [
        { id: 'profile', label: 'User Profile Settings', icon: User },
        { id: 'pharmacy_info', label: 'Pharmacy Information', icon: Building2 },
        { id: 'branding', label: 'Branding Settings', icon: Palette },
        { id: 'security', label: 'Security Controls', icon: Lock },
        { id: 'user_management', label: 'User & Staff Roles', icon: Users }
      ]
    },
    {
      groupName: '2. ADHERENCE WORKFLOWS',
      items: [
        { id: 'reminders', label: 'Reminder Schedules', icon: Clock },
        { id: 'templates', label: 'Message Templates', icon: MessageSquare },
        { id: 'channels', label: 'Communication Channels', icon: Smartphone },
        { id: 'patient_settings', label: 'Patient Preferences', icon: FileCheck },
        { id: 'appointment_settings', label: 'Appointment Rules', icon: Calendar }
      ]
    },
    {
      groupName: '3. HARDWARE & API CHANNELS',
      items: [
        { id: 'whatsapp', label: 'Meta WhatsApp API', icon: Send },
        { id: 'sms', label: 'SMS Provider Setup', icon: CellCheckIcon },
        { id: 'email', label: 'Email Server (SMTP)', icon: Mail },
        { id: 'ai_settings', label: 'Gemini AI Assistant', icon: Sparkles },
        { id: 'developer', label: 'Developer & Webhooks', icon: Key }
      ]
    },
    {
      groupName: '4. AUDITING & OPERATIONS',
      items: [
        { id: 'notifications', label: 'Admin Notifications', icon: Bell },
        { id: 'language', label: 'Language Dialects', icon: Globe },
        { id: 'backup', label: 'Backup & Restore', icon: Database },
        { id: 'billing', label: 'SaaS Plan & Invoices', icon: CreditCard },
        { id: 'loyalty', label: 'Patient Loyalty Rewards', icon: Award },
        { id: 'inventory', label: 'Inventory & stock thresholds', icon: Activity },
        { id: 'privacy', label: 'Privacy & GDPR Consent', icon: LockKeyhole },
        { id: 'audit_logs', label: 'Security Audit Logs', icon: History },
        { id: 'super_admin', label: 'Super Admin Portal', icon: Shield }
      ]
    }
  ];

  // Helper custom icon wrapper for SMS Provider fallback
  function CellCheckIcon(props: any) {
    return <Smartphone {...props} className="w-4 h-4 text-amber-500" />;
  }

  // Handle generalized save of active section preferences
  const handleSavePreferences = () => {
    // Save state fields individually based on current sub-tab to simulate enterprise db persistency
    if (activeSection === 'profile') {
      localStorage.setItem('cp_prof_name', profName);
      localStorage.setItem('cp_prof_email', profEmail);
      localStorage.setItem('cp_prof_phone', profPhone);
      localStorage.setItem('cp_prof_2fa', String(profTwoFactor));
      localStorage.setItem('cp_prof_lang', profLang);
      localStorage.setItem('cp_prof_tz', profTimezone);
    } else if (activeSection === 'pharmacy_info') {
      localStorage.setItem('cp_pharm_name', pharmName);
      localStorage.setItem('cp_pharm_license', pharmLicense);
      localStorage.setItem('cp_pharm_address', pharmAddress);
      localStorage.setItem('cp_pharm_city', pharmCity);
      localStorage.setItem('cp_pharm_country', pharmCountry);
      localStorage.setItem('cp_pharm_web', pharmWebsite);
      localStorage.setItem('cp_pharm_email', pharmEmail);
      localStorage.setItem('cp_pharm_phone', pharmPhone);
    } else if (activeSection === 'branding') {
      localStorage.setItem('cp_brand_logo', brandLogo);
      localStorage.setItem('cp_brand_primary', brandPrimary);
      localStorage.setItem('cp_brand_secondary', brandSecondary);
      localStorage.setItem('cp_brand_footer', brandFooter);
      localStorage.setItem('cp_brand_tw', brandTwitter);
      localStorage.setItem('cp_brand_weburl', brandWebsiteUrl);
      if (onBrandingSave) {
        onBrandingSave({ name: pharmName, phone: pharmPhone, website: pharmWebsite, address: pharmAddress, logoUrl: brandLogo });
      }
    } else if (activeSection === 'templates') {
      localStorage.setItem('cp_tpl_refill', templateRefillText);
      localStorage.setItem('cp_tpl_apt', templateAptText);
      localStorage.setItem('cp_tpl_thanks', templateThanksText);
      localStorage.setItem('cp_tpl_follow', templateFollowText);
    } else if (activeSection === 'whatsapp') {
      localStorage.setItem('cp_wa_phone_id', waPhoneId);
      localStorage.setItem('cp_wa_token', waToken);
      localStorage.setItem('cp_wa_verify', waVerifyToken);
    } else if (activeSection === 'sms') {
      localStorage.setItem('cp_sms_key', smsApiKey);
      localStorage.setItem('cp_sms_sender', smsSenderId);
      localStorage.setItem('cp_sms_user', smsUsername);
    }

    setSavedSuccess(true);
    triggerToast("Settings Saved Successfully", `Changes to the ${sidebarGroups.flatMap(g => g.items).find(i => i.id === activeSection)?.label || activeSection} module have been written to local persistent database memory.`, "success");
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Add customized staff user
  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) {
      triggerToast("Missing Inputs", "Please provide a valid staff name and clinical email address", "error");
      return;
    }
    const added = {
      id: staffList.length + 1,
      name: newStaffName,
      role: newStaffRole,
      email: newStaffEmail,
      status: 'Active'
    };
    setStaffList(prev => [...prev, added]);
    setNewStaffName('');
    setNewStaffEmail('');
    triggerToast("Staff Registered", `Successfully added ${newStaffName} as a ${newStaffRole} with automated auth credentials.`, "success");
  };

  // Toggle staff suspend state
  const toggleStaffStatus = (id: number) => {
    setStaffList(prev => prev.map(st => {
      if (st.id === id) {
        const nextStatus = st.status === 'Active' ? 'Suspended' : 'Active';
        return { ...st, status: nextStatus };
      }
      return st;
    }));
    triggerToast("Staff Clearance Updated", "Internal role clearance and workspace permission token successfully modified.", "info");
  };

  // Add custom chronic condition
  const handleAddCustomCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomCondition) return;
    if (chronicConditions.includes(newCustomCondition)) {
      triggerToast("Duplicate Condition", "This health condition protocol already exists in defaults.", "error");
      return;
    }
    setChronicConditions(prev => [...prev, newCustomCondition]);
    setNewCustomCondition('');
    triggerToast("Condition Logged", `Successfully registered custom chronic therapy track for ${newCustomCondition}.`, "success");
  };

  // Process test messaging flows
  const triggerTestSMSFlow = () => {
    triggerToast("SMS Transport Verified", `Dispatched test adherence SMS connection packet. Gateway status response code: 200 OK via ${smsProvider}.`, "success");
  };

  const triggerTestEmailFlow = () => {
    triggerToast("SMTP Relay Online", `Connection verified. Test welcome email sent successfully into clinical loop via port ${smtpPort}.`, "success");
  };

  const triggerBackupDownload = (format: 'json' | 'csv' | 'pdf') => {
    triggerToast("Generating Backup Export", `Compiling compiled workspace backup packet now. Your localized ${format.toUpperCase()} sheet download started successfully.`, "info");
  };

  // Dynamic template text replacement simulation for preview boxes
  const getDynamicTemplatePreview = () => {
    let rawText = '';
    if (selectedPreviewTemplate === 'refill') rawText = templateRefillText;
    else if (selectedPreviewTemplate === 'apt') rawText = templateAptText;
    else if (selectedPreviewTemplate === 'thanks') rawText = templateThanksText;
    else rawText = templateFollowText;

    return rawText
      .replace(/{patient_name}/g, 'Musoke Paul')
      .replace(/{pharmacy_name}/g, pharmName)
      .replace(/{medication_name}/g, 'Atorvastatin (Lipitor 20mg)')
      .replace(/{next_refill_date}/g, new Date(Date.now() + 7 * 86400000).toLocaleDateString());
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-xs font-sans max-w-7xl mx-auto text-left">
      
      {/* Upper Module Info Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-150 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 border rounded-2xl text-slate-800">
            <Settings className="w-6 h-6 text-[#84CC16]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Workspace Customization Hub</h3>
            <p className="text-xs text-gray-500 mt-1">
              Organized into 24 custom pharmacy modules. Tailor scheduling intervals, message templates, WhatsApp APIs, and security clearances.
            </p>
          </div>
        </div>
        
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 animate-pulse shrink-0">
            <Check className="w-4.5 h-4.5 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Primary Layout Splitter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: 24 Module Navigation Panel */}
        <div className="lg:col-span-4 bg-slate-50 border rounded-2xl p-4 space-y-5 max-h-[800px] overflow-y-auto font-sans text-xs scrollbar-thin">
          <div className="px-1 border-b pb-2">
            <h4 className="font-extrabold text-[#062c16] uppercase text-[11px] tracking-wider">Pharmacy Settings Menu</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Customize without technical knowledge</p>
          </div>

          {sidebarGroups.map((group, group_idx) => (
            <div key={group_idx} className="space-y-1">
              <div className="text-[10px] font-black tracking-wider text-slate-400 uppercase px-1 pb-1">
                {group.groupName}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const isSecuredSuperAdmin = item.id === 'super_admin';
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                        isActive 
                          ? 'bg-[#84CC16] text-white shadow-3xs' 
                          : isSecuredSuperAdmin
                            ? 'text-rose-600 bg-rose-50/50 hover:bg-rose-50 hover:text-rose-700'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isSecuredSuperAdmin ? 'text-rose-500' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Active Module Content Screen */}
        <div className="lg:col-span-8 bg-white border rounded-2xl p-6 shadow-3xs space-y-6 font-sans">
          
          <div className="border-b pb-3.5 mb-4 flex justify-between items-center">
            <div>
              <span className="text-[9px] bg-slate-100 font-extrabold text-slate-500 uppercase tracking-widest px-2.5 py-1 rounded-full inline-block">
                Module ID: {activeSection.toUpperCase()}
              </span>
              <h4 className="text-base font-black text-slate-800 mt-2.5">
                {sidebarGroups.flatMap(g => g.items).find(i => i.id === activeSection)?.label}
              </h4>
            </div>

            {/* Quick Master Save Button */}
            {activeSection !== 'super_admin' && activeSection !== 'audit_logs' && (
              <button
                type="button"
                onClick={handleSavePreferences}
                className="bg-[#062c16] hover:bg-emerald-900 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow-3xs"
              >
                <Save className="w-4 h-4" />
                <span>Save preferences</span>
              </button>
            )}
          </div>

          {/* 1. PROFILE SETTINGS */}
          {activeSection === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border mb-3">
                <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center font-extrabold text-[#71B20A] text-lg">
                  SM
                </div>
                <div>
                  <h5 className="font-bold text-slate-800">Dr. Sarah Mukasa</h5>
                  <p className="text-[11px] text-gray-400">Chief Clinical Adherence Pharmacist • Main Kampala Branch</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Full Name</label>
                  <input 
                    type="text" 
                    value={profName} 
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Email Address</label>
                  <input 
                    type="email" 
                    value={profEmail} 
                    onChange={(e) => setProfEmail(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Primary Phone Number</label>
                  <input 
                    type="text" 
                    value={profPhone} 
                    onChange={(e) => setProfPhone(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Time Zone Location</label>
                  <select 
                    value={profTimezone} 
                    onChange={(e) => setProfTimezone(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Africa/Kampala (GMT+3)">Africa/Kampala (GMT+3)</option>
                    <option value="Africa/Nairobi (GMT+3)">Africa/Nairobi (GMT+3)</option>
                    <option value="Africa/Kigali (GMT+2)">Africa/Kigali (GMT+2)</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2 border-t pt-3 mt-2">
                  <h5 className="font-bold text-slate-800 mb-2">Change Account Password</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="password" 
                      placeholder="Current password" 
                      value={profPasswordCurrent}
                      onChange={(e) => setProfPasswordCurrent(e.target.value)}
                      className="bg-white border rounded-xl px-3 py-2" 
                    />
                    <input 
                      type="password" 
                      placeholder="New password"
                      value={profPasswordNew}
                      onChange={(e) => setProfPasswordNew(e.target.value)}
                      className="bg-white border rounded-xl px-3 py-2" 
                    />
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2 bg-slate-50 p-3 rounded-xl flex items-center justify-between mt-2 border">
                  <div>
                    <p className="font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-gray-400">Secure logins via clinical one-time codes</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={profTwoFactor} 
                    onChange={(e) => setProfTwoFactor(e.target.checked)}
                    className="w-4 h-4 cursor-pointer text-[#84CC16]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. PHARMACY INFORMATION SETTINGS */}
          {activeSection === 'pharmacy_info' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Official Pharmacy Name</label>
                  <input 
                    type="text" 
                    value={pharmName} 
                    onChange={(e) => setPharmName(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">NDA License / Practice Number</label>
                  <input 
                    type="text" 
                    value={pharmLicense} 
                    onChange={(e) => setPharmLicense(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Physical Address Coordinates</label>
                  <input 
                    type="text" 
                    value={pharmAddress} 
                    onChange={(e) => setPharmAddress(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Official City / District</label>
                  <input 
                    type="text" 
                    value={pharmCity} 
                    onChange={(e) => setPharmCity(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Official Country</label>
                  <input 
                    type="text" 
                    value={pharmCountry} 
                    onChange={(e) => setPharmCountry(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Website Domain URL</label>
                  <input 
                    type="text" 
                    value={pharmWebsite} 
                    onChange={(e) => setPharmWebsite(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Support Clinical Email</label>
                  <input 
                    type="email" 
                    value={pharmEmail} 
                    onChange={(e) => setPharmEmail(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Support Hotline phone</label>
                  <input 
                    type="text" 
                    value={pharmPhone} 
                    onChange={(e) => setPharmPhone(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic">* Note: These details are automatically loaded into localized SMS and WhatsApp reminders dispatched to active patients.</p>
            </div>
          )}

          {/* 3. BRANDING SETTINGS */}
          {activeSection === 'branding' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-4">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Logo Image URL</label>
                  <input 
                    type="text" 
                    value={brandLogo} 
                    onChange={(e) => setBrandLogo(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Primary Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={brandPrimary} 
                      onChange={(e) => setBrandPrimary(e.target.value)}
                      className="w-8 h-8 cursor-pointer rounded border"
                    />
                    <span className="font-mono">{brandPrimary.toUpperCase()}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Secondary Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={brandSecondary} 
                      onChange={(e) => setBrandSecondary(e.target.value)}
                      className="w-8 h-8 cursor-pointer rounded border"
                    />
                    <span className="font-mono">{brandSecondary.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-550 font-bold">Patient Messaging Footer Message</label>
                <input 
                  type="text" 
                  value={brandFooter} 
                  onChange={(e) => setBrandFooter(e.target.value)}
                  placeholder="e.g. GreenCare Pharmacy, Kampala. +256 700 000000"
                  className="w-full bg-white border rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-550 font-bold">Social Media Links / Info</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Twitter Link" 
                    value={brandTwitter} 
                    onChange={(e) => setBrandTwitter(e.target.value)}
                    className="bg-white border rounded-xl p-2" 
                  />
                  <input 
                    type="text" 
                    placeholder="Website Link" 
                    value={brandWebsiteUrl} 
                    onChange={(e) => setBrandWebsiteUrl(e.target.value)}
                    className="bg-white border rounded-xl p-2" 
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-50 border rounded-2xl p-4 mt-3">
                <span className="text-[9px] uppercase font-black text-slate-400 block mb-2">Live WhatsApp Footer Preview</span>
                <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl text-slate-800 max-w-md">
                  <p className="text-xs">Hello Musoke Paul, your refill prescription is ready...</p>
                  <p className="text-[10px] text-[#84CC16] font-bold mt-2 pt-2 border-t font-mono">
                    🌿 {brandFooter}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. REMINDER SETTINGS */}
          {activeSection === 'reminders' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-3">
                <h5 className="font-bold text-slate-800">Refill Running Out Notification Schedule</h5>
                <p className="text-[11px] text-gray-400">Chronometer sweeps and triggers active refill prompts according to schedules:</p>
                
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 border rounded-2xl">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input type="checkbox" checked={remRefill7d} onChange={(e) => setRemRefill7d(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                    <span>7 Days Before Runout</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input type="checkbox" checked={remRefill3d} onChange={(e) => setRemRefill3d(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                    <span>3 Days Before Runout</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input type="checkbox" checked={remRefill1d} onChange={(e) => setRemRefill1d(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                    <span>1 Day Before Runout</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input type="checkbox" checked={remRefillSame} onChange={(e) => setRemRefillSame(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                    <span>Same Day Refill Due</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <h5 className="font-bold text-slate-800">Clinic Appointment Schedule Alerts</h5>
                <p className="text-[11px] text-gray-400">Keep patient-clinician appointments booked securely with matching triggers:</p>

                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 border rounded-2xl">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input type="checkbox" checked={remApt7d} onChange={(e) => setRemApt7d(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                    <span>7 Days Before</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input type="checkbox" checked={remApt3d} onChange={(e) => setRemApt3d(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                    <span>3 Days Before</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input type="checkbox" checked={remApt1d} onChange={(e) => setRemApt1d(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                    <span>1 Day Before</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <label className="block font-bold text-slate-800">Preferred Dispatches Delivery Time</label>
                <div className="flex items-center gap-3">
                  <select 
                    value={remTime} 
                    onChange={(e) => setRemTime(e.target.value)} 
                    className="bg-white border rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="08:00">08 AM (Recommended morning adherence sweep)</option>
                    <option value="12:00">12 PM (Mid-day pill check)</option>
                    <option value="18:00">06 PM (Evening adherence sweep)</option>
                    <option value="custom">Custom Time Setting</option>
                  </select>
                  {remTime === 'custom' && (
                    <input 
                      type="time" 
                      value="09:00" 
                      className="bg-white border rounded-xl px-3 py-1.2 font-mono" 
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. MESSAGE TEMPLATE SETTINGS */}
          {activeSection === 'templates' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border">
                {[
                  { id: 'refill', label: 'Refill Reminder' },
                  { id: 'apt', label: 'Appointment Reminder' },
                  { id: 'thanks', label: 'Thank-You Confirmation' },
                  { id: 'follow', label: 'Loss-to-Followup Triage' }
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedPreviewTemplate(tpl.id as any)}
                    className={`flex-1 text-center py-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      selectedPreviewTemplate === tpl.id ? 'bg-[#062c16] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-slate-600 font-bold">Edit Message Script Draft</label>
                {selectedPreviewTemplate === 'refill' && (
                  <textarea 
                    value={templateRefillText} 
                    onChange={(e) => setTemplateRefillText(e.target.value)}
                    rows={5}
                    className="w-full bg-white border rounded-xl p-3 font-mono text-[11px] focus:ring-1 focus:ring-[#84CC16]"
                  />
                )}
                {selectedPreviewTemplate === 'apt' && (
                  <textarea 
                    value={templateAptText} 
                    onChange={(e) => setTemplateAptText(e.target.value)}
                    rows={5}
                    className="w-full bg-white border rounded-xl p-3 font-mono text-[11px] focus:ring-1 focus:ring-[#84CC16]"
                  />
                )}
                {selectedPreviewTemplate === 'thanks' && (
                  <textarea 
                    value={templateThanksText} 
                    onChange={(e) => setTemplateThanksText(e.target.value)}
                    rows={5}
                    className="w-full bg-white border rounded-xl p-3 font-mono text-[11px] focus:ring-1 focus:ring-[#84CC16]"
                  />
                )}
                {selectedPreviewTemplate === 'follow' && (
                  <textarea 
                    value={templateFollowText} 
                    onChange={(e) => setTemplateFollowText(e.target.value)}
                    rows={5}
                    className="w-full bg-white border rounded-xl p-3 font-mono text-[11px] focus:ring-1 focus:ring-[#84CC16]"
                  />
                )}
              </div>

              {/* Script Variable Info */}
              <div className="bg-slate-50 border p-3.5 rounded-2xl space-y-1.5 font-sans leading-normal">
                <h6 className="font-bold text-slate-700 uppercase text-[9px] tracking-wider">Dynamic Parameters (Replacements Wrapper)</h6>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[#062c16]">
                  <span className="bg-white border px-2 py-0.5 rounded">{"{patient_name}"}</span>
                  <span className="bg-white border px-2 py-0.5 rounded">{"{pharmacy_name}"}</span>
                  <span className="bg-white border px-2 py-0.5 rounded">{"{medication_name}"}</span>
                  <span className="bg-white border px-2 py-0.5 rounded">{"{next_refill_date}"}</span>
                </div>
              </div>

              {/* Script Render Live Mockup Preview */}
              <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-4">
                <span className="text-[9px] font-black uppercase text-amber-700 block mb-2">Live Rendered Dispatch Preview</span>
                <div className="bg-white border p-3 rounded-xl whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-805">
                  {getDynamicTemplatePreview()}
                </div>
              </div>
            </div>
          )}

          {/* 6. COMMUNICATION CHANNELS */}
          {activeSection === 'channels' && (
            <div className="space-y-4 text-xs font-sans">
              <h5 className="font-bold text-slate-800">Supported Outbound Transport Channels</h5>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <div>
                      <p className="font-bold text-slate-800">WhatsApp Messaging Gateway</p>
                      <p className="text-[10px] text-gray-400">Meta two-way messaging protocol with templates</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={chanWhatsApp} onChange={(e) => setChanWhatsApp(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="font-bold text-slate-800">SMS Outbound Gateway</p>
                      <p className="text-[10px] text-gray-400">Direct cellular telecommunication carrier messaging</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={chanSMS} onChange={(e) => setChanSMS(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✉️</span>
                    <div>
                      <p className="font-bold text-slate-800">Clinical Email (SMTP)</p>
                      <p className="text-[10px] text-gray-400">Official prescriptions dispatch PDF logs</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={chanEmail} onChange={(e) => setChanEmail(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="font-bold text-slate-800">Automatic Voice / Robocalls</p>
                      <p className="text-[10px] text-gray-400">VoIP voice synthesis compliance alerts</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={chanVoice} onChange={(e) => setChanVoice(e.target.checked)} className="w-4 h-4 text-[#84CC16]" />
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <label className="block font-bold text-slate-800">Preferred Default Adherence Channel</label>
                <div className="flex items-center gap-3">
                  {['WhatsApp', 'SMS', 'Email'].map((ch) => (
                    <label key={ch} className="bg-slate-50 border px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer font-bold">
                      <input 
                        type="radio" 
                        name="defaultCh" 
                        value={ch} 
                        checked={chanDefault === ch} 
                        onChange={() => setChanDefault(ch as any)} 
                        className="text-[#84CC16]" 
                      />
                      <span>{ch}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. WHATSAPP INTEGRATION SETTINGS */}
          {activeSection === 'whatsapp' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-800">Meta Cloud API Status: {waStatus === 'Connected' ? 'CONNECTED ✓' : 'UNCONFIGURED ✗'}</p>
                  <p className="text-[10px] text-emerald-600 mt-1">Verified: Webhook subscriptions responding with verified meta validation tokens.</p>
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-500 bg-white px-2 py-1 rounded border">LATENCY: 42ms</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">WhatsApp Phone Number ID</label>
                  <input 
                    type="text" 
                    value={waPhoneId} 
                    onChange={(e) => setWaPhoneId(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Verify Webhook Token</label>
                  <input 
                    type="text" 
                    value={waVerifyToken} 
                    onChange={(e) => setWaVerifyToken(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="block text-slate-550 font-bold">System Meta Access Token (Permanent)</label>
                  <input 
                    type="password" 
                    value={waToken} 
                    onChange={(e) => setWaToken(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="block text-slate-550 font-bold">Outbound Listener Webhook URL (For Meta Verification)</label>
                  <div className="bg-slate-50 border p-3 rounded-xl font-mono text-[10px] text-slate-600">
                    {waWebhookUrl}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. SMS PROVIDER SETTINGS */}
          {activeSection === 'sms' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-3 gap-2">
                {(['AfricasTalking', 'Twilio', 'Infobip'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setSmsProvider(prov)}
                    className={`p-3 border rounded-xl text-center font-bold tracking-tight text-xs cursor-pointer ${
                      smsProvider === prov ? 'bg-[#062c16] text-white border-[#062c16]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {prov === 'AfricasTalking' ? "Africa's Talking" : prov}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">API Access Key</label>
                  <input 
                    type="password" 
                    value={smsApiKey} 
                    onChange={(e) => setSmsApiKey(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Outbound Sender ID (Alphanumeric)</label>
                  <input 
                    type="text" 
                    value={smsSenderId} 
                    onChange={(e) => setSmsSenderId(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="block text-slate-550 font-bold">SMS Username / Account SID</label>
                  <input 
                    type="text" 
                    value={smsUsername} 
                    onChange={(e) => setSmsUsername(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-700">SMS Transport Gateway Protocol</p>
                  <p className="text-[10px] text-gray-400">Provider link established. Outbound balances verified.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={triggerTestSMSFlow}
                    className="bg-[#84CC16] hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer"
                  >
                    Test Dispatch SMS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. EMAIL SETTINGS */}
          {activeSection === 'email' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-3 gap-2">
                {(['Resend', 'SendGrid', 'SMTP'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setEmailProvider(prov)}
                    className={`p-2 border rounded-xl text-center font-black ${
                      emailProvider === prov ? 'bg-[#062c16] text-white border-transparent' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">SMTP Relay Host</label>
                  <input 
                    type="text" 
                    value={smtpHost} 
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">SMTP Mail Port</label>
                  <input 
                    type="text" 
                    value={smtpPort} 
                    onChange={(e) => {}} 
                    disabled 
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-mono text-gray-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">SMTP Username Address</label>
                  <input 
                    type="text" 
                    value={smtpUser} 
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">SMTP Password / API Token</label>
                  <input 
                    type="password" 
                    value={smtpPass} 
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={triggerTestEmailFlow}
                className="w-full bg-[#84CC16] hover:bg-emerald-600 text-white font-black text-xs py-2 rounded-xl text-center cursor-pointer transition shadow-3xs uppercase"
              >
                Send Test Email Packet
              </button>
            </div>
          )}

          {/* 10. SECURITY SETTINGS */}
          {activeSection === 'security' && (
            <div className="space-y-4 text-xs font-sans">
              <h5 className="font-bold text-slate-800 border-b pb-1">Dual Auth & Security Config</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Google reCAPTCHA v3 Site Key</label>
                  <input 
                    type="text" 
                    value={secRecaptchaSite} 
                    onChange={(e) => setSecRecaptchaSite(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">reCAPTCHA Secret Key</label>
                  <input 
                    type="password" 
                    value={secRecaptchaSecret} 
                    onChange={(e) => setSecRecaptchaSecret(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="block text-slate-550 font-bold">Inactivity Session Timeout (Minutes)</label>
                  <select 
                    value={secTimeout} 
                    onChange={(e) => setSecTimeout(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="60">60 Minutes</option>
                    <option value="180">3 Hours</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between items-center mb-1">
                  <h6 className="font-bold text-slate-700">Active Account Sessions & Devices</h6>
                  <button 
                    onClick={() => triggerToast("Clearance Refreshed", "Logged out all auxiliary devices from City Pharmacy core server stream.", "info")}
                    className="text-[10px] text-rose-600 font-extrabold hover:underline"
                  >
                    Logout All Other Devices
                  </button>
                </div>
                <div className="space-y-2">
                  {secDevices.map((dev) => (
                    <div key={dev.id} className="bg-slate-50 border p-2.5 rounded-xl flex justify-between items-center text-[11px]">
                      <div>
                        <p className="font-bold text-slate-800">{dev.device}</p>
                        <p className="text-[10px] text-gray-400">{dev.location} • {dev.ip}</p>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 font-mono px-2 py-0.5 rounded border border-emerald-100 font-semibold">{dev.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 11. USER MANAGEMENT SETTINGS */}
          {activeSection === 'user_management' && (
            <div className="space-y-4 text-xs font-sans">
              <form onSubmit={handleAddNewStaff} className="bg-slate-50 border p-4 rounded-2xl space-y-3">
                <h5 className="font-bold text-slate-800 text-xs">Add New Staff / Adherence Clinician</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input 
                    type="text" 
                    placeholder="Full staff Name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="bg-white border rounded-xl p-2" 
                  />
                  <input 
                    type="email" 
                    placeholder="Clinical Email address" 
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="bg-white border rounded-xl p-2" 
                  />
                  <select 
                    value={newStaffRole} 
                    onChange={(e: any) => setNewStaffRole(e.target.value)}
                    className="bg-white border rounded-xl p-2 font-bold text-slate-700"
                  >
                    <option value="Pharmacy Owner">Pharmacy Owner</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>

                {/* Permissions Preview Checklist */}
                <div className="border-t pt-2 mt-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Default Role Authorization Tokens:</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> View patients</span>
                    <span className="flex items-center gap-0.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Edit medications</span>
                    <span className="flex items-center gap-0.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Send reminders</span>
                    <span className="flex items-center gap-0.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> View compliance metrics</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="bg-[#062c16] hover:bg-emerald-950 text-white text-xs font-bold px-4 py-2 rounded-xl mt-1 cursor-pointer"
                >
                  Confirm Staff Credentials
                </button>
              </form>

              <div className="space-y-2 pt-2">
                <h6 className="font-bold text-slate-800">Current Facility Practice Directory</h6>
                <div className="space-y-1.5">
                  {staffList.map((st) => (
                    <div key={st.id} className="bg-white border p-3 rounded-xl flex items-center justify-between text-xs font-sans">
                      <div>
                        <p className="font-extrabold text-slate-800">{st.name}</p>
                        <p className="text-[10px] text-gray-400">{st.role} • {st.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${
                          st.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>{st.status}</span>
                        <button
                          type="button"
                          onClick={() => toggleStaffStatus(st.id)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 border px-2.5 py-1 rounded-xl bg-slate-50 cursor-pointer"
                        >
                          {st.status === 'Active' ? 'Suspend' : 'Reinstate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 12. PATIENT SETTINGS */}
          {activeSection === 'patient_settings' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800">Managed Chronic Condition Profiles</h5>
                <p className="text-[11px] text-gray-400">Patients can be mapped to custom disease tracks for specialized automated AI guidance:</p>
                
                <div className="flex flex-wrap gap-2">
                  {chronicConditions.map((cond) => (
                    <span key={cond} className="bg-[#062c16]/5 text-[#062c16] font-bold border border-[#062c16]/15 rounded-full px-3.5 py-1 flex items-center gap-1">
                      <span>{cond}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (chronicConditions.length <= 2) {
                            triggerToast("Locked", "At least two standard profiles must remain active.", "error");
                            return;
                          }
                          setChronicConditions(prev => prev.filter(c => c !== cond));
                          triggerToast("Profile Dismantled", `Care track profile ${cond} has been removed.`, "info");
                        }} 
                        className="text-gray-400 hover:text-rose-600 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddCustomCondition} className="flex gap-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="e.g. Chronic Kidney Disease" 
                    value={newCustomCondition}
                    onChange={(e) => setNewCustomCondition(e.target.value)}
                    className="flex-grow bg-white border rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                  <button 
                    type="submit" 
                    className="bg-[#84CC16] hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-xl cursor-pointer"
                  >
                    Register Therapy track
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Defaults Default Adherence Language</label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#84CC16]"
                  >
                    <option value="English">English (United Kingdom)</option>
                    <option value="Luganda">Luganda (Luganda central)</option>
                    <option value="Swahili">Kiswahili (East Africa)</option>
                    <option value="French">French</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Default Reminder Channel</label>
                  <select
                    value={defaultReminderChannel}
                    onChange={(e) => setDefaultReminderChannel(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#84CC16]"
                  >
                    <option value="WhatsApp">WhatsApp Message Gateway</option>
                    <option value="SMS">SMS Gateway Direct</option>
                    <option value="Email">Email SMTP Delivery</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 13. NOTIFICATION SETTINGS */}
          {activeSection === 'notifications' && (
            <div className="space-y-4 text-xs font-sans">
              <h5 className="font-bold text-slate-800">Admin Practice Notifications</h5>
              <p className="text-[11px] text-gray-400">Specify exactly which clinical events trigger a real-time notification alert into the active clinician console:</p>

              <div className="space-y-2.5">
                {[
                  { state: notifReg, setSetter: setNotifReg, label: 'New Patient Enrollment Log', desc: 'When the sandbox simulation registers or logs a new patient profile' },
                  { state: notifFailed, setSetter: setNotifFailed, label: 'Adherence Dispatch Failures', desc: 'Alert if Twilio or Meta WhatsApp webhook reports a transport failure' },
                  { state: notifOverdue, setSetter: setNotifOverdue, label: 'Unconfirmed Overdue Refill Alarm', desc: 'Notify when a high-risk chronic patient crosses 48 hours overdue margin' },
                  { state: notifLowStock, setSetter: setNotifLowStock, label: 'Low Pharmacy stock threshold alarms', desc: 'Alert when available box counts drop below forecasting safety levels' }
                ].map((nt, idx) => (
                  <label key={idx} className="bg-slate-50 border p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition">
                    <div>
                      <p className="font-bold text-slate-800">{nt.label}</p>
                      <p className="text-[10px] text-gray-400">{nt.desc}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={nt.state} 
                      onChange={(e) => nt.setSetter(e.target.checked)} 
                      className="w-4 h-4 text-[#84CC16] accent-[#84CC16]"
                    />
                  </label>
                ))}
              </div>

              <div className="pt-3 border-t">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">My Dispatch Channels</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input type="checkbox" checked={notifMethodInApp} onChange={(e) => setNotifMethodInApp(e.target.checked)} className="text-[#84CC16]" />
                    In-App Console Alarms
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input type="checkbox" checked={notifMethodEmail} onChange={(e) => setNotifMethodEmail(e.target.checked)} className="text-[#84CC16]" />
                    Admin Email Digests
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input type="checkbox" checked={notifMethodSMS} onChange={(e) => setNotifMethodSMS(e.target.checked)} className="text-[#84CC16]" />
                    Urgent SMS Direct
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 14. APPOINTMENT SETTINGS */}
          {activeSection === 'appointment_settings' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Standard Appointment Slot Duration</label>
                  <select
                    value={aptDuration}
                    onChange={(e: any) => setAptDuration(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2"
                  >
                    <option value="15 minutes">15 minutes (Quick chronic check/refill)</option>
                    <option value="30 minutes">30 minutes (Standard consultation)</option>
                    <option value="1 hour">1 hour (Intense adherence review)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Assigned clinician default schedule</label>
                  <div className="flex gap-2">
                    <input 
                      type="time" 
                      value={aptWorkingHoursStart} 
                      onChange={(e) => setAptWorkingHoursStart(e.target.value)}
                      className="bg-white border rounded-xl px-2 py-1.5 font-mono text-[11px]" 
                    />
                    <span className="self-center">to</span>
                    <input 
                      type="time" 
                      value={aptWorkingHoursEnd} 
                      onChange={(e) => setAptWorkingHoursEnd(e.target.value)}
                      className="bg-white border rounded-xl px-2 py-1.5 font-mono text-[11px]" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <label className="block text-slate-550 font-bold mb-1">Working Operational Days</label>
                <div className="flex gap-2.5 flex-wrap">
                  {Object.entries(aptWorkingDays).map(([day, active]) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setAptWorkingDays(prev => ({ ...prev, [day]: !active }))}
                      className={`px-3 py-2 border rounded-xl text-xs font-bold transition cursor-pointer ${
                        active ? 'bg-[#062c16] text-white border-[#062c16]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {day} {active ? "✓" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 15. LOYALTY PROGRAM SETTINGS */}
          {activeSection === 'loyalty' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-slate-50 p-4 border rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Enable Adherence Patient Rewards Program</p>
                  <p className="text-[10px] text-gray-400">Award loyalty coins for timely adherence pickups to boost compliance rates.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={loyaltyEnabled} 
                  onChange={(e) => setLoyaltyEnabled(e.target.checked)}
                  className="w-4 h-4 cursor-pointer text-[#84CC16]"
                />
              </div>

              {loyaltyEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-bold">Standard Points Awarded (Per Timely Refill)</label>
                    <input 
                      type="number" 
                      value={loyaltyPointsPerRefill} 
                      onChange={(e) => setLoyaltyPointsPerRefill(e.target.value)}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-bold">Discount Percentage (Redeemed at 100 Points)</label>
                    <div className="flex items-center gap-1 bg-white border rounded-xl px-3 py-1.5">
                      <input 
                        type="number" 
                        value={loyaltyDiscountPercent} 
                        onChange={(e) => setLoyaltyDiscountPercent(e.target.value)}
                        className="w-full focus:outline-none font-bold text-slate-800"
                      />
                      <span className="font-bold text-slate-400">%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[#062c16] font-bold">Bonus points (Completed 90-Day Loop)</label>
                    <input 
                      type="number" 
                      value={loyaltyBonusPoints} 
                      onChange={(e) => setLoyaltyBonusPoints(e.target.value)}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-[#062c16]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-bold">Redemption Threshold Level</label>
                    <input 
                      type="number" 
                      value={loyaltyThreshold} 
                      onChange={(e) => setLoyaltyThreshold(e.target.value)}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 16. INVENTORY SETTINGS */}
          {activeSection === 'inventory' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Critical Low-Stock Warning Threshold</label>
                  <div className="flex items-center gap-1.5 bg-white border rounded-xl px-3 py-1.5">
                    <input 
                      type="number" 
                      value={invThreshold} 
                      onChange={(e) => setInvThreshold(e.target.value)}
                      className="w-full focus:outline-none font-bold text-slate-800"
                    />
                    <span className="font-bold text-slate-400">Containers</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Stock Forecasting Chronometer Alg</label>
                  <select
                    value={invForecasting}
                    onChange={(e) => setInvForecasting(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2"
                  >
                    <option value="Moving Average (90d)">Moving Average (90-Day Demand)</option>
                    <option value="Seasonality Mixed">Seasonality Multiplier Mode</option>
                    <option value="Linear Trend">Linear Adherence Growth Projection</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="block text-slate-550 font-bold">Default Wholesale Supplier Center</label>
                  <input 
                    type="text" 
                    value={invSupplier} 
                    onChange={(e) => setInvSupplier(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border flex items-center justify-between mt-2">
                <div>
                  <p className="font-bold text-slate-700">Predictive Auto-Alerting System</p>
                  <p className="text-[10px] text-gray-400">Chronometer alerts clinicians before vital stock vanishes entirely.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={invAutoAlerts} 
                  onChange={(e) => setInvAutoAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#84CC16]"
                />
              </div>
            </div>
          )}

          {/* 17. AI SETTINGS */}
          {activeSection === 'ai_settings' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-slate-50 p-4 border rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Enable Gemini Adherence Core Intelligence</p>
                  <p className="text-[10px] text-gray-400">Leverage Gemini model logic to draft smart patient recommendations.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={aiEnabled} 
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="w-4 h-4 cursor-pointer text-[#84CC16]"
                />
              </div>

              {aiEnabled && (
                <div className="space-y-3.5 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-550 font-bold">Model Personalization Dialect Vibe</label>
                      <select
                        value={aiPersonalization}
                        onChange={(e: any) => setAiPersonalization(e.target.value)}
                        className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-705 focus:outline-none"
                      >
                        <option value="Conservative">Conservative (Clinical &amp; direct instruction)</option>
                        <option value="Balanced">Balanced (Official medical guidance)</option>
                        <option value="Empathetic">Empathetic (Reassuring therapeutic dialogue)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-550 font-bold">Language Mixing Priority</label>
                      <input 
                        type="text" 
                        value={aiLanguagePref} 
                        onChange={(e) => setAiLanguagePref(e.target.value)}
                        className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 border p-3 rounded-xl">
                    <label className="flex items-center justify-between gap-1 cursor-pointer font-bold">
                      <div>
                        <span>Auto-draft message personalization logs</span>
                        <p className="text-[10px] text-gray-400 font-normal">Pre-populate WhatsApp queue with empathetic recommendations</p>
                      </div>
                      <input type="checkbox" checked={aiGenerateMessages} onChange={(e) => setAiGenerateMessages(e.target.checked)} className="text-[#84CC16]" />
                    </label>
                    <label className="flex items-center justify-between gap-1 cursor-pointer font-bold border-t pt-2 mt-2">
                      <div>
                        <span>Therapeutic risk level classification models</span>
                        <p className="text-[10px] text-gray-400 font-normal">Auto-detect non-compliant patient drop-out risks</p>
                      </div>
                      <input type="checkbox" checked={aiRiskPrediction} onChange={(e) => setAiRiskPrediction(e.target.checked)} className="text-[#84CC16]" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 18. LANGUAGE SETTINGS */}
          {activeSection === 'language' && (
            <div className="space-y-4 text-xs font-sans">
              <h5 className="font-bold text-slate-800">Supported Regional Dialects</h5>
              <p className="text-[11px] text-gray-400">Tick individual language frameworks to expose translation templates in patient profiles:</p>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl cursor-pointer">
                  <span className="font-bold text-slate-800">🇬🇧 English Adherence Logs</span>
                  <input type="checkbox" checked={langEnglishEnabled} onChange={(e) => setLangEnglishEnabled(e.target.checked)} className="text-[#84CC16]" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl cursor-pointer">
                  <span className="font-bold text-slate-800">🇺🇬 Luganda Dialect (Central)</span>
                  <input type="checkbox" checked={langLugandaEnabled} onChange={(e) => setLangLugandaEnabled(e.target.checked)} className="text-[#84CC16]" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl cursor-pointer">
                  <span className="font-bold text-slate-800">🇺🇬 Swahili Adherence Dialect</span>
                  <input type="checkbox" checked={langSwahiliEnabled} onChange={(e) => setLangSwahiliEnabled(e.target.checked)} className="text-[#84CC16]" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl cursor-pointer">
                  <span className="font-bold text-slate-800">🇫🇷 French Translation</span>
                  <input type="checkbox" checked={langFrenchEnabled} onChange={(e) => setLangFrenchEnabled(e.target.checked)} className="text-[#84CC16]" />
                </label>
              </div>
            </div>
          )}

          {/* 19. BACKUP AND RESTORE */}
          {activeSection === 'backup' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-slate-50 p-4 border rounded-2xl space-y-3">
                <h5 className="font-bold text-slate-800">Secure Backup Management</h5>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-600">Automated Backup Routine Schedule</span>
                  <select 
                    value={backupSchedule} 
                    onChange={(e: any) => setBackupSchedule(e.target.value)}
                    className="bg-white border rounded-xl px-3 py-1.5"
                  >
                    <option value="Daily">Daily Backup Sweeps</option>
                    <option value="Weekly">Weekly Backup Sweeps</option>
                    <option value="Monthly">Monthly Backup Sweeps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4 space-y-2">
                  <h6 className="font-extrabold text-slate-800">Trigger Manual Backup Log</h6>
                  <p className="text-[10px] text-gray-400">Download compiled SQL state files, chronic patient maps, and WhatsApp template configurations.</p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast("Building Repository Zip", "Exporting complete clinical state bundle to zip stream...", "info");
                    }}
                    className="bg-[#062c16] hover:bg-emerald-950 text-white font-extrabold text-[10px] uppercase w-full py-2 rounded-xl transition"
                  >
                    Build Backup Zip Bundle
                  </button>
                </div>

                <div className="bg-white border rounded-xl p-4 space-y-2">
                  <h6 className="font-extrabold text-slate-800">Restore CRM Database (JSON)</h6>
                  <p className="text-[10px] text-gray-400">Restore or overwrite clinical patients list from a previously exported CareRefill backup file.</p>
                  <div className="flex gap-2">
                    <input type="file" className="text-[10px] bg-slate-50 p-1 rounded font-mono border flex-grow" />
                    <button
                      type="button"
                      onClick={() => triggerToast("Database Re-Indexed", "Database structure verified and restored.", "success")}
                      className="bg-brand-green hover:bg-emerald-600 text-white font-bold p-2.5 rounded-xl text-[10px] whitespace-nowrap cursor-pointer"
                    >
                      Restore DB
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3.5 space-y-2">
                <h6 className="font-bold text-slate-700 uppercase text-[9px] tracking-wider">Raw Compliance Data Sheet Exports</h6>
                <div className="flex gap-2">
                  <button 
                    onClick={() => triggerBackupDownload('csv')} 
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border p-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-slate-700 cursor-pointer text-xs"
                  >
                    <FileText className="w-4 h-4 text-rose-500" />
                    Download CSV
                  </button>
                  <button 
                    onClick={() => triggerBackupDownload('json')} 
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border p-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-slate-700 cursor-pointer text-xs"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Export Excel Format
                  </button>
                  <button 
                    onClick={() => triggerBackupDownload('pdf')} 
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border p-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-slate-700 cursor-pointer text-xs"
                  >
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Export PDF Audit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 20. SUBSCRIPTION AND BILLING */}
          {activeSection === 'billing' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#84CC16] tracking-widest block font-mono">Current Pharmacy Tier Plan</span>
                  <h5 className="text-base font-black tracking-tight mt-1">{billingPlan}</h5>
                  <p className="text-slate-400 text-[10px] mt-1">Due for renewal on July 20, 2026. Auto-renew via Mobile Money enabled.</p>
                </div>
                <button
                  onClick={() => triggerToast("Pricing Flow", "Workspace pricing engine activated. High-tier options compiled.", "info")}
                  className="bg-[#84CC16] hover:bg-[#71B20A] text-[#062c16] font-extrabold px-4 py-2 rounded-xl text-xs uppercase"
                >
                  Upgrade core Plan
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border p-4 rounded-xl text-center space-y-1">
                  <p className="text-gray-400 block uppercase tracking-wider text-[9px] font-black">Messages Dispatched Balance</p>
                  <h6 className="text-lg font-black text-slate-800">{messagesSent} / {messagesLimit} sent</h6>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#84CC16] h-full" style={{ width: `${(messagesSent/messagesLimit)*100}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-50 border p-4 rounded-xl text-center space-y-1">
                  <p className="text-gray-400 block uppercase tracking-wider text-[9px] font-black">Wholesale Outbound API Credits</p>
                  <h6 className="text-lg font-black text-emerald-700">UGX 42,900 available</h6>
                  <p className="text-[10px] text-gray-400">Equivalent to approx 3,432 Africa's Talking bulk SMS.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="font-bold text-slate-800">Consolidated Invoice Logs Ledger</h6>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="p-2 font-bold text-slate-600">Invoice ID</th>
                        <th className="p-2 font-bold text-slate-600">Billing Date</th>
                        <th className="p-2 font-bold text-slate-600">Total Charged</th>
                        <th className="p-2 font-bold text-[#84CC16]">Clearance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-b hover:bg-slate-50/50">
                          <td className="p-2 font-mono text-gray-905">{inv.id}</td>
                          <td className="p-2 text-gray-500">{inv.date}</td>
                          <td className="p-2 font-bold text-slate-800">{inv.amount}</td>
                          <td className="p-2"><span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full">{inv.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 21. AUDIT LOGS */}
          {activeSection === 'audit_logs' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="flex justify-between items-center">
                <h5 className="font-bold text-slate-800">Consolidated Workspace Action Audit Trails</h5>
                <button 
                  type="button" 
                  onClick={() => {
                    setAuditLogs(prev => [
                      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'Dr. Sarah Mukasa', action: 'Cleared audit trail log preview segment', ip: '197.239.5.42' },
                      ...prev
                    ]);
                    triggerToast("Audit logs fetched", "Latest practice traces retrieved from server logs.", "success");
                  }}
                  className="text-[#84CC16] hover:underline font-bold"
                >
                  Refresh Logs Feed
                </button>
              </div>

              <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] p-4 rounded-xl max-h-[300px] overflow-y-auto space-y-2 border border-slate-850">
                <div className="text-slate-400 border-b border-slate-800 pb-1.5 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Secure Clinical Audit Trace Console</span>
                </div>
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-slate-850 pb-1.5">
                    <span className="text-slate-400 font-bold font-sans">[{log.timestamp}]</span>{' '}
                    <span className="text-[#84CC16] font-bold">{log.user}</span> (IP:{log.ip}):{' '}
                    <span className="text-white font-medium">{log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 22. API AND DEVELOPER SETTINGS */}
          {activeSection === 'developer' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1 bg-slate-50 border p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-550 font-bold">Workspace Developer Core API Key (Live)</label>
                  <button 
                    type="button" 
                    onClick={() => setShowDevApiKey(!showDevApiKey)}
                    className="text-slate-500 hover:text-slate-800 text-[10px]"
                  >
                    {showDevApiKey ? "Hide Secret Key" : "Reveal API Key"}
                  </button>
                </div>
                <div className="flex gap-2 pt-1">
                  <input 
                    type={showDevApiKey ? "text" : "password"} 
                    value={devApiKey} 
                    disabled
                    className="flex-grow bg-white border rounded-xl px-3 py-1.5 font-mono text-[11px] text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(devApiKey);
                      triggerToast("Copied!", "API token copied to clipboard safely.", "success");
                    }}
                    className="bg-[#062c16] hover:bg-emerald-950 text-white font-bold px-3 py-1.5 rounded-xl text-[11px]"
                  >
                    Copy Token
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-550 font-bold">Inbound Trigger webhook URL Endpoint</label>
                <input 
                  type="text" 
                  value={devWebhookUrl} 
                  onChange={(e) => setDevWebhookUrl(e.target.value)}
                  className="w-full bg-white border rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <p className="font-bold text-slate-700">Outbound call Rate Limit</p>
                  <p className="text-[10px] text-emerald-700 font-bold font-mono">140 parallel dispatches / sec</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <p className="font-bold text-slate-700">Developer Log Verification</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Webhooks dispatch fully encrypted payloads with signature verification headers.</p>
                </div>
              </div>
            </div>
          )}

          {/* 23. PRIVACY AND CONSENT SETTINGS */}
          {activeSection === 'privacy' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block text-slate-550 font-bold">Standard Patient Adherence Consultation Consent Form</label>
                <textarea 
                  value={privacyConsentForms} 
                  onChange={(e) => setPrivacyConsentForms(e.target.value)}
                  rows={4}
                  className="w-full bg-white border rounded-xl p-3 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-t">
                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Electronic Record Data Retention Policy</label>
                  <select
                    value={privacyDataRetentionYears}
                    onChange={(e) => setPrivacyDataRetentionYears(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2"
                  >
                    <option value="5">5 Years (NDA Standard Adherence Policy)</option>
                    <option value="10">10 Years (Extended Clinical review)</option>
                    <option value="3">3 Years (Short-term review logs)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-550 font-bold">Caregiver / Adherence proxy authorization</label>
                  <div className="bg-slate-50 p-2 border rounded-xl flex items-center justify-between">
                    <span className="font-bold">Enable proxies</span>
                    <input 
                      type="checkbox" 
                      checked={privacyCaregiverPermissions} 
                      onChange={(e) => setPrivacyCaregiverPermissions(e.target.checked)}
                      className="w-4 h-4 text-[#84CC16]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 24. SUPER ADMIN SETTINGS */}
          {activeSection === 'super_admin' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-rose-950 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block font-mono">Platform Ownership Security clearance</span>
                  <h5 className="text-base font-black tracking-tight mt-1">Super-Admin Verified Console</h5>
                  <p className="text-zinc-305 text-[11px] mt-1">Logged session: viannejonny@gmail.com (Full root DB override access active)</p>
                </div>
                <div className="bg-rose-800 text-rose-100 font-bold px-3.5 py-1 rounded-xl text-[10px] uppercase font-mono tracking-wider">
                  ROLE: BRAND OWNER
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h6 className="font-extrabold text-slate-800">Pharmacy Tenants Directory (Uganda Regional Centers)</h6>
                  <button 
                    onClick={() => triggerToast("Deploying Tenant", "Provisioning isolated Firestore database for newly registered partner branch...", "info")}
                    className="text-[#84CC16] hover:underline font-bold text-[11px]"
                  >
                    + Provision New Isolated Tenant
                  </button>
                </div>
                <div className="border rounded-xl overflow-hidden bg-slate-50/50">
                  <table className="w-full border-collapse text-left text-[11px] leading-normal font-sans">
                    <thead>
                      <tr className="bg-slate-100 border-b">
                        <th className="p-2 font-bold text-slate-600">Tenant Center</th>
                        <th className="p-2 font-bold text-slate-600">Adherents</th>
                        <th className="p-2 font-bold text-slate-600">SaaS Revenue</th>
                        <th className="p-2 font-bold text-slate-600 font-sans">Clearance State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {superAdminPharmacies.map((pm) => (
                        <tr key={pm.id} className="border-b bg-white hover:bg-slate-50/70">
                          <td className="p-2 font-bold text-slate-800">{pm.name}</td>
                          <td className="p-2 text-slate-500 font-mono">{pm.tenantsCount} Patients</td>
                          <td className="p-2 font-black text-emerald-800 font-mono">{pm.revenue}</td>
                          <td className="p-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${
                              pm.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>{pm.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                <div className="bg-slate-50 p-4 border rounded-xl text-center space-y-1">
                  <p className="text-gray-400 uppercase tracking-widest text-[9px] font-black">Platform Wide SMS volume</p>
                  <p className="text-lg font-black text-[#062c16]">841,920 Outbound messages</p>
                </div>
                <div className="bg-slate-50 p-4 border rounded-xl text-center space-y-1">
                  <p className="text-gray-400 uppercase tracking-widest text-[9px] font-black">Gross Platform Revenue</p>
                  <p className="text-lg font-black text-emerald-700">UGX 3,750,000 / month</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
