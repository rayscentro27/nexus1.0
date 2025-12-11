
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { Contact, NegativeItem, FinancialSpreading, Investor, Lender, RiskAlert, Grant, Course, CreditMemo, Review } from "../types";

// Initialize the client using Vite environment variables safely
// Cast import.meta to any to avoid type issues if types aren't perfect, and safeguard against missing env object
const meta = import.meta as any;
const env = meta.env || {};
const apiKey = env.VITE_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const EMAIL_SIGNATURE = `Best regards,

John Doe
Sales Manager
Nexus Funding Inc.
www.nexusfunding.com`;

export const batchScoreLeads = async (contacts: Contact[]): Promise<any[]> => {
  if (!ai) return [];
  
  // Create a simplified version of contacts to save tokens and focus AI attention
  const simplifiedContacts = contacts.map(c => ({
    id: c.id,
    company: c.company,
    industry: c.businessProfile?.industry || 'Unknown',
    revenue: c.revenue || 0,
    timeInBusiness: c.timeInBusiness || 0,
    creditScore: c.creditAnalysis?.score || 'Unknown',
    lastContact: c.lastContact,
    fundingGoal: c.fundingGoal?.targetAmount || 0
  }));

  const prompt = `
    Act as a senior underwriter. Score these business leads from 0-100 based on their likelihood to get funded.
    
    Scoring Criteria:
    - Revenue: >$10k/mo is good.
    - Time in Business: >6 months is preferred.
    - Credit Score: >600 is preferred.
    - Industry: High risk (trucking, construction) is harder but possible.
    - Recency: If last contact was >30 days ago, lower the score significantly (cold lead).
    
    Return a JSON array of objects. Each object must have:
    - id: The contact ID provided.
    - score: Number 0-100.
    - priority: 'Hot', 'Warm', or 'Cold'.
    - reason: A short 1-sentence explanation of the score.

    Leads to Analyze:
    ${JSON.stringify(simplifiedContacts)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const json = JSON.parse(response.text || "[]");
    return Array.isArray(json) ? json : [];
  } catch (e) {
    console.error("Lead Scoring Error", e);
    return [];
  }
};

export const generateCreditMemo = async (contact: Contact): Promise<CreditMemo | null> => {
  if (!ai) return null;
  
  // Construct context
  const revenue = contact.financialSpreading?.months.reduce((acc, m) => acc + m.revenue, 0) || 0;
  const avgRevenue = contact.financialSpreading?.months.length ? revenue / contact.financialSpreading.months.length : contact.revenue || 0;
  const expenses = contact.financialSpreading?.months.reduce((acc, m) => acc + m.expenses, 0) || 0;
  const avgExpenses = contact.financialSpreading?.months.length ? expenses / contact.financialSpreading.months.length : 0;
  
  const prompt = `
    Generate a formal Credit Approval Memo (CAM) for a business loan.
    
    Borrower: ${contact.company}
    Industry: ${contact.businessProfile?.industry || 'Unknown'}
    Time in Business: ${contact.timeInBusiness} months
    Avg Monthly Revenue: $${avgRevenue.toFixed(2)}
    Avg Monthly Expenses: $${avgExpenses.toFixed(2)}
    Credit Score: ${contact.creditAnalysis?.score || 'N/A'}
    Key Notes: ${contact.notes || ''}
    
    Return a JSON object with:
    - summary: A professional underwriting narrative describing the business and deal.
    - strengths: Array of 3 key strengths (e.g. cash flow, longevity).
    - weaknesses: Array of 3 risks.
    - mitigants: Array of 3 mitigating factors for the risks.
    - metrics: Object with { dscr: number, monthlyFreeCashFlow: number }.
    - recommendation: 'Approve' | 'Decline' | 'Conditional'.
    - conditions: String describing any stipulations needed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const json = JSON.parse(response.text || "{}");
    
    // Fill in default ID/Dates
    return {
        id: `cam_${Date.now()}`,
        dateCreated: new Date().toLocaleDateString(),
        contactId: contact.id,
        ...json
    } as CreditMemo;
  } catch (e) {
    console.error("Credit Memo Gen Error", e);
    return null;
  }
};

