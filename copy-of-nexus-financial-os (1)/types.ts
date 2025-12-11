
import React from 'react';

export interface FundingGoal {
  targetAmount: number;
  targetDate: string;
  fundingType: 'Business Line of Credit' | 'SBA Loan' | 'Equipment Financing' | 'Corporate Credit Cards' | 'Term Loan' | 'Real Estate Investment' | 'Other';
}

export interface BusinessFundingInfo {
  fundingType: 'Business Line of Credit' | 'SBA Loan' | 'Equipment Financing' | 'Corporate Credit Cards' | 'Term Loan' | 'Real Estate Investment' | 'Other';
  amount: number;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Invoice {
  id: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  description: string;
}

export interface Expense {
  id: string;
  vendor: string;
  amount: number;
  category: 'Software' | 'Marketing' | 'Personnel' | 'Office' | 'Legal' | 'Other';
  frequency: 'One-time' | 'Monthly' | 'Yearly';
  date: string;
  status: 'Paid' | 'Pending' | 'Scheduled';
  description?: string;
}

export interface CreditAnalysis {
  analyzedDate: string;
  score: number;
  utilization: number;
  inquiries: number;
  derogatoryMarks: number;
  openAccounts: number;
  status: 'Clean' | 'Repair Needed' | 'Optimized';
  extractedName?: string;
  extractedAddress?: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: 'Legal' | 'Financial' | 'Credit' | 'Identification' | 'Other' | 'Contract';
  status: 'Verified' | 'Pending Review' | 'Rejected' | 'Missing' | 'Signed';
  uploadDate?: string;
  fileUrl?: string;
  required?: boolean;
  isEsed?: boolean;
}

export interface Lender {
  id: string;
  name: string;
  logo: string;
  type: 'Fintech' | 'Bank' | 'Credit Union' | 'SBA';
  minScore: number;
  minRevenue: number;
  minTimeInBusinessMonths: number;
  maxAmount: number;
  description: string;
  applicationLink: string;
  matchCriteria?: {
    restrictedIndustries: string[];
    maxTermMonths: number;
    minAvgDailyBalance: number;
    maxNSFs: number;
    requiresCollateral: boolean;
  };
  lastUpdated?: string;
}

export interface CreditCardProduct {
  id: string;
  name: string;
  issuer: string;
  network: 'Visa' | 'Mastercard' | 'Amex';
  minScore: number;
  bureauPulled: 'Experian' | 'Equifax' | 'TransUnion' | 'Unknown';
  annualFee: number;
  introOffer: string;
  applicationLink: string;
  recommendedFor: string;
}

export interface ClientTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  date: string;
  type: 'upload' | 'action' | 'review' | 'education' | 'meeting';
  link?: string;
  linkedToGoal?: boolean;
  dependencies?: string[];
  checklistId?: string;
  meetingTime?: string;
}

export interface ReferralLead {
  id: string;
  name: string;
  status: 'Signed Up' | 'Funded' | 'Stalled';
  date: string;
  commission: number;
}

