import { CreditAnalysis } from "../types";

// Simulates the time taken to process a file
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processCreditReport = async (file: File): Promise<CreditAnalysis> => {
  console.log(`Processing file: ${file.name}`);

  // STAGE 1: Upload (Simulated)
  await delay(1500);

  // STAGE 2: PII Redaction (Simulated logic based on the prompt's request)
  // In a real app, this would use a backend script (like the Python repo provided) to scrub data.
  console.log("Sanitizing: Removing Name, SSN, Address, Employer History...");
  await delay(2000);

  // STAGE 3: External Tool Analysis
  console.log("Sending sanitized blob to Credit-App Engine...");
  await delay(2000);

  // STAGE 4: Return Mock Analysis Results
  // This mimics what the tool would return after parsing the report
  const mockAnalysis: CreditAnalysis = {
    analyzedDate: new Date().toISOString().split('T')[0],
    score: 685, // Simulating a score that needs some work
    utilization: 42, // High utilization (needs to be <30%)
    inquiries: 5, // A bit high
    derogatoryMarks: 2, // Needs dispute
    openAccounts: 8,
    status: 'Repair Needed',
    extractedName: "Alice Freeman", // Mock extracted name
    extractedAddress: "123 Tech Blvd, Silicon Valley, CA" // Mock extracted address
  };

  return mockAnalysis;
};