export const generateDailyBriefing = async (contacts: Contact[]): Promise<string> => {
  if (!ai) return "AI Briefing Unavailable: API Key missing.";
  try {
    // Determine stale leads
    const staleContacts = contacts.filter(c => {
        if (!c.lastContact) return false;
        if (c.status === 'Closed') return false;
        if (c.lastContact.includes('days ago')) {
            const days = parseInt(c.lastContact.split(' ')[0]);
            return days > 14;
        }
        const date = new Date(c.lastContact);
        if (!isNaN(date.getTime())) {
            const diffTime = Math.abs(new Date().getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 14;
        }
        return false;
    });

    const prompt = `
      Analyze these CRM contacts and provide a daily executive briefing.
      
      Identify top 3 priorities based on Deal Value and Status.
      
      RISK RADAR:
      You have ${staleContacts.length} stale leads (inactive > 14 days).
      List the top 2 stale leads by value and suggest a specific re-engagement hook for each (e.g. "Send rate update", "Ask about seasonal needs").
      
      Contacts Summary: ${JSON.stringify(contacts.map(c => ({ name: c.name, status: c.status, value: c.value, lastContact: c.lastContact, notes: c.notes })))}
      
      End with a short motivational quote for sales.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No briefing available.";
  } catch (e) {
    console.error(e);
    return "Unable to generate briefing.";
  }
};

export const generateEmailDraft = async (contact: Contact, topic: string): Promise<string> => {
  if (!ai) return "AI Unavailable.";
  try {
    const prompt = `
      Write a professional email to ${contact.name} from ${contact.company}.
      Topic: ${topic}
      Context: Last contact was ${contact.lastContact}. Notes: ${contact.notes}.
      Keep it concise and persuasive.
      Signature: ${EMAIL_SIGNATURE}
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (e) {
    return "Error drafting email.";
  }
};

export const analyzeDealRisks = async (contact: Contact): Promise<string> => {
  if (!ai) return "AI Unavailable.";
  try {
    const prompt = `
      Analyze this deal for underwriting risks.
      Company: ${contact.company}
      Time in Business: ${contact.timeInBusiness} months
      Revenue: ${contact.revenue}
      Credit Score: ${contact.creditAnalysis?.score || 'Unknown'}
      
      List 3 potential risks and 3 mitigating factors.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analysis unavailable.";
  } catch (e) {
    return "Error analyzing deal.";
  }
};

export const generateSalesScript = async (contact: Contact, scenario: string): Promise<string> => {
  if (!ai) return "Script Generator Unavailable.";
  const prompt = `Generate a sales script for calling ${contact.name} at ${contact.company}. Scenario: ${scenario}. Info: ${contact.notes}.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return "Script generation failed."; }
};

export const predictCommonObjections = async (contact: Contact): Promise<string[]> => {
  if (!ai) return ["Rates are too high", "I don't need capital", "Send me an email"];
  
  const prompt = `
    Analyze this lead and predict 3 specific sales objections they might raise during a cold call for business funding.
    
    Lead Profile:
    - Industry: ${contact.businessProfile?.industry || 'Unknown'}
    - Time in Business: ${contact.timeInBusiness} months
    - Monthly Revenue: $${contact.revenue || 0}
    - Credit Score: ${contact.creditAnalysis?.score || 'Unknown'}
    
    Return ONLY a JSON array of 3 short string objections (max 10 words each).
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const json = JSON.parse(response.text || "[]");
    return Array.isArray(json) ? json : ["I'm busy", "Not interested", "Rates too high"];
  } catch (e) { 
    return ["I'm busy", "Not interested", "Rates too high"]; 
  }
};

export const generateObjectionResponse = async (contact: Contact, objection: string): Promise<string> => {
  if (!ai) return "Response Unavailable.";
  
  const industry = contact.businessProfile?.industry || 'Business';
  const revenue = contact.revenue ? `$${contact.revenue.toLocaleString()}` : 'Unknown';
  
  const prompt = `
    Act as a world-class sales closer.
    Target: ${contact.name}, ${contact.company}
    Industry: ${industry}
    Revenue: ${revenue}
    
    Objection: "${objection}"
    
    Provide 3 powerful rebuttals:
    1. The "Feel, Felt, Found" Approach (Empathy)
    2. The Logical ROI Approach (Using their revenue/industry data)
    3. The Challenger Approach (Polite pushback)
    
    Keep it conversational and ready to read aloud.
  `;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return "Response generation failed."; }
};

export const generateWhatsAppMessage = async (contact: Contact, context: string): Promise<string> => {
  if (!ai) return `Hi ${contact.name}, regarding ${context}...`;
  const prompt = `
    Draft a short, casual WhatsApp message to ${contact.name}.
    Context: ${context}.
    Rules:
    - Keep it under 2 sentences.
    - Use 1-2 friendly emojis.
    - NO hashtags.
    - NO subject lines.
    - Sound like a text message sent from a mobile phone.
    - Do not use quotation marks.
  `;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return ""; }
};

export const chatWithCRM = async (input: string, contacts: Contact[]): Promise<any> => {
  if (!ai) return { text: "I'm sorry, I cannot process your request at the moment.", actions: [] };
  
  try {
    const context = contacts.map(c => {
      const goal = c.fundingGoal ? `$${c.fundingGoal.targetAmount.toLocaleString()} for ${c.fundingGoal.fundingType}` : 'Not set';
      const credit = c.creditAnalysis ? `Score: ${c.creditAnalysis.score}, Utilization: ${c.creditAnalysis.utilization}%, Inquiries: ${c.creditAnalysis.inquiries}, Status: ${c.creditAnalysis.status}` : 'Not analyzed';
      const recentActivity = c.activities && c.activities.length > 0 
        ? c.activities.slice(0, 5).map(a => `[${a.date}] ${a.type}: ${a.description}`).join('; ')
        : 'None';
      
      const revenue = c.revenue ? `$${c.revenue.toLocaleString()}/mo` : 'Unknown';
      const age = c.timeInBusiness ? `${c.timeInBusiness} months` : 'Unknown';

      return `
Client: ${c.name} (${c.company})
- Status: ${c.status} | Value: $${c.value.toLocaleString()}
- Revenue: ${revenue} | Age: ${age}
- Last Contact: ${c.lastContact}
- Funding Goal: ${goal}
- Credit Profile: ${credit}
- Key Notes: ${c.notes || 'None'}
- Recent Interactions: ${recentActivity}
      `.trim();
    }).join('\n---\n');

    const prompt = `
      You are an elite CRM AI Co-Pilot for a business funding brokerage.
      Your goal is to help the admin manage leads, identify risks, and close deals.

      CRM DATA CONTEXT:
      ${context}
      
      User Query: "${input}"

      Instructions:
      1. ANALYZE: Use the specific financial data (Credit Scores, Funding Goals, Revenue, Time in Business) to provide precise answers.
      2. PRIORITIZE: If asked to "Rank" or "Prioritize", weigh Deal Value, Revenue, and Credit Score to determine the best opportunities.
      3. RISK ASSESSMENT: If asked about "Risks", flag low credit scores (<600), high utilization, recent inquiries, or stale contact dates (>14 days).
      4. HISTORY: Use "Recent Interactions" to provide context on the last touchpoint.
      5. ACTIONABLE: Be professional, concise, and direct.
      
      If the user wants to perform an action (like "update status" or "add note"), confirm what should be done in your response.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return { text: response.text || "I couldn't find an answer to that.", actions: [] };
  } catch (e) {
    console.error(e);
    return { text: "Sorry, I encountered an error processing your request.", actions: [] };
  }
};

export const extractFinancialsFromDocument = async (base64Data: string, mimeType: string): Promise<FinancialSpreading | null> => {
  if (!ai) return null;
  
  const prompt = `
    Analyze this bank statement image/PDF.
    Extract monthly totals for Deposits (Revenue), Withdrawals (Expenses), Ending Balance, NSF Count, and Negative Days.
    
    Return JSON format:
    {
      "months": [
        {
          "month": "Jan 2024",
          "revenue": 0,
          "expenses": 0,
          "endingBalance": 0,
          "nsfCount": 0,
          "negativeDays": 0
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }
      ],
      config: { responseMimeType: "application/json" }
    });

    const json = JSON.parse(response.text || "{}");
    
    return {
      months: json.months || [],
      lastUpdated: new Date().toISOString()
    };

  } catch (e) {
    console.error("Financial Extraction Error", e);
    return null;
  }
};

export const generateDisputeLetter = async (contact: Contact, bureau: string, items: NegativeItem[], attackMethod?: string): Promise<string> => {
  if (!ai) return "AI Unavailable.";
  
  const itemsText = items.filter(i => i.isSelected && i.bureau === bureau).map(i => 
    `${i.creditor} (Account: ${i.accountNumber}): ${i.reasonForDispute}`
  ).join('\n');

  const prompt = `
    Write a formal credit dispute letter to ${bureau}.
    Strategy: ${attackMethod || 'Factual'}
    
    Sender:
    ${contact.name}
    ${contact.businessProfile?.address || 'Address on file'}
    
    Items to Dispute:
    ${itemsText}
    
    Instructions:
    - Use strict legal language citing FCRA (Fair Credit Reporting Act).
    - Demand verification of the debts.
    - Be firm but professional.
  `;

  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "Error generating letter.";
  } catch (e) {
    return "Error generating letter.";
  }
};

export const generateCampaignSequence = async (targetAudience: string, goal: string): Promise<{ subject: string; body: string }[]> => {
  if (!ai) return [];

  const prompt = `
    Create a 3-email marketing drip campaign sequence.
    
    Target Audience: ${targetAudience}
    Goal: ${goal}
    
    Return a JSON array of objects with 'subject' and 'body' properties.
    The tone should be professional, persuasive, and empathetic to business owners' needs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Campaign Gen Error", e);
    return [];
  }
};