export interface ReferralStats {
  totalClicks: number;
  totalSignups: number;
  commissionPending: number;
  commissionPaid: number;
  referralLink: string;
  leads: ReferralLead[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'success' | 'alert' | 'info';
}

export interface FinancialMonth {
  month: string;
  revenue: number;
  expenses: number;
  endingBalance: number;
  nsfCount: number;
  negativeDays: number;
}

export interface FinancialSpreading {
  months: FinancialMonth[];
  lastUpdated: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'system';
  description: string;
  date: string;
  user?: string;
}

export interface BusinessProfile {
  legalName: string;
  dba?: string;
  taxId: string;
  structure: 'LLC' | 'C-Corp' | 'S-Corp' | 'Sole Prop' | 'Partnership';
  industry: string;
  ownershipPercentage: number;
  establishedDate: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export interface CampaignStep {
  id: string;
  type: 'email' | 'sms' | 'task' | 'wait';
  content?: string;
  subject?: string;
  delayDays?: number;
  order: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Paused';
  trigger: 'Lead Created' | 'Status: Stale' | 'Manual' | 'Tag: Investor';
  enrolledCount: number;
  steps: CampaignStep[];
}

export interface SocialPost {
  id: string;
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Facebook' | 'Twitter';
  prompt: string;
  videoUrl?: string;
  caption?: string;
  aspectRatio: '16:9' | '9:16';
  status: 'Draft' | 'Generating' | 'Ready' | 'Posted' | 'Scheduled';
  dateCreated: string;
}

export interface NegativeItem {
  id: string;
  creditor: string;
  accountNumber: string;
  bureau: string;
  status: string;
  dateReported: string;
  reasonForDispute?: string;
  isSelected: boolean;
}

export interface FundingOffer {
  id: string;
  lenderName: string;
  amount: number;
  term: string;
  rate: string;
  payment: string;
  paymentAmount: number;
  status: 'Sent' | 'Accepted' | 'Rejected' | 'Negotiating';
  dateSent: string;
  stips?: string;
  signature?: string;
  signedDate?: string;
  aiAnalysis?: {
    safetyScore: number;
    trueApr: number;
    recommendation: 'Sign' | 'Negotiate' | 'Walk Away';
    summary: string;
    risks: { clause: string; description: string; type: 'Critical' | 'Warning' }[];
  };
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'Repayment' | 'Draw' | 'Funding' | 'Interest' | 'Fee';
  amount: number;
  description: string;
  status: 'Posted' | 'Pending';
}

export interface BankAccount {
  id: string;
  institutionName: string;
  last4: string;
  status: 'Connected' | 'Error';
  lastSynced: string;
  balance: number;
}

export interface Subscription {
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'Active' | 'Cancelled' | 'Past Due';
  renewalDate: string;
  price: number;
  features: string[];
}

export interface ComplianceRecord {
  kycStatus: 'Not Started' | 'Pending' | 'Verified' | 'Flagged';
  kybStatus: 'Not Started' | 'Pending' | 'Verified' | 'Flagged';
  ofacCheck: 'Pending' | 'Clear' | 'Match Found';
  lastCheckDate: string;
  riskScore: 'Low' | 'Medium' | 'High';
  flags: string[];
}

export interface Stipulation {
  id: string;
  name: string;
  description?: string;
  status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
  uploadDate?: string;
  fileUrl?: string;
  aiVerification?: {
    isMatch: boolean;
    confidence: number;
    reason: string;
  };
}

export interface FundedDeal {
  id: string;
  lenderName: string;
  fundedDate: string;
  originalAmount: number;
  currentBalance: number;
  termLengthMonths: number;
  paymentFrequency: string;
  paymentAmount: number;
  totalPayback: number;
  status: 'Active' | 'Paid Off' | 'Default';
  renewalEligibleDate: string;
  paymentsMade: number;
}

export interface BusinessPlan {
  id: string;
  companyName: string;
  lastUpdated: string;
  sections: {
    executiveSummary: string;
    companyOverview: string;
    marketAnalysis: string;
    productsServices: string;
    marketingStrategy: string;
    financialPlan: string;
  };
}

export interface RescuePlan {
  diagnosis: string;
  dealKillers: { issue: string; impact: 'High' | 'Medium' | 'Low' }[];
  prescription: { step: string; timeframe: string }[];
  approvalProbability: number;
  estimatedRecoveryTime: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  totalCommitted: number;
  totalDeployed: number;
  activeDeals: number;
  status: 'Active' | 'Inactive';
}

export interface Syndication {
  id: string;
  contactId: string;
  dealAmount: number;
  syndicatedAmount: number;
  managementFee: number;
  participants: {
    investorId: string;
    investorName: string;
    amount: number;
    ownershipPercentage: number;
  }[];
}

export interface ApplicationSubmission {
  id: string;
  contactId: string;
  contactName: string;
  lenderId: string;
  lenderName: string;
  status: 'Draft' | 'Sent' | 'Received' | 'Underwriting' | 'Offer' | 'Declined';
  dateSent: string;
  coverLetter: string;
  notes?: string;
}

export interface Review {
  id: string;
  contactName: string;
  company: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  source: 'Google' | 'Trustpilot' | 'Internal';
  status: 'Replied' | 'Pending';
  reply?: string;
}

export interface FundingFlowStep {
  id: string;
  label: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Locked';
  type: 'qualification' | 'llc' | 'application' | 'invoice';
}

export interface CommissionProfile {
  id: string;
  agentName: string;
  splitPercentage: number; // e.g. 40
  totalFunded: number;
  totalCommissionEarned: number;
  currentDrawBalance: number;
}

export interface PayoutRecord {
  id: string;
  agentId: string;
  dealId: string;
  dealValue: number;
  grossCommission: number; // Revenue to house
  splitAmount: number; // Agent's cut
  drawDeduction: number;
  netPayout: number;
  status: 'Pending' | 'Paid';
  date: string;
}

export interface RiskAlert {
  id: string;
  contactId: string;
  contactName: string;
  type: 'UCC Filing' | 'Lawsuit' | 'Lien' | 'Judgment' | 'Inquiry';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  date: string;
  status: 'Active' | 'Resolved' | 'Ignored';
  source: string;
}

export interface Grant {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string;
  description: string;
  status: 'Identified' | 'Drafting' | 'Submitted' | 'Won' | 'Lost';
  matchScore: number;
  requirements: string[];
  url: string;
  notes?: string;
  applicationDraft?: Record<string, string>; // Question -> Answer
}

// LMS Types
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  link: string; // Video URL
  description?: string;
}

export interface Module {
  id: string;
  title: string;
  desc: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  thumbnail?: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  status: 'Posted' | 'Failed' | 'Pending';
  method: 'ACH' | 'Wire' | 'Credit Card';
}

export interface ActiveLoan {
  id: string;
  contactId: string;
  contactName: string;
  principal: number;
  paybackAmount: number;
  balance: number;
  termMonths: number;
  startDate: string;
  paymentFrequency: 'Daily' | 'Weekly' | 'Monthly';
  paymentAmount: number;
  status: 'Current' | 'Late' | 'Default' | 'Paid Off';
  missedPayments: number;
  payments: LoanPayment[];
}

export interface CreditMemo {
  id: string;
  dateCreated: string;
  contactId: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  mitigants: string[];
  metrics: {
    dscr: number;
    ltv?: number;
    monthlyFreeCashFlow: number;
  };
  recommendation: 'Approve' | 'Decline' | 'Conditional';
  conditions: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Lead' | 'Active' | 'Closed' | 'Negotiation';
  lastContact: string;
  notes?: string;
  value: number;
  revenue?: number;
  timeInBusiness?: number;
  source: string;
  checklist: Record<string, boolean>;
  clientTasks: ClientTask[];
  documents?: ClientDocument[];
  fundingGoal?: FundingGoal;
  invoices?: Invoice[];
  creditAnalysis?: CreditAnalysis;
  fundingHistory?: BusinessFundingInfo[];
  referralData?: ReferralStats;
  notifications?: Notification[];
  financialSpreading?: FinancialSpreading;
  activities?: Activity[]; 
  businessProfile?: BusinessProfile;
  messageHistory?: Message[]; 
  negativeItems?: NegativeItem[];
  activeCampaigns?: string[];
  
