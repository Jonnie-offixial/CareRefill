import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  ArrowUpRight, 
  Plus, 
  Trash, 
  Edit, 
  Check, 
  AlertCircle, 
  X, 
  Receipt, 
  Calendar, 
  Percent, 
  Shield, 
  HelpCircle, 
  Activity, 
  Building2, 
  Download, 
  Mail, 
  Printer, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Users,
  MessageSquare
} from "lucide-react";

interface BillingModuleProps {
  showToast: (message: string, description?: string, type?: "success" | "error" | "info") => void;
}

interface PaymentMethod {
  id: string;
  type: "MTN" | "Airtel" | "Card";
  name: string;
  details: string;
  isPrimary: boolean;
}

interface Invoice {
  id: string;
  date: string;
  planName: string;
  amount: number;
  currency: string;
  status: "Paid" | "Pending" | "Failed";
}

export default function BillingModule({ showToast }: BillingModuleProps) {
  // State 1: Active Subscription Plan
  const [activePlan, setActivePlan] = useState<"Free" | "Basic" | "Premium" | "Enterprise">("Premium");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"Active" | "Trial" | "Expired" | "Cancelled">("Active");
  const [nextBillingDate, setNextBillingDate] = useState("July 21, 2026");
  const [autoRenew, setAutoRenew] = useState(true);

  // State 2: Coupons and Discounts
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);

  // State 3: Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "pay-1", type: "MTN", name: "MTN Mobile Money", details: "077XXXX762", isPrimary: true },
    { id: "pay-2", type: "Airtel", name: "Airtel Money", details: "070XXXX115", isPrimary: false },
    { id: "pay-3", type: "Card", name: "Visa Card - Corporate", details: "Ending in 4882", isPrimary: false }
  ]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPayType, setNewPayType] = useState<"MTN" | "Airtel" | "Card">("MTN");
  const [newPayPhone, setNewPayPhone] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");

  // State 4: Billing History
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "INV-1001", date: "Jun 21, 2026", planName: "Premium", amount: 99000, currency: "UGX", status: "Paid" },
    { id: "INV-1000", date: "May 21, 2026", planName: "Premium", amount: 99000, currency: "UGX", status: "Paid" },
    { id: "INV-999", date: "Apr 21, 2026", planName: "Basic", amount: 49000, currency: "UGX", status: "Paid" }
  ]);

  // State 5: Tax Information Form
  const [taxInfo, setTaxInfo] = useState({
    businessName: "Kampala Medical Plaza Ltd",
    tin: "100-384-9182",
    address: "Plot 42, Kampala Road",
    country: "Uganda",
    currency: "UGX"
  });
  const [isEditingTax, setIsEditingTax] = useState(false);

  // State 6: Notification Alert Setting Toggles
  const [notificationSettings, setNotificationSettings] = useState({
    paymentSuccess: true,
    subscriptionExpiring: true,
    failedPayment: true,
    trialEnding: false,
    invoiceAvailable: true
  });

  // State 7: Cancellation Modal & Status
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // State 8: Active Live Chat Simulation
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    { role: "bot", text: "Hello! I am the CareRefill Billing Advisor assistant. How can I help you today? Feel free to ask about plans, tax receipts, or mobile money refunds!" }
  ]);

  // State 9: Active Invoice Viewer Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Pricing Model Lookup
  const plansData = {
    Free: { price: 0, desc: "Perfect for single practitioners starting up" },
    Basic: { price: 49000, desc: "For scaling community health operations" },
    Premium: { price: 99000, desc: "Enterprise readiness with dual alerts desk" },
    Enterprise: { price: 299000, desc: "Bespoke multi-branch tenant control & APIs" }
  };

  // Usage Stats reactive bounds
  const getLimitsForPlan = (plan: "Free" | "Basic" | "Premium" | "Enterprise") => {
    switch (plan) {
      case "Free":
        return { patients: 100, whatsapp: 0, sms: 0, staff: 1 };
      case "Basic":
        return { patients: 1000, whatsapp: 5000, sms: 2000, staff: 5 };
      case "Premium":
        return { patients: 5000, whatsapp: 25000, sms: 10000, staff: 20 };
      case "Enterprise":
        return { patients: 50000, whatsapp: 150000, sms: 80000, staff: 100 };
    }
  };

  const usageStats = {
    patientsCount: 2300,
    whatsappSent: 15000,
    smsSent: 3200,
    staffCount: 8
  };

  const limits = getLimitsForPlan(activePlan);

  // Discount Application Logic
  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === "SUMMER20") {
      setAppliedDiscount({ code: "SUMMER20", percent: 20 });
      showToast("Coupon Applied!", "You received a 20% discount on subsequent renewals.", "success");
    } else if (cleanCode === "UGANDA50") {
      setAppliedDiscount({ code: "UGANDA50", percent: 50 });
      showToast("Ugandan Partner Promo!", "50% off applied code successfully.", "success");
    } else if (cleanCode === "FREEANNUAL") {
      setAppliedDiscount({ code: "FREEANNUAL", percent: 100 });
      showToast("Special Admin Voucher Applied", "100% off renewal active.", "success");
    } else {
      showToast("Invalid Promo Code", "Please make sure it's SUMMER20 or UGANDA50", "error");
    }
    setPromoCode("");
  };

  // Pricing calculation
  const getPlanPrice = (planKey: "Free" | "Basic" | "Premium" | "Enterprise") => {
    const rawPrice = plansData[planKey].price;
    const cycledPrice = billingCycle === "yearly" ? rawPrice * 10 * 0.9 : rawPrice; // 10 months price with additional 10% discount
    if (appliedDiscount) {
      return cycledPrice * (1 - appliedDiscount.percent / 100);
    }
    return cycledPrice;
  };

  // Handle plan transition
  const handlePlanSelect = (selected: "Free" | "Basic" | "Premium" | "Enterprise") => {
    setActivePlan(selected);
    setSubscriptionStatus("Active");
    showToast("Subscription Updated", `Successfully transitioned health clinic portal to ${selected} Tier.`, "success");
  };

  // Save tax information
  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingTax(false);
    showToast("Tax Information Saved", "Electronic TIN profile and invoicing details refreshed successfully.", "success");
  };

  // Interactive Pay Now logic
  const handlePayNow = () => {
    const primaryPayMethod = paymentMethods.find(p => p.isPrimary) || paymentMethods[0];
    const amountDue = Math.round(getPlanPrice(activePlan));

    if (amountDue === 0) {
      showToast("Direct Approval", "No payment due for the current Free configuration.", "info");
      return;
    }

    showToast("Initiating Payment", `Connecting securely with ${primaryPayMethod.name}...`, "info");

    setTimeout(() => {
      const newInvId = `INV-${Math.floor(Math.random() * 9000) + 1000}`;
      const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      
      const newInvoiceItem: Invoice = {
        id: newInvId,
        date: today,
        planName: activePlan,
        amount: amountDue,
        currency: "UGX",
        status: "Paid"
      };

      setInvoices(prev => [newInvoiceItem, ...prev]);
      showToast("Payment Successful!", `Successfully processed UGX ${amountDue.toLocaleString()} via ${primaryPayMethod.details}.`, "success");
    }, 1500);
  };

  // Add Payment Method logic
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    let details = "";
    if (newPayType === "Card") {
      if (!newCardNumber) {
        showToast("Error", "Please fill in Visa or Mastercard card digits.", "error");
        return;
      }
      details = `Ending in ${newCardNumber.slice(-4)}`;
    } else {
      if (!newPayPhone) {
        showToast("Error", "Please deliver a valid MTN/Airtel phone prompt target.", "error");
        return;
      }
      details = newPayPhone;
    }

    const newMethod: PaymentMethod = {
      id: `pay-${Date.now()}`,
      type: newPayType,
      name: newPayType === "MTN" ? "MTN Mobile Money" : newPayType === "Airtel" ? "Airtel Money" : "Credit/Debit Card",
      details: details,
      isPrimary: paymentMethods.length === 0
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    setShowAddPaymentModal(false);
    setNewPayPhone("");
    setNewCardNumber("");
    setNewCardExpiry("");
    showToast("Payment Method Configured", `${newMethod.name} added to vault.`, "success");
  };

  // Set Primary Payment Method
  const handleSetPrimaryPayment = (id: string) => {
    setPaymentMethods(prev => prev.map(p => ({
      ...p,
      isPrimary: p.id === id
    })));
    showToast("Database Updated", "Primary billing dispatch router updated.", "success");
  };

  // Delete Payment Method
  const handleDeletePayment = (id: string, name: string) => {
    const item = paymentMethods.find(p => p.id === id);
    if (item?.isPrimary) {
      showToast("Forbidden Operation", "Cannot delete your primary renewal provider account.", "error");
      return;
    }
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    showToast("Removed", `${name} profile scrubbed from secure token environment.`, "info");
  };

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Invoice ID,Date,Plan,Amount,Currency,Status\n";
    invoices.forEach(inv => {
      csvContent += `${inv.id},${inv.date},${inv.planName},${inv.amount},${inv.currency},${inv.status}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CareRefill_Billing_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Excel/CSV export completed", "Full billing spreadsheet parsed and downloaded client-side.", "success");
  };

  // Live Chat Helper Reply simulation
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatHistory(prev => [...prev, { role: "user", text: userMessage }]);
    setChatMessage("");

    setTimeout(() => {
      let botResponse = "I can transfer you to a human billing agent in Uganda who will assist with manual mobile wallet adjustments.";
      const lower = userMessage.toLowerCase();
      if (lower.includes("refund")) {
        botResponse = "As per CareRefill policy, refunds can be processed back to the originating MTN/Airtel wallet within 5 business days. Please drop your invoice ID!";
      } else if (lower.includes("plan") || lower.includes("price")) {
        botResponse = "Our Basic plan is UGX 49,000/mo, and Premium is UGX 99,000/mo. Switching to yearly saves you 10% instantly plus 2 free months!";
      } else if (lower.includes("tin") || lower.includes("tax")) {
        botResponse = "You can update your Tax Identification Number (TIN) at any time inside the 'Tax Profiles' panel on this screen to auto-compute e-receipts.";
      } else if (lower.includes("coupons") || lower.includes("promo")) {
        botResponse = "Try checking your clinic sign-up email or try applying the 'UGANDA50' promotional coupon code for half-off!";
      }

      setChatHistory(prev => [...prev, { role: "bot", text: botResponse }]);
    }, 900);
  };

  // Calculate annual total
  const annualTotalPaid = invoices
    .filter(i => i.status === "Paid")
    .reduce((sum, current) => sum + current.amount, 0);

  return (
    <div id="billing-subscriptions-screen" className="space-y-8 animate-fade-in text-left">
      
      {/* Dynamic Upper Hero Area */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 transform translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <Receipt size={240} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-emerald-100 uppercase tracking-widest text-xs font-semibold px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full">
                SaaS Portal Account
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1.5">Subscriptions &amp; Billing</h1>
              <p className="text-emerald-500/90 text-sm max-w-xl text-emerald-100">
                Configure your health clinic tier, review usage limits, reconcile MTN/Airtel mobile payments, and download legal TIN-compliant invoices.
              </p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button 
                id="export-csv-btn"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-white hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold border border-emerald-200 transition"
              >
                <Download size={14} />
                Export Ledger
              </button>
              <button 
                id="live-chat-panel-btn"
                onClick={() => setShowChatDrawer(true)}
                className="inline-flex items-center gap-1.5 text-xs text-white bg-emerald-500/35 hover:bg-emerald-500/50 hover:text-white px-4 py-2.5 rounded-xl font-bold border border-white/20 transition"
              >
                <HelpCircle size={14} />
                Billing Help Desk
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary Cards block */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 space-y-1.5">
              <p className="text-emerald-100/70 text-xs">Active Subscription tier</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold">{activePlan}</span>
                <span className="text-xs bg-lime-400 text-slate-900 px-1.5 py-0.5 rounded-md font-extrabold select-none">
                  {subscriptionStatus}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 space-y-1.5">
              <p className="text-emerald-100/70 text-xs">Total Reconciled (2026)</p>
              <p className="text-xl font-bold">UGX {annualTotalPaid.toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 space-y-1.5">
              <p className="text-emerald-100/70 text-xs">Next Due Amount</p>
              <p className="text-xl font-bold">UGX {Math.round(getPlanPrice(activePlan)).toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 space-y-1.5">
              <p className="text-emerald-100/70 text-xs">Daily Active Staff Users</p>
              <p className="text-xl font-bold">{usageStats.staffCount} of {limits.staff}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column - Plan selector and available list (span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Current plan overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield size={18} className="text-emerald-600" />
                  Your Current Plan Context
                </h3>
                <p className="text-xs text-gray-500">View renewal variables and tier pricing matrices</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
                {billingCycle === "monthly" ? "Monthly billing" : "Yearly billing (10% Saved)"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Current active model</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-gray-100 flex items-center gap-2">
                    {activePlan} Tier
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${subscriptionStatus === "Active" ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Recurring Price configured</span>
                  <p className="text-xl font-bold text-slate-700 dark:text-gray-200">
                    UGX {getPlanPrice(activePlan).toLocaleString()} <span className="text-xs text-gray-500">/ {billingCycle === "monthly" ? "month" : "year"}</span>
                  </p>
                  {appliedDiscount && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Coupon Applied: {appliedDiscount.percent}% off ({appliedDiscount.code})
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Automatic renewal parameters</span>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <Calendar size={14} className="text-amber-500" />
                    <span>Next billing debit on <strong className="text-slate-900 dark:text-white">{nextBillingDate}</strong></span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Charged automatically using primary partner: <span className="underline">{paymentMethods.find(p => p.isPrimary)?.name || "MTN Mobile Money"}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {subscriptionStatus === "Cancelled" ? (
                    <button 
                      onClick={() => {
                        setSubscriptionStatus("Active");
                        showToast("Subscription Resumed", "Automatic renewal is reactivated for the next generation interval.", "success");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs"
                    >
                      Resume Subscription
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 hover:dark:bg-rose-950/45 font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                      Cancel Plan
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      const newCycle = billingCycle === "monthly" ? "yearly" : "monthly";
                      setBillingCycle(newCycle);
                      showToast("Billing cycle changed", `Switched renewal standard to ${newCycle} intervals.`, "info");
                    }}
                    className="border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Switch to {billingCycle === "monthly" ? "Yearly (Save 10%)" : "Monthly Bills"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Choose and Compare Plans */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Compare Available Subscription plans</h3>
                <p className="text-xs text-gray-500">Promoting transparent self-service clinic accounts scales</p>
              </div>

              {/* Monthly / Yearly cycle selector */}
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl items-center self-start sm:self-center">
                <button 
                  onClick={() => setBillingCycle("monthly")}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${billingCycle === "monthly" ? "bg-white dark:bg-slate-700 shadow-xs text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900"}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle("yearly")}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${billingCycle === "yearly" ? "bg-white dark:bg-slate-700 shadow-xs text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900"}`}
                >
                  Yearly
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1 rounded">Save 10%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card - Free */}
              <div className={`rounded-2xl border p-4 flex flex-col justify-between space-y-4 transition ${activePlan === "Free" ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-xs" : "border-gray-200 dark:border-slate-800 hover:border-gray-300 bg-white dark:bg-slate-900"}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white">Free Plan</span>
                    {activePlan === "Free" && <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-md select-none">Active</span>}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{plansData.Free.desc}</p>
                  <p className="text-lg font-bold pt-1">
                    UGX 0 <span className="text-[10px] text-gray-500">/ mo</span>
                  </p>
                </div>
                
                <div className="space-y-2 border-t border-dashed border-gray-150 pt-3">
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>1 health facility</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Up to 100 patients</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Email reminders</span>
                  </div>
                </div>

                <button 
                  onClick={() => handlePlanSelect("Free")}
                  disabled={activePlan === "Free"}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition ${activePlan === "Free" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-default" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200"}`}
                >
                  {activePlan === "Free" ? "Current" : "Downgrade"}
                </button>
              </div>

              {/* Card - Basic */}
              <div className={`rounded-2xl border p-4 flex flex-col justify-between space-y-4 transition ${activePlan === "Basic" ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-xs" : "border-gray-200 dark:border-slate-800 hover:border-gray-300 bg-white dark:bg-slate-900"}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white">Basic Plan</span>
                    {activePlan === "Basic" && <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-md select-none">Active</span>}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{plansData.Basic.desc}</p>
                  <p className="text-lg font-bold pt-1">
                    UGX {getPlanPrice("Basic").toLocaleString()} <span className="text-[10px] text-gray-500">/ mo</span>
                  </p>
                </div>
                
                <div className="space-y-2 border-t border-dashed border-gray-150 pt-3">
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Multiple staff accounts</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>WhatsApp reminders</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Analytics dashboard</span>
                  </div>
                </div>

                <button 
                  onClick={() => handlePlanSelect("Basic")}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition ${activePlan === "Basic" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-default" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"}`}
                >
                  {activePlan === "Basic" ? "Current" : "Choose Basic"}
                </button>
              </div>

              {/* Card - Premium */}
              <div className={`rounded-2xl border p-4 flex flex-col justify-between space-y-4 transition relative ${activePlan === "Premium" ? "border-emerald-500 bg-emerald-50/25 dark:bg-emerald-900/15 shadow-md" : "border-gray-200 dark:border-slate-800 hover:border-emerald-300 bg-white dark:bg-slate-900"}`}>
                <div className="absolute top-0 right-4 transform -translate-y-1/2">
                  <span className="text-[9px] bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">Most Popular</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white">Premium</span>
                    {activePlan === "Premium" && <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-md select-none">Active</span>}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{plansData.Premium.desc}</p>
                  <p className="text-lg font-bold pt-1">
                    UGX {getPlanPrice("Premium").toLocaleString()} <span className="text-[10px] text-gray-500">/ mo</span>
                  </p>
                </div>
                
                <div className="space-y-2 border-t border-dashed border-gray-150 pt-3">
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>SMS + WhatsApp queues</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Inventory &amp; stocks sync</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Priority Support ticket desk</span>
                  </div>
                </div>

                <button 
                  onClick={() => handlePlanSelect("Premium")}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition ${activePlan === "Premium" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-default" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"}`}
                >
                  {activePlan === "Premium" ? "Current" : "Transition to Pro"}
                </button>
              </div>

              {/* Card - Enterprise */}
              <div className={`rounded-2xl border p-4 flex flex-col justify-between space-y-4 transition ${activePlan === "Enterprise" ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-xs" : "border-gray-200 dark:border-slate-800 hover:border-gray-300 bg-white dark:bg-slate-900"}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white">Enterprise</span>
                    {activePlan === "Enterprise" && <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-md select-none">Active</span>}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{plansData.Enterprise.desc}</p>
                  <p className="text-lg font-bold pt-1">
                    UGX {getPlanPrice("Enterprise").toLocaleString()} <span className="text-[10px] text-gray-500">/ mo</span>
                  </p>
                </div>
                
                <div className="space-y-2 border-t border-dashed border-gray-150 pt-3">
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Unlimited regional patients</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Raw integration API tools</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Dedicated account advisor</span>
                  </div>
                </div>

                <button 
                  onClick={() => handlePlanSelect("Enterprise")}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition ${activePlan === "Enterprise" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-default" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"}`}
                >
                  {activePlan === "Enterprise" ? "Current" : "Enlist Enterprise"}
                </button>
              </div>

            </div>
          </div>

          {/* Section 3: Billing History & Invoice Downloads */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Receipt size={18} className="text-gray-400" />
                  Invoicing &amp; Billing History Ledger
                </h3>
                <p className="text-xs text-gray-500">Legal records, download local statements or request direct print-outs.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 text-xs text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl transition"
                >
                  Download Ledger (CSV)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-medium">
                    <th className="py-3 px-2">Invoice Code</th>
                    <th className="py-3 px-2">Date Generated</th>
                    <th className="py-3 px-2">Plan Interval</th>
                    <th className="py-3 px-2">Charged Value</th>
                    <th className="py-3 px-2">Settlement status</th>
                    <th className="py-3 px-2 text-right">Actions Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-2 font-mono font-bold text-slate-900 dark:text-slate-100">{inv.id}</td>
                      <td className="py-3 px-2 flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" />
                        {inv.date}
                      </td>
                      <td className="py-3 px-2">{inv.planName} Tier</td>
                      <td className="py-3 px-2 font-semibold">UGX {inv.amount.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === "Paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                          inv.status === "Pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                          "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${inv.status === "Paid" ? "bg-emerald-500" : inv.status === "Pending" ? "bg-amber-500" : "bg-rose-500"}`} />
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1 whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedInvoice(inv)}
                          className="hover:text-emerald-600 text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition" 
                          title="View Digital Invoice"
                        >
                          <Info size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            showToast("Downloading", `Building PDF file stream for invoice ${inv.id}...`, "info");
                            setTimeout(() => {
                              showToast("PDF Saved", `Locally downloaded legal receipt ${inv.id}.pdf.`, "success");
                            }, 800);
                          }}
                          className="hover:text-emerald-600 text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition"
                          title="Download PDF Copy"
                        >
                          <Download size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            showToast("Printing initiated", `Connecting to system spooler for receipt print...`, "info");
                            setTimeout(() => {
                              showToast("Receipt Printed", "Direct thermal invoice successfully printed.", "success");
                            }, 800);
                          }}
                          className="hover:text-emerald-600 text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition"
                          title="Direct Print Receipt"
                        >
                          <Printer size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            showToast("Email dispatched", `Dispatched invoice HTML securely to: viannejonny@gmail.com`, "success");
                          }}
                          className="hover:text-emerald-600 text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition"
                          title="Email Invoice to Owner"
                        >
                          <Mail size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Visual Subscription & spend statistics (Charts) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                Subscription Spend &amp; Alert Engine Usage Growth
              </h3>
              <p className="text-xs text-gray-500">Live indicators of your regional outreach metrics and pricing trend</p>
            </div>

            {/* Simulated interactive premium SVG charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chart 1: Monthly spending (UGX Ths) */}
              <div className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-600 dark:text-slate-300">Monthly Spending (UGX '000s)</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-gray-500 px-2 py-0.5 rounded-full">Last 4 Months</span>
                </div>
                
                <div className="h-32 flex items-end justify-between px-2 pt-4 relative">
                  {/* Background gridlines */}
                  <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-gray-100 dark:border-slate-850" />
                  <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-gray-100 dark:border-slate-850" />
                  <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-gray-100 dark:border-slate-850" />

                  <div className="flex flex-col items-center gap-1.5 z-10 w-1/4">
                    <span className="text-[9px] text-gray-400">UGX 49K</span>
                    <div className="w-10 bg-gray-200 dark:bg-slate-800 rounded-t-lg transition-all hover:bg-slate-300" style={{ height: "40px" }} />
                    <span className="text-[10px] font-medium">March</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 z-10 w-1/4">
                    <span className="text-[9px] text-gray-400">UGX 49K</span>
                    <div className="w-10 bg-gray-200 dark:bg-slate-800 rounded-t-lg transition-all hover:bg-slate-300" style={{ height: "40px" }} />
                    <span className="text-[10px] font-medium">April</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 z-10 w-1/4">
                    <span className="text-[9px] text-emerald-600 font-bold">UGX 99K</span>
                    <div className="w-10 bg-emerald-600 dark:bg-emerald-700/80 rounded-t-lg transition-all hover:opacity-90" style={{ height: "80px" }} />
                    <span className="text-[10px] font-medium">May</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 z-10 w-1/4">
                    <span className="text-[9px] text-emerald-600 font-bold">UGX 99K</span>
                    <div className="w-10 bg-emerald-600 dark:bg-emerald-700/80 rounded-t-lg transition-all hover:opacity-90" style={{ height: "80px" }} />
                    <span className="text-[10px] font-medium text-emerald-600 font-bold">June (Current)</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Reminder consumption vs SMS queue alerts */}
              <div className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-600 dark:text-slate-300">Reminders Trigger Distribution</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-gray-500 px-2 py-0.5 rounded-full">Cumulative</span>
                </div>
                
                <div className="h-32 flex items-center justify-center relative">
                  {/* Interactive SVG Pie style indicator */}
                  <svg width="120" height="120" viewBox="0 0 36 36" className="transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                    {/* Circle 1: WhatsApp (75%) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="4.2" strokeDasharray="75 25" strokeDashoffset="0" />
                    {/* Circle 2: SMS (16%) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="4.2" strokeDasharray="16 84" strokeDashoffset="-75" />
                  </svg>
                  
                  <div className="absolute right-0 top-2 flex flex-col gap-2.5 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm shrink-0" />
                      <span className="text-gray-600 dark:text-slate-300">WhatsApp reminders (75%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm shrink-0" />
                      <span className="text-gray-600 dark:text-slate-300">SMS Reminders (16%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-slate-200 rounded-sm shrink-0" />
                      <span className="text-gray-600 dark:text-slate-400">Email Alerts (9%)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right column - Side panel with Usage Statistics, Payment methods, Auto-renew settings (span 1) */}
        <div className="space-y-8">
          
          {/* Section 1: Upcoming payment block */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md space-y-6">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-500 text-slate-900 font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full">Upcoming Settlement</span>
                <p className="text-xs text-slate-400">Due on July 21, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Auto-Renew</p>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 justify-end">
                  <Check size={12} /> Enabled
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-400">Expected debit amount:</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black">UGX {Math.round(getPlanPrice(activePlan)).toLocaleString()}</span>
                {appliedDiscount && (
                  <span className="text-xs line-through text-slate-500">
                    UGX {getPlanPrice(activePlan) === 0 ? "0" : Math.round(plansData[activePlan].price).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Charging source: <span className="font-bold text-white">{paymentMethods.find(p => p.isPrimary)?.name || "MTN Mobile Money"} ({paymentMethods.find(p => p.isPrimary)?.details || "None"})</span>
              </p>
            </div>

            <button 
              id="pay-now-action-btn"
              onClick={handlePayNow}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-3 rounded-2xl transition shadow-md hover:scale-[1.01]"
            >
              Simulate Instant Settlement (Pay Now)
            </button>
          </div>

          {/* Section 2: Usage statistics progress bars */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="space-y-1 border-b dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Activity size={16} className="text-emerald-600" />
                Live Limits &amp; Usage statistics
              </h3>
              <p className="text-xs text-gray-400">Counters update immediately when moving plans</p>
            </div>

            <div className="space-y-4">
              {/* Statistic 1: Patients quota */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-slate-300">Patient Database Enrolment</span>
                  <span className="text-neutral-500">{usageStats.patientsCount.toLocaleString()} / {limits.patients === 50000 ? "Unlimited" : limits.patients.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usageStats.patientsCount / limits.patients) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Statistic 2: WhatsApp Reminder */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-slate-300">WhatsApp Reminders dispatched</span>
                  <span className="text-neutral-500">
                    {limits.whatsapp === 0 ? "Unsupported" : `${usageStats.whatsappSent.toLocaleString()} / ${limits.whatsapp.toLocaleString()}`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${limits.whatsapp === 0 ? 0 : Math.min(100, (usageStats.whatsappSent / limits.whatsapp) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Statistic 3: SMS alerts sent */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-slate-300">SMS Alerts sent</span>
                  <span className="text-neutral-500">
                    {limits.sms === 0 ? "Unsupported" : `${usageStats.smsSent.toLocaleString()} / ${limits.sms.toLocaleString()}`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${limits.sms === 0 ? 0 : Math.min(100, (usageStats.smsSent / limits.sms) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Statistic 4: Staff users registered */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-slate-300">Clinic Staff accounts</span>
                  <span className="text-neutral-500">{usageStats.staffCount} / {limits.staff}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usageStats.staffCount / limits.staff) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Premium Features Access Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="space-y-1 border-b dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Premium Features</h3>
              <p className="text-xs text-gray-400">Self-service module indicators unlocked</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-gray-700 dark:text-slate-300">SMS alert delivery engine</span>
                {limits.sms > 0 ? (
                  <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">✅ Enabled</span>
                ) : (
                  <span className="text-xs text-rose-500 font-extrabold flex items-center gap-1">❌ Locked</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-gray-700 dark:text-slate-300">WhatsApp queues</span>
                {limits.whatsapp > 0 ? (
                  <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">✅ Enabled</span>
                ) : (
                  <span className="text-xs text-rose-500 font-extrabold flex items-center gap-1">❌ Locked</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-gray-700 dark:text-slate-300">Inventory Management</span>
                {activePlan === "Premium" || activePlan === "Enterprise" ? (
                  <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">✅ Enabled</span>
                ) : (
                  <span className="text-xs text-rose-500 font-extrabold flex items-center gap-1">❌ Locked</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-gray-700 dark:text-slate-300">Reports export (Excel/CSV)</span>
                {activePlan === "Premium" || activePlan === "Enterprise" ? (
                  <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">✅ Enabled</span>
                ) : (
                  <span className="text-xs text-rose-500 font-extrabold flex items-center gap-1">❌ Locked</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-gray-700 dark:text-slate-300">Raw custom clinical APIs</span>
                {activePlan === "Enterprise" ? (
                  <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">✅ Enabled</span>
                ) : (
                  <span className="text-xs text-rose-500 font-extrabold flex items-center gap-1">❌ Locked</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Payment Methods Setup and Vault */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Saved Payment Methods</h3>
                <p className="text-xs text-gray-400">Reconcile automatically securely</p>
              </div>
              <button 
                onClick={() => setShowAddPaymentModal(true)}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1.5 rounded-lg transition"
                title="Add New Provider"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div 
                  key={pm.id} 
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 relative transition ${
                    pm.isPrimary ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20" : "border-gray-150 dark:border-slate-800 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className={pm.isPrimary ? "text-emerald-600" : "text-gray-400"} />
                      <span className="font-bold text-gray-800 dark:text-slate-200">{pm.name}</span>
                    </div>
                    {pm.isPrimary && (
                      <span className="bg-emerald-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-md select-none">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-baseline">
                    <p className="font-mono text-gray-600 dark:text-slate-400 font-semibold">{pm.details}</p>
                    <div className="flex gap-1">
                      {!pm.isPrimary && (
                        <button 
                          onClick={() => handleSetPrimaryPayment(pm.id)}
                          className="text-[10px] text-emerald-600 hover:underline"
                        >
                          Use Primary
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeletePayment(pm.id, pm.name)}
                        className="text-gray-400 hover:text-rose-500 p-1 rounded-md transition"
                        title="Delete Profile"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Coupons, Discounts, Promo Codes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Percent size={16} className="text-emerald-600" />
              Promotion Codes &amp; Discounts
            </h3>
            <p className="text-xs text-gray-500">Apply health group vouchers or trial code adjustments</p>
            
            <form onSubmit={handleApplyPromoCode} className="flex gap-2">
              <input 
                type="text"
                placeholder="PROMO CODE (e.g. SUMMER20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs w-full focus:outline-hidden focus:border-emerald-500"
              />
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded-xl transition"
              >
                Apply
              </button>
            </form>
            <p className="text-[10.5px] text-gray-400">
              💡 Secret keys: <strong className="text-slate-700 dark:text-slate-200">SUMMER20</strong> (20% Off), <strong className="text-slate-700 dark:text-slate-200">UGANDA50</strong> (50% Off)
            </p>
          </div>

          {/* Section 6: Tax Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tax Identification &amp; Currencies</h3>
              <button 
                onClick={() => setIsEditingTax(!isEditingTax)}
                className="text-emerald-600 text-xs hover:underline flex items-center gap-1"
              >
                <Edit size={12} />
                {isEditingTax ? "Lock Changes" : "Modify Profile"}
              </button>
            </div>

            {isEditingTax ? (
              <form onSubmit={handleSaveTax} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-500 text-[10px]">Business Name</label>
                  <input 
                    type="text" 
                    value={taxInfo.businessName}
                    onChange={(e) => setTaxInfo({ ...taxInfo, businessName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-gray-500 text-[10px]">TIN Number (Uganda Revenue)</label>
                  <input 
                    type="text" 
                    value={taxInfo.tin}
                    onChange={(e) => setTaxInfo({ ...taxInfo, tin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 text-[10px]">Registered address</label>
                  <input 
                    type="text" 
                    value={taxInfo.address}
                    onChange={(e) => setTaxInfo({ ...taxInfo, address: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white font-bold py-2 rounded-xl text-center self-end transition"
                >
                  Save Tax profile
                </button>
              </form>
            ) : (
              <div className="space-y-2 text-xs">
                <p className="text-gray-600 dark:text-slate-450">
                  <strong className="text-slate-800 dark:text-slate-200">Corporate client:</strong> {taxInfo.businessName}
                </p>
                <p className="text-gray-600 dark:text-slate-450 font-mono text-[11px]">
                  <strong className="text-slate-800 dark:text-slate-200 font-sans text-xs">TIN Profile:</strong> {taxInfo.tin}
                </p>
                <p className="text-gray-600 dark:text-slate-450">
                  <strong className="text-slate-800 dark:text-slate-200">Billing Address:</strong> {taxInfo.address}, {taxInfo.country}
                </p>
                <p className="text-emerald-600 font-bold">
                  Preferred Settlement Currency: {taxInfo.currency} (UGX)
                </p>
              </div>
            )}
          </div>

          {/* Section 7: Auto-Renew Parameters Toggle */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Auto-Renew Settings</h3>
            
            <div className="flex items-start gap-3">
              <input 
                id="auto-renew-checkbox"
                type="checkbox" 
                checked={autoRenew} 
                onChange={() => {
                  setAutoRenew(!autoRenew);
                  showToast("Parameter Toggled", `Auto-renew is now ${!autoRenew ? "Enabled" : "Disabled"}.`, "info");
                }}
                className="mt-1 accent-emerald-600 cursor-pointer w-4 h-4 rounded"
              />
              <div className="space-y-0.5">
                <label htmlFor="auto-renew-checkbox" className="text-xs font-bold text-gray-800 dark:text-slate-200 cursor-pointer">
                  Enable automatic renewal
                </label>
                <p className="text-[11px] text-gray-400">
                  Renew using: <strong className="text-emerald-700 dark:text-emerald-400">{paymentMethods.find(p => p.isPrimary)?.name || "MTN Mobile Money"}</strong>. We will trigger transaction prompts 24 hours prior to expiration.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1 text-xs">
              <button 
                onClick={() => setShowAddPaymentModal(true)}
                className="text-emerald-600 hover:underline font-bold"
              >
                Update payment method
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => {
                  setAutoRenew(false);
                  showToast("Disabled", "Auto-renew disabled. Standard manual override mode active.", "info");
                }}
                className="text-gray-500 hover:underline"
              >
                Disable auto-renew
              </button>
            </div>
          </div>

          {/* Section 8: Billing Alerts Notification Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">System Billing Alerts Preferences</h3>
            <p className="text-xs text-gray-500">Enable automated reminders for your accounting team</p>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.paymentSuccess}
                  onChange={() => setNotificationSettings({ ...notificationSettings, paymentSuccess: !notificationSettings.paymentSuccess })}
                  className="accent-emerald-600 rounded"
                />
                <span className="text-gray-700 dark:text-slate-300">Payment successful receipts</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.subscriptionExpiring}
                  onChange={() => setNotificationSettings({ ...notificationSettings, subscriptionExpiring: !notificationSettings.subscriptionExpiring })}
                  className="accent-emerald-600 rounded"
                />
                <span className="text-gray-700 dark:text-slate-300">Subscription expiring warning</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.failedPayment}
                  onChange={() => setNotificationSettings({ ...notificationSettings, failedPayment: !notificationSettings.failedPayment })}
                  className="accent-emerald-600 rounded"
                />
                <span className="text-gray-700 dark:text-slate-300">Failed mobile debit warning alerts</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.invoiceAvailable}
                  onChange={() => setNotificationSettings({ ...notificationSettings, invoiceAvailable: !notificationSettings.invoiceAvailable })}
                  className="accent-emerald-600 rounded"
                />
                <span className="text-gray-700 dark:text-slate-300">TIN Invoice PDF creation available</span>
              </label>
            </div>
          </div>

          {/* Section 9: Support Accordion & FAQs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle size={16} className="text-emerald-600" />
              Frequently Asked Billing Questions
            </h3>
            
            <div className="space-y-3">
              <details className="group text-xs border-b border-gray-100 dark:border-slate-800 pb-2 cursor-pointer">
                <summary className="font-bold text-slate-800 dark:text-slate-200 list-none flex justify-between items-center">
                  <span>How does MTN Mobile Money billing auto-renew?</span>
                  <ChevronDown size={12} className="group-open:rotate-180 transition transition-transform" />
                </summary>
                <p className="text-gray-500 mt-1.5 leading-relaxed">
                  We leverage authorized merchant-triggered collection tokens. Next time it executes, MTN registers an approval request on your phone device.
                </p>
              </details>

              <details className="group text-xs border-b border-gray-100 dark:border-slate-800 pb-2 cursor-pointer">
                <summary className="font-bold text-slate-800 dark:text-slate-200 list-none flex justify-between items-center">
                  <span>Can I request official tax receipts under Uganda TIN?</span>
                  <ChevronDown size={12} className="group-open:rotate-180 transition transition-transform" />
                </summary>
                <p className="text-gray-500 mt-1.5 leading-relaxed">
                  Yes, fill in your profile inside 'Tax Profiles' and subsequent system logs will print legal PDFs carrying stamped records.
                </p>
              </details>

              <details className="group text-xs pb-2 cursor-pointer">
                <summary className="font-bold text-slate-800 dark:text-slate-200 list-none flex justify-between items-center">
                  <span>What happens to patient data if plan expires?</span>
                  <ChevronDown size={12} className="group-open:rotate-180 transition transition-transform text-right" />
                </summary>
                <p className="text-gray-500 mt-1.5 leading-relaxed">
                  No records are deleted! Your health portal simply transitions back to the Free Plan limits until basic subscription triggers again.
                </p>
              </details>
            </div>

            <div className="flex gap-2 pt-2 border-t dark:border-slate-800">
              <button 
                onClick={() => {
                  showToast("Ticket Opened", "Reconciliation support ticket opened successfully with Kampala billing desk.", "success");
                }}
                className="w-1/2 border border-slate-205 text-slate-800 dark:text-slate-350 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-[10px] py-1.5 rounded-xl font-bold transition text-center"
              >
                File Dispute / Query
              </button>
              <button 
                onClick={() => setShowChatDrawer(true)}
                className="w-1/2 bg-slate-900 hover:bg-slate-950 text-white text-[10px] py-1.5 rounded-xl font-bold transition text-center"
              >
                Live Advisor Chat
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL 1: CANCELLATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-150 dark:border-slate-800 shadow-xl space-y-6 text-left">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertCircle size={24} />
              </div>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">Are you sure you want to cancel your Premium CareRefill allocation?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                By doing so, your health team will lose active SMS &amp; WhatsApp queues, automated clinic rosters, and inventory management options. Your Premium features will remain active until <strong className="text-slate-900 dark:text-white">{nextBillingDate}</strong>.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2 text-xs">
              <button 
                onClick={() => {
                  setShowCancelModal(false);
                  showToast("Safe", "Subscription remained active. Thank you for scaling care coverage!", "success");
                }}
                className="bg-slate-100 hover:bg-slate-205 text-slate-800 font-bold px-4 py-2.5 rounded-xl transition"
              >
                Keep Subscription
              </button>
              <button 
                onClick={() => {
                  setSubscriptionStatus("Cancelled");
                  setShowCancelModal(false);
                  showToast("Pending Cancellation Set", "Your billing was marked cancelled for July 21st.", "info");
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PAYMENT METHOD MODAL */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-150 dark:border-slate-800 shadow-xl space-y-6 text-left">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Configure New Payment Vault Method</h4>
              <button onClick={() => setShowAddPaymentModal(false)} className="text-gray-400 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-850 rounded-xl">
              <button 
                type="button"
                onClick={() => setNewPayType("MTN")}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${newPayType === "MTN" ? "bg-white dark:bg-slate-700 shadow-xs text-emerald-600" : "text-gray-500"}`}
              >
                MTN MoMo
              </button>
              
              <button 
                type="button"
                onClick={() => setNewPayType("Airtel")}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${newPayType === "Airtel" ? "bg-white dark:bg-slate-700 shadow-xs text-emerald-600" : "text-gray-500"}`}
              >
                Airtel Money
              </button>

              <button 
                type="button"
                onClick={() => setNewPayType("Card")}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${newPayType === "Card" ? "bg-white dark:bg-slate-700 shadow-xs text-emerald-600" : "text-gray-500"}`}
              >
                Credit Card
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="space-y-4">
              {(newPayType === "MTN" || newPayType === "Airtel") ? (
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">Mobile Registered Number</label>
                  <input 
                    type="tel"
                    placeholder="e.g. 077123456"
                    value={newPayPhone}
                    onChange={(e) => setNewPayPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-emerald-500 font-mono"
                    required
                  />
                  <p className="text-[10px] text-gray-500">We will trigger SMS merchant approval pop-ups to confirm this ledger setup.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">Card credentials</label>
                    <input 
                      type="text"
                      placeholder="**** **** **** 1290"
                      value={newCardNumber}
                      onChange={(e) => setNewCardNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">Expiry Month / Year</label>
                      <input 
                        type="text"
                        placeholder="MM/YY"
                        value={newCardExpiry}
                        onChange={(e) => setNewCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">CVV code</label>
                      <input 
                        type="password"
                        placeholder="***"
                        maxLength={3}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow-xs"
              >
                Register &amp; Approve Connection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INVOICE VIEWER */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-150 dark:border-slate-800 shadow-xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="text-emerald-600" size={20} />
                <span className="font-extrabold text-slate-800 dark:text-white">CareRefill Legal Invoice</span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-[10px] block">INVOICE NO:</span>
                  <span className="font-mono font-bold">{selectedInvoice.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">BILL DATE:</span>
                  <span>{selectedInvoice.date}</span>
                </div>
              </div>

              <div className="border bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-2">
                <span className="text-gray-400 text-[10px] block">RECIPIENT TAX DETAILS:</span>
                <p className="font-bold">{taxInfo.businessName}</p>
                <p className="font-mono">{taxInfo.tin}</p>
                <p className="text-gray-500">{taxInfo.address}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1.5 font-semibold text-gray-500">
                  <span>Usage Description</span>
                  <span className="text-right">Line Total</span>
                </div>
                
                <div className="flex justify-between">
                  <span>CareRefill {selectedInvoice.planName} SaaS Platform license fee</span>
                  <span className="text-right font-semibold">UGX {selectedInvoice.amount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Applied VAT (Exempted under regional rules)</span>
                  <span className="text-right">UGX 0</span>
                </div>

                <div className="flex justify-between border-t pt-2 font-black text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800 py-1.5 px-2 rounded-lg">
                  <span>Reconciled Settlement:</span>
                  <span>UGX {selectedInvoice.amount.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 leading-snug">
                Processed fully online via MTN Mobile Money. This e-slip acts as legal permission to claim medical SaaS tax reliefs of June 2026.
              </p>
            </div>

            <div className="flex gap-2 justify-end text-xs">
              <button 
                onClick={() => {
                  showToast("Invoice Printed", "Physical receipt queue sent successfully.", "success");
                  setSelectedInvoice(null);
                }}
                className="border px-3.5 py-2 rounded-lg hover:bg-slate-50 font-bold text-gray-700"
              >
                Print Slip
              </button>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="bg-slate-900 hover:bg-slate-950 text-white font-bold px-3.5 py-2 rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR DRAWER: BILLING LIVE CHAT HELP ADVISOR */}
      {showChatDrawer && (
        <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-slate-900 border-l border-slate-150 dark:border-slate-800 shadow-2xl z-55 flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-emerald-600 text-white">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <div>
                <h5 className="font-extrabold text-sm leading-none">Billing Assistant</h5>
                <span className="text-[10px] text-emerald-100">CareRefill Uganda billing desk</span>
              </div>
            </div>
            <button onClick={() => setShowChatDrawer(false)} className="text-emerald-100 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Drawer chat items list */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
            {chatHistory.map((chat, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-2xl max-w-[85%] ${
                  chat.role === "bot" ? "bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-zinc-200 self-start mr-auto" : "bg-emerald-500 text-slate-950 font-medium ml-auto text-right"
                }`}
              >
                <p className="leading-relaxed">{chat.text}</p>
              </div>
            ))}
          </div>

          {/* Drawer INPUT tools */}
          <form onSubmit={handleSendChatMessage} className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Ask about plan billing, refunds, or MTN..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
              />
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl"
              >
                Send
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 text-[10px] text-gray-500 justify-start">
              <button 
                type="button" 
                onClick={() => setChatMessage("How to apply coupons")}
                className="hover:underline bg-white dark:bg-slate-800 border px-1.5 py-0.5 rounded"
              >
                Coupons
              </button>
              <button 
                type="button" 
                onClick={() => setChatMessage("MTN Mobile money refunds")}
                className="hover:underline bg-white dark:bg-slate-800 border px-1.5 py-0.5 rounded"
              >
                Refunds
              </button>
              <button 
                type="button" 
                onClick={() => setChatMessage("Save tax profile TIN")}
                className="hover:underline bg-white dark:bg-slate-800 border px-1.5 py-0.5 rounded"
              >
                TIN Receipt
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