export const generateStrategyFromContent = async (title: string, notes: string): Promise<string> => {
  if (!ai) return "AI Unavailable";
  const prompt = `Based on the video/content titled "${title}" with notes: "${notes}", generate a checklist of actionable steps for a business owner to improve their credit or funding odds.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return "Error generating strategy."; }
};

export const refineNoteContent = async (text: string): Promise<string> => {
  if (!ai) return text;
  const prompt = `Refine and summarize this sales note into a professional CRM entry: "${text}"`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || text;
  } catch (e) { return text; }
};

export const analyzeContract = async (base64: string): Promise<any> => {
  if (!ai) return null;
  const prompt = `Analyze this funding contract. Extract safety score (0-100), true APR, recommendation (Sign/Negotiate/Walk Away), summary, and risks. Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'application/pdf', data: base64 } }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
};

export const generateWorkflowFromPrompt = async (promptText: string): Promise<any> => {
  if (!ai) return {};
  const prompt = `Create a CRM workflow rule based on: "${promptText}". Return JSON matching PipelineRule interface (name, trigger, conditions, actions).`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return {}; }
};

export const enrichLeadData = async (company: string, website: string): Promise<any> => {
  if (!ai) return null;
  const prompt = `Enrich lead data for company "${company}" website "${website}". Provide CEO, phone, revenue estimate, industry, description, 2 icebreakers, and sources. Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", tools: [{googleSearch: {}}] } 
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
};

export const generateMeetingPrep = async (contact: Contact): Promise<any> => {
  if (!ai) return null;
  const prompt = `Prepare a meeting dossier for ${contact.name} at ${contact.company}. Include summary, predicted objections, icebreakers, and goal. Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
};