  // Extended Properties
  offers?: FundingOffer[];
  ledger?: LedgerEntry[];
  connectedBanks?: BankAccount[];
  subscription?: Subscription;
  compliance?: ComplianceRecord;
  stipulations?: Stipulation[];
  fundedDeals?: FundedDeal[];
  businessPlan?: BusinessPlan;
  rescuePlan?: RescuePlan;
  syndication?: Syndication;
  submissions?: ApplicationSubmission[];
  riskAlerts?: RiskAlert[];
  grants?: Grant[];
  activeLoan?: ActiveLoan;
  creditMemo?: CreditMemo;
  
  // AI Lead Scoring
  aiScore?: number;
  aiReason?: string;
  aiPriority?: 'Hot' | 'Warm' | 'Cold';
}

export interface Message {
  id: string;
  sender: 'client' | 'admin' | 'system';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'partner';
  contactId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
  ipAddress: string;
}

export interface SocialAccount {
  id: string;
  platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'TikTok' | 'YouTube';
  handle: string;
  connected: boolean;
}

export interface PipelineRule {
  id: string;
  name: string;
  isActive: boolean;
  trigger: {
    type: 'status_change' | 'document_uploaded' | 'offer_accepted' | 'lead_stale';
    value?: string;
  };
  conditions: {
    field: 'deal_value' | 'credit_score' | 'industry';
    operator: 'gt' | 'lt' | 'equals';
    value: any;
  }[];
  actions: {
    type: 'create_task' | 'send_email' | 'notify_admin';
    params: {
      title?: string;
      subject?: string;
      body?: string;
      message?: string;
    };
  }[];
}

export interface SalesSession {
  id: string;
  date: string;
  scenario: string;
  duration: string;
  score: number;
  feedback: string;
}

export interface EnrichedData {
  company: string;
  description: string;
  industry: string;
  ceo?: string;
  phone?: string;
  address?: string;
  revenue?: string;
  icebreakers: string[];
  sources: { title: string; url: string }[];
}

export interface UnifiedMessage {
  id: string;
  threadId: string;
  sender: 'client' | 'me' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
  channel: 'email' | 'sms' | 'whatsapp';
  direction: 'inbound' | 'outbound';
  read: boolean;
  aiTags?: string[];
  priority?: 'Low' | 'Medium' | 'High';
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface InboxThread {
  id: string;
  contactId?: string;
  contactName: string;
  contactAvatar: string;
  subject?: string;
  unreadCount: number;
  channel: 'email' | 'sms' | 'whatsapp';
  messages: UnifiedMessage[];
  lastMessage: UnifiedMessage;
}

export interface VoiceAgentConfig {
  id: string;
  name: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  openingLine: string;
  systemInstruction: string;
  knowledgeBase: string;
  isActive: boolean;
}

export interface CallLog {
  id: string;
  caller: string;
  duration: string;
  date: string;
  status: 'Completed' | 'Missed' | 'Voicemail';
  outcome: string;
  transcriptSummary: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: 'Legal' | 'Contract' | 'Other';
  variables: string[];
  content: string;
}

export interface LeadForm {
  id: string;
  name: string;
  industry: string;
  themeColor: string;
  headline: string;
  subhead: string;
  benefits: string[];
  fields: ('name' | 'email' | 'phone' | 'company' | 'revenue' | 'timeInBusiness')[];
  buttonText: string;
  totalSubmissions: number;
}

export interface MarketReport {
  competitors: { name: string; strengths: string[]; weaknesses: string[] }[];
  fundingAngles: string[];
  digitalGap: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export interface AgencyBranding {
  name: string;
  primaryColor: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  CRM = 'CRM',
  INBOX = 'INBOX',
  PORTAL = 'PORTAL',
  RESOURCES = 'RESOURCES',
  SETTINGS = 'SETTINGS',
  SIGNUP = 'SIGNUP',
  REVIEW_QUEUE = 'REVIEW_QUEUE',
  PARTNERS = 'PARTNERS',
  LOGIN = 'LOGIN',
  MARKETING = 'MARKETING',
  CLIENT_LANDING = 'CLIENT_LANDING',
  LANDING = 'LANDING',
  POWER_DIALER = 'POWER_DIALER',
  SALES_TRAINER = 'SALES_TRAINER',
  VOICE_RECEPTIONIST = 'VOICE_RECEPTIONIST',
  LEAD_MAP = 'LEAD_MAP',
  FORM_BUILDER = 'FORM_BUILDER',
  MARKET_INTEL = 'MARKET_INTEL',
  LENDERS = 'LENDERS',
  DOC_GENERATOR = 'DOC_GENERATOR',
  RENEWALS = 'RENEWALS',
  CALENDAR = 'CALENDAR',
  AUTOMATION = 'AUTOMATION',
  SYNDICATION = 'SYNDICATION',
  SUBMITTER = 'SUBMITTER',
  REPUTATION = 'REPUTATION',
  FUNDING_FLOW = 'FUNDING_FLOW',
  EXPENSES = 'EXPENSES',
  COMMISSIONS = 'COMMISSIONS',
  RISK_MONITOR = 'RISK_MONITOR',
  LEADERBOARD = 'LEADERBOARD',
  GRANTS = 'GRANTS',
  COURSE_BUILDER = 'COURSE_BUILDER',
  SERVICING = 'SERVICING',
  CREDIT_MEMO = 'CREDIT_MEMO'
}