export const processMeetingDebrief = async (transcript: string): Promise<any> => {
  if (!ai) return null;
  const prompt = `Analyze this meeting transcript: "${transcript}". Extract a summary note, suggested status update, and draft a follow-up email. Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
};

export const analyzeDealStructure = async (financials: FinancialSpreading, amount: number): Promise<any> => {
  if (!ai) return null;
  const prompt = `Analyze these financials: ${JSON.stringify(financials)}. Loan Amount: ${amount}. Determine max approval, risk assessment, and generate 3 options (Conservative, Moderate, Aggressive). Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
};

export const generateAnalyticsInsights = async (contacts: Contact[]): Promise<string> => {
  if (!ai) return "Analysis unavailable.";
  const summary = contacts.map(c => ({ status: c.status, value: c.value, revenue: c.revenue })).slice(0, 50); 
  const prompt = `Analyze this CRM data summary: ${JSON.stringify(summary)}. Provide strategic insights on pipeline health, revenue forecast, and areas for improvement. Keep it concise.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return ""; }
};

export const analyzeInboxMessage = async (content: string): Promise<any> => {
  if (!ai) return { tags: [], priority: 'Low', sentiment: 'Neutral' };
  const prompt = `Analyze this message: "${content}". Return JSON with tags, priority (High/Medium/Low), and sentiment.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return { tags: [], priority: 'Low', sentiment: 'Neutral' }; }
};

export const generateSmartReplies = async (messages: any[]): Promise<string[]> => {
  if (!ai) return [];
  const context = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
  const prompt = `Generate 3 short smart replies for this conversation:\n${context}\nReturn JSON array of strings.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateBusinessPlanSection = async (section: string, data: any): Promise<string> => {
  if (!ai) return "";
  const prompt = `Write the ${section} for a business plan. Company: ${data.companyName}, Industry: ${data.industry}. Context: ${JSON.stringify(data)}.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return ""; }
};

export const generateLegalDocumentContent = async (type: string, context: any, promptText: string): Promise<string> => {
  if (!ai) return "";
  const prompt = `Draft content for a ${type}. Context: ${JSON.stringify(context)}. Instructions: ${promptText}.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return ""; }
};

export const searchPlaces = async (query: string): Promise<any> => {
  if (!ai) return { places: [], text: "" };
  const prompt = `Find 5 business leads for query: "${query}". Return JSON with places (title, address, rating, url) and a summary text.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", tools: [{googleSearch: {}}] }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return { places: [], text: "" }; }
};

export const generateLandingPageCopy = async (industry: string, offer: string): Promise<any> => {
  if (!ai) return {};
  const prompt = `Generate high-converting landing page copy for ${industry} offering ${offer}. Return JSON with headline, subhead, benefits (array), and buttonText.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return {}; }
};

export const analyzeCompetitors = async (company: string, industry: string, location: string): Promise<any> => {
  if (!ai) return null;
  const prompt = `Analyze competitors for ${company} in ${industry}, ${location}. Return JSON with competitors list (name, strengths, weaknesses), fundingAngles, digitalGap, and swot analysis.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", tools: [{googleSearch: {}}] }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
};

export const parseLenderGuidelines = async (base64: string): Promise<any> => {
  if (!ai) return null;
  const prompt = `Extract lender criteria from this rate sheet. Return JSON with minScore, minRevenue, minTimeInBusinessMonths, maxAmount, and matchCriteria (restrictedIndustries, maxTermMonths).`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'application/pdf', data: base64 } }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
};

export const extractStipsFromText = async (text: string): Promise<any[]> => {
  if (!ai) return [];
  const prompt = `Extract required documents (stipulations) from this text: "${text}". Return JSON array of objects with name and description.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const res = JSON.parse(response.text || "[]");
    return Array.isArray(res) ? res.map((r: any) => ({ ...r, id: `stip_${Date.now()}_${Math.random()}`, status: 'Pending' })) : [];
  } catch (e) { return []; }
};

export const verifyDocumentContent = async (base64: string, mimeType: string, expectedType: string, context: any): Promise<any> => {
  if (!ai) return { isMatch: false, confidence: 0, reason: "AI Error" };
  const prompt = `Verify if this document is a valid "${expectedType}" for ${context.company}. Return JSON with isMatch (bool), confidence (0-100), and reason.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType, data: base64 } }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return { isMatch: false, confidence: 0, reason: "Processing Error" }; }
};

export const generateRenewalPitch = async (deal: any, contact: Contact): Promise<string> => {
  if (!ai) return "";
  const prompt = `Write a renewal pitch email for ${contact.company}. They have paid down ${deal.paymentsMade} payments on their ${deal.lenderName} loan.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return ""; }
};

export const generateRescuePlan = async (contact: Contact): Promise<any> => {
  if (!ai) return null;
  const prompt = `
    Analyze this declined deal and create a rescue plan.
    Company: ${contact.company}
    Credit Score: ${contact.creditAnalysis?.score || 'Unknown'}
    Revenue: ${contact.revenue || 'Unknown'}
    
    Identify diagnosis (Why declined?), dealKillers (List of issues with High/Medium/Low impact), prescription (Step by step recovery plan), probability (0-100), and estimatedRecoveryTime.
    Return JSON.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return null; }
};

export const generateInvestorReport = async (investor: Investor, syndications: any[]): Promise<string> => {
  if (!ai) return "";
  const prompt = `
    Write a monthly performance update email for an investor.
    Investor: ${investor.name}
    Total Deployed: $${investor.totalDeployed}
    Active Deals: ${investor.activeDeals}
    Context: Deals are performing well, steady daily repayments.
    
    Include a summary table logic in text format.
  `;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return ""; }
};

export const generateApplicationCoverLetter = async (contact: Contact, lenderName: string, lenderCriteria?: any): Promise<string> => {
  if (!ai) return "";
  
  const prompt = `
    Write a persuasive cover letter to a lender for a business funding application.
    
    Lender: ${lenderName}
    Applicant: ${contact.company}
    Revenue: $${contact.revenue?.toLocaleString()}/mo
    Time in Business: ${contact.timeInBusiness} months
    Credit Score: ${contact.creditAnalysis?.score || 'N/A'}
    
    Highlights to mention:
    - Strong cash flow
    - Consistent daily balances
    - Explaining any recent NSFs (if any) as one-time anomalies
    
    Tone: Professional, confident, and underwriter-friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Error generating cover letter.";
  } catch (e) {
    return "Error generating cover letter.";
  }
};

export const generateSocialVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string | null> => {
  if (!ai) return null;
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
        resolution: '720p'
      }
    });

    // Polling for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    // The URI is a download link, usually requires the key appended or authorized fetch
    return videoUri ? `${videoUri}&key=${apiKey}` : null;

  } catch (e) {
    console.error("Veo Video Gen Error:", e);
    return null;
  }
};

export const generateSocialCaption = async (platform: string, topic: string): Promise<string> => {
  if (!ai) return `Check out this new post about ${topic}!`;
  
  const prompt = `
    Write a high-engagement social media caption for ${platform} about: "${topic}".
    
    Guidelines:
    - Tone: Professional but engaging, suitable for business funding/finance audience.
    - Include relevant hashtags at the end.
    - If platform is LinkedIn, make it slightly longer and thought-leadership focused.
    - If platform is TikTok/Instagram, keep it punchy with hook.
    - No quotation marks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "";
  } catch (e) {
    return `Exciting news about ${topic}! #business #funding`;
  }
};

export const analyzeRiskEvent = async (event: RiskAlert): Promise<any> => {
  if (!ai) return { recommendation: "Investigate immediately.", severity: "Medium" };
  const prompt = `
    Analyze this risk event for a funding client:
    Type: ${event.type}
    Description: ${event.description}
    Date: ${event.date}
    
    Determine:
    1. Severity (Critical/High/Medium/Low)
    2. Recommended Action (e.g. "Freeze Funding", "Call Client", "Send Legal Notice")
    3. Potential Impact
    
    Return JSON.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { recommendation: "Review manually", severity: "Medium" };
  }
};

export const findGrants = async (businessType: string): Promise<Grant[]> => {
  if (!ai) return [];
  const prompt = `
    Search for 3 active business grants relevant to a "${businessType}" business.
    Return a JSON array of objects with: name, provider, amount (number), deadline (string), description, requirements (array of strings), and url (placeholder URL if not found).
    Focus on grants that are currently open or recurring.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        tools: [{googleSearch: {}}]
      }
    });
    const res = JSON.parse(response.text || "[]");
    return Array.isArray(res) ? res.map((g: any) => ({ ...g, id: `grant_${Date.now()}_${Math.random()}`, status: 'Identified', matchScore: 85 })) : [];
  } catch (e) { return []; }
};

export const draftGrantAnswer = async (question: string, context: { company: string; industry: string; revenue: string; founded: string }, grantName: string): Promise<string> => {
  if (!ai) return "AI Unavailable";
  const prompt = `
    Draft a high-quality answer for a grant application question.
    
    Grant: ${grantName}
    Applicant: ${context.company} (Industry: ${context.industry})
    Context: Revenue $${context.revenue}, Founded ${context.founded}
    Question: "${question}"
    
    Instructions:
    - Be persuasive and impactful.
    - Focus on growth and community impact.
    - Use clear, professional language.
  `;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
  } catch (e) { return "Error generating answer."; }
};

export const generateCourseCurriculum = async (topic: string, audience: string): Promise<Course | null> => {
  if (!ai) return null;
  const prompt = `
    Create a detailed video course curriculum about: "${topic}".
    Target Audience: ${audience}.
    
    Return a JSON structure:
    {
      "title": "Course Title",
      "description": "Short description",
      "modules": [
        {
          "title": "Module Title",
          "desc": "Module Description",
          "lessons": [
            { "title": "Lesson Title", "duration": "10 min", "description": "What will be covered" }
          ]
        }
      ]
    }
    Include at least 2 modules with 2 lessons each.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const json = JSON.parse(response.text || "{}");
    // Add IDs
    json.id = `course_${Date.now()}`;
    json.modules = json.modules.map((m: any, i: number) => ({
        ...m,
        id: `mod_${Date.now()}_${i}`,
        lessons: m.lessons.map((l: any, j: number) => ({
            ...l,
            id: `les_${Date.now()}_${i}_${j}`,
            completed: false,
            link: '#'
        }))
    }));
    return json as Course;
  } catch (e) { return null; }
};

export const generateCollectionsMessage = async (contactName: string, daysOverdue: number, amount: number): Promise<string> => {
  if (!ai) return "Payment is overdue. Please remit immediately.";
  
  const tone = daysOverdue > 30 ? "Urgent & Legal" : daysOverdue > 10 ? "Firm" : "Friendly Reminder";
  
  const prompt = `
    Write a collections message (Email/SMS) for ${contactName}.
    Overdue: ${daysOverdue} days.
    Amount Due: $${amount}.
    Tone: ${tone}.
    
    Instructions:
    - Be compliant with debt collection laws (professional, no threats).
    - Provide a clear call to action (Pay Now link).
    - If > 30 days, mention potential escalation to legal/reporting.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Error generating message.";
  } catch (e) {
    return "Payment overdue.";
  }
};

export const generateMockGoogleReviews = async (businessName: string): Promise<Review[]> => {
  if (!ai) return [];
  
  const prompt = `
    Generate 5 realistic Google Business reviews for a business named "${businessName}".
    Include a mix of ratings (mostly positive 4-5 stars, maybe one 3 star).
    
    Return a JSON array of objects with the following structure:
    {
      "contactName": "Reviewer Name",
      "rating": number (1-5),
      "comment": "Review text",
      "date": "Relative date string (e.g. '2 days ago', '1 week ago')"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const json = JSON.parse(response.text || "[]");
    
    // Map to full Review type
    return json.map((r: any, i: number) => ({
      id: `mock_rev_${Date.now()}_${i}`,
      source: 'Google',
      status: 'Pending',
      company: businessName, // For context in CRM
      ...r
    }));
  } catch (e) {
    console.error("Mock Review Gen Error", e);
    return [];
  }
};

export const analyzeReviewSentiment = async (reviews: Review[]): Promise<any> => {
  if (!ai || reviews.length === 0) return null;
  
  const reviewsText = reviews.map(r => `(${r.rating} stars) "${r.comment}"`).join('\n');
  
  const prompt = `
    Analyze these customer reviews:
    ${reviewsText}
    
    Return a JSON object with:
    {
      "positiveKeywords": ["keyword1", "keyword2"],
      "negativeKeywords": ["keyword1", "keyword2"],
      "summary": "Brief summary of sentiment",
      "recommendedAction": "One actionable tip to improve reputation"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};

export const generateReviewReply = async (review: Review): Promise<string> => {
  if (!ai) return "Thank you for your feedback.";
  
  const prompt = `
    Write a professional and polite response to this Google Review for a business.
    
    Reviewer: ${review.contactName}
    Rating: ${review.rating} Stars
    Comment: "${review.comment}"
    
    Guidelines:
    - If positive: Thank them warmly and reinforce value.
    - If negative: Apologize for their experience, show empathy, and offer to take it offline (provide email support@nexus.funding).
    - Keep it short (under 50 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "";
  } catch (e) {
    return "Thank you for your feedback.";
  }
};

export const analyzeDocumentForensics = async (base64Data: string): Promise<any> => {
  if (!ai) return null;

  const prompt = `
    Analyze this financial document image for signs of fraud or tampering.
    Look for:
    1. Font inconsistencies or alignment issues.
    2. Mathematical errors (do running balances match transaction history?).
    3. Metadata anomalies or visible editing artifacts.
    4. Suspicious keywords like "insufficient funds" or "returned item".

    Return a JSON object:
    {
      "trustScore": number (0-100, where 100 is trustworthy),
      "riskLevel": "Low" | "Medium" | "High" | "Critical",
      "flags": [
        { "issue": "Description of issue", "severity": "High/Medium/Low" }
      ],
      "mathCheck": "Pass" | "Fail",
      "summary": "Brief analysis summary."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/png', data: base64Data } } // Defaulting to PNG for simplicity, usually detection logic checks mime
          ]
        }
      ],
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Forensics Error", e);
    return null;
  }
};
