
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TripDetails, UserProfile, SearchResult } from "../types";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Helper to format trip details for prompts
const formatTrip = (trip: TripDetails) => `
  Main Destination: ${trip.mainDestination}
  Other Countries: ${trip.otherCountries.join(', ') || 'None'}
  Dates: ${trip.startDate} to ${trip.endDate}
  Purpose: ${trip.purpose}
  Budget: €${trip.budget}
  Supporting Documents Available: ${trip.documents.length > 0 ? trip.documents.map(d => `${d.type} (${d.name})`).join(', ') : 'None'}
`;

const formatProfile = (profile: UserProfile) => `
  Name: ${profile.fullName}
  Date of Birth: ${profile.dateOfBirth}
  Citizenship: ${profile.citizenship}
  Passport Number: ${profile.passportNumber}
  Occupation: ${profile.occupation}
  Residence City: ${profile.residenceCity}
  Bank: ${profile.bankName}
  Travel Companions: ${profile.companions && profile.companions.length > 0 
    ? profile.companions.map(c => `
      - ${c.fullName} (Relation: ${c.relationship})
        DOB: ${c.dateOfBirth}
        Citizenship: ${c.citizenship}
        Passport: ${c.passportNumber}
        Occupation: ${c.occupation}
    `).join('\n') 
    : 'None'}
`;

// Helper for exponential backoff retry on rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryOperation<T>(operation: () => Promise<T>, retries = 5, delayMs = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Inspect error structure deeply for 429/Resource Exhausted/503 Service Unavailable
    const status = error?.status || error?.response?.status || error?.code;
    const message = error?.message || error?.error?.message || '';
    
    const isRateLimit = 
        status === 429 || 
        status === 503 ||
        status === 'RESOURCE_EXHAUSTED' || 
        (typeof message === 'string' && (
          message.includes('429') || 
          message.includes('quota') || 
          message.includes('RESOURCE_EXHAUSTED')
        )) ||
        error?.error?.code === 429 ||
        error?.error?.status === 'RESOURCE_EXHAUSTED';

    if (isRateLimit && retries > 0) {
      // Add jitter to delay to prevent thundering herd
      const jitter = Math.random() * 1000;
      const waitTime = delayMs + jitter;
      console.warn(`Gemini API Busy/Rate Limited (Status: ${status}). Retrying in ${Math.round(waitTime)}ms... (Retries left: ${retries})`);
      
      await delay(waitTime);
      // Exponential backoff
      return retryOperation(operation, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

const handleApiError = (error: any, defaultMsg: string) => {
    // Use warn instead of error to reduce console noise for expected operational errors
    console.warn("API Request Failed:", JSON.stringify(error, null, 2));
    
    const status = error?.status || error?.response?.status || error?.code;
    const message = error?.message || error?.error?.message || '';

    const isRateLimit = 
        status === 429 || 
        status === 'RESOURCE_EXHAUSTED' || 
        (typeof message === 'string' && (
          message.includes('429') || 
          message.includes('quota')
        )) ||
        error?.error?.code === 429 ||
        error?.error?.status === 'RESOURCE_EXHAUSTED';

    if (isRateLimit) {
        return `
### ⚠️ High Traffic Volume

We are currently experiencing very high demand or you have reached your free tier usage limit.

**Please try the following:**
1. **Wait 30-60 seconds** and try again.
2. If you are using a free API key, you may have hit the minute-level rate limit.
`;
    }
    return `⚠️ ${defaultMsg}`;
};

/**
 * Generates a detailed itinerary using Gemini 3 Pro with Thinking Mode.
 * High complexity reasoning required for logical travel plans.
 */
export const generateItinerary = async (trip: TripDetails, profile: UserProfile): Promise<string> => {
  const prompt = `
    Create a detailed, daily itinerary for a Schengen visa application.
    It must be logical, realistic, and formatted as a clear document.
    
    Traveler Details:
    ${formatProfile(profile)}
    
    Trip Details:
    ${formatTrip(trip)}
    
    Include specific landmarks, transport methods between cities, and accommodation placeholders.
    The tone should be professional and formal, suitable for a visa officer to review.
    Format the output in Markdown.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    }));
    return response.text || "Failed to generate itinerary.";
  } catch (error) {
    return handleApiError(error, "An error occurred while generating the itinerary. Please try again.");
  }
};

/**
 * Generates a formal Cover Letter using Gemini 2.5 Flash.
 * Standard generation task.
 */
export const generateCoverLetter = async (trip: TripDetails, profile: UserProfile): Promise<string> => {
  const prompt = `
    Write a formal Schengen visa cover letter addressed to the Consulate of ${trip.mainDestination}.
    
    Applicant:
    ${formatProfile(profile)}
    
    Trip:
    ${formatTrip(trip)}
    
    The letter should:
    1. State the purpose of travel clearly.
    2. Outline the itinerary briefly.
    3. Confirm that the applicant will cover all expenses and return to their home country.
    4. Mention enclosed documents based on the "Supporting Documents Available" list provided above.
    5. Be polite and professional.
    
    Return ONLY the letter text in Markdown format.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    }));
    return response.text || "Failed to generate cover letter.";
  } catch (error) {
    return handleApiError(error, "An error occurred while generating the cover letter.");
  }
};

/**
 * Generates a No Objection Certificate (NOC) using Gemini 2.5 Flash.
 */
export const generateNoc = async (
  trip: TripDetails, 
  profile: UserProfile, 
  organizationName: string, 
  signerName: string, 
  signerRole: string, 
  type: 'Employee' | 'Student'
): Promise<string> => {
  const prompt = `
    Write a formal No Objection Certificate (NOC) for a Schengen Visa application.
    
    Type: ${type === 'Employee' ? 'Employment NOC / Leave Letter' : 'Student NOC / Leave Letter'}
    
    Organization/School Name: ${organizationName}
    Signatory: ${signerName}, ${signerRole}
    
    Applicant:
    ${formatProfile(profile)}
    
    Trip:
    ${formatTrip(trip)}
    
    Requirements:
    1. The letter must be on the organization's letterhead (use placeholder [LETTERHEAD]).
    2. Explicitly state the applicant has been granted leave for the trip dates.
    3. Confirm the applicant is expected to return to work/study after the trip.
    4. State there is no objection to them traveling to ${trip.mainDestination} and other Schengen countries.
    
    Format as a professional document in Markdown.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    }));
    return response.text || "Failed to generate NOC.";
  } catch (error) {
    return handleApiError(error, "An error occurred while generating the NOC.");
  }
};

/**
 * Generates a Sponsorship Letter.
 */
export const generateSponsorshipLetter = async (
  trip: TripDetails, 
  profile: UserProfile, 
  sponsorName: string, 
  sponsorRelation: string, 
  sponsorStatus: string
): Promise<string> => {
  const prompt = `
    Write a formal Sponsorship Letter for a Schengen Visa application.
    
    Sponsor:
    Name: ${sponsorName}
    Relationship to Applicant: ${sponsorRelation}
    Financial Status/Occupation: ${sponsorStatus}
    
    Applicant:
    ${formatProfile(profile)}
    
    Trip:
    ${formatTrip(trip)}
    
    Requirements:
    1. The sponsor confirms they are bearing all expenses (travel, accommodation, medical, etc.) for the applicant.
    2. Mention the sponsor's ability to support (e.g., "I am employed as... and have sufficient funds").
    3. Confirm the applicant will return home.
    4. Format as a formal letter signed by the sponsor.
    
    Format as a professional document in Markdown.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    }));
    return response.text || "Failed to generate sponsorship letter.";
  } catch (error) {
    return handleApiError(error, "An error occurred while generating the sponsorship letter.");
  }
};

/**
 * Checks Visa Requirements using Gemini 2.5 Flash with Google Search.
 * Requires real-time data.
 */
export const checkVisaRequirements = async (citizenship: string, destination: string): Promise<SearchResult> => {
  const prompt = `
    What are the specific Schengen visa requirements for a citizen of ${citizenship} traveling to ${destination}?
    Find the official visa fee, processing time, and a list of required documents (e.g., insurance coverage amount, bank statement months).
    Also check if a biometrics appointment is needed.
    Provide the information in a structured Markdown list.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }));

    const text = response.text || "No requirements found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      url: chunk.web?.uri || '',
      title: chunk.web?.title || 'Source'
    })).filter((s: any) => s.url) || [];

    return { text, sources };
  } catch (error: any) {
    const msg = handleApiError(error, "Could not fetch requirements at this time.");
    return { text: msg, sources: [] };
  }
};

/**
 * Finds insurance recommendations.
 */
export const getInsuranceOptions = async (citizenship: string, destination: string): Promise<SearchResult> => {
  const prompt = `
    Find top 3 reliable travel medical insurance providers for a Schengen visa application for a citizen of ${citizenship} traveling to ${destination}.
    
    Requirements:
    - Must adhere to the minimum €30,000 coverage.
    - Must cover repatriation.
    - Look for policies that offer a refund certificate in case of visa rejection.
    
    Output:
    - List providers with key pros/cons.
    - Explicitly mention their "Visa Rejection Refund" policy if found.
    - Provide estimated costs if available.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }));

    const text = response.text || "No insurance information found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      url: chunk.web?.uri || '',
      title: chunk.web?.title || 'Source'
    })).filter((s: any) => s.url) || [];

    return { text, sources };
  } catch (error: any) {
    const msg = handleApiError(error, "Could not fetch insurance options.");
    return { text: msg, sources: [] };
  }
};

/**
 * Checks flight ticket requirements (dummy vs paid).
 */
export const getFlightRequirements = async (destination: string): Promise<SearchResult> => {
  const prompt = `
    Search for the specific flight ticket requirements for the Schengen visa consulate of ${destination}.
    
    Find out:
    1. Does this specific consulate accept flight reservations (itineraries) or do they strictly require fully paid tickets?
    2. What is their official stance on "dummy tickets" or "flight reservations for visa purposes"?
    3. Provide advice on how to minimize financial risk (e.g., fully refundable tickets, holding services).
    
    Be specific about ${destination}'s recent policies.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }));

    const text = response.text || "No flight requirement information found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      url: chunk.web?.uri || '',
      title: chunk.web?.title || 'Source'
    })).filter((s: any) => s.url) || [];

    return { text, sources };
  } catch (error: any) {
    const msg = handleApiError(error, "Could not fetch flight requirements.");
    return { text: msg, sources: [] };
  }
};

/**
 * Finds bank statement links.
 */
export const getBankStatementInfo = async (bankName: string, country: string): Promise<SearchResult> => {
  const prompt = `
    Find the official online banking login page or specific instruction page to download bank statements for "${bankName}" in ${country}.
    
    Objective: Help a user download their last 3-6 months statement for a visa application.
    
    Output:
    - Provide the direct link to the internet banking login or statement download help page.
    - Briefly list the steps to find the statement after logging in (if available publicly).
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }));

    const text = response.text || "No bank information found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      url: chunk.web?.uri || '',
      title: chunk.web?.title || 'Source'
    })).filter((s: any) => s.url) || [];

    return { text, sources };
  } catch (error: any) {
    const msg = handleApiError(error, "Could not fetch bank details.");
    return { text: msg, sources: [] };
  }
};

/**
 * Finds nearest Visa Center.
 */
export const getVisaCenterInfo = async (originCity: string, destinationCountry: string): Promise<SearchResult> => {
  const prompt = `
    Find the nearest Schengen visa application center (VFS Global, BLS International, TLScontact, or Embassy/Consulate) for ${destinationCountry} closest to ${originCity}.
    
    Output:
    - Name of the specific center (e.g., "VFS Global New Delhi").
    - Address of the center.
    - Website link to book an appointment.
    - Opening hours if available.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }));

    const text = response.text || "No visa center information found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      url: chunk.web?.uri || '',
      title: chunk.web?.title || 'Source'
    })).filter((s: any) => s.url) || [];

    return { text, sources };
  } catch (error: any) {
    const msg = handleApiError(error, "Could not fetch visa center details.");
    return { text: msg, sources: [] };
  }
};

/**
 * Chat Assistant using Gemini 3 Pro.
 * General helper.
 */
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      history: history,
      config: {
        systemInstruction: "You are a helpful, knowledgeable Schengen Visa expert assistant. Keep answers concise and accurate.",
      }
    });

    const result = await retryOperation<GenerateContentResponse>(() => chat.sendMessage({ message }));
    return result.text || "";
  } catch (error) {
    return handleApiError(error, "I'm having trouble connecting to the visa database right now.");
  }
};

/**
 * Predicts Visa Success Probability using Gemini 2.5 Flash with Search Grounding.
 */
export const predictVisaProbability = async (trip: TripDetails, profile: UserProfile): Promise<SearchResult> => {
  const prompt = `
    Act as a Schengen Visa Expert Analyst.
    Analyze this application profile:
    ${formatProfile(profile)}
    
    Trip Details:
    ${formatTrip(trip)}
    
    Task:
    1. Search for the latest visa rejection rates for citizens of ${profile.citizenship} applying to ${trip.mainDestination} (historical data).
    2. Analyze the strength of the profile (budget vs duration, occupation stability, document completeness).
    3. Provide a "Success Probability" score (0-100%) based on this data.
    4. List top 3 Strengths and top 3 Risks/Weaknesses.
    
    Output format: Markdown.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }));

    const text = response.text || "Could not calculate probability.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      url: chunk.web?.uri || '',
      title: chunk.web?.title || 'Source'
    })).filter((s: any) => s.url) || [];

    return { text, sources };
  } catch (error: any) {
    const msg = handleApiError(error, "Could not predict probability.");
    return { text: msg, sources: [] };
  }
};

/**
 * Validates a Visa Photo using Gemini 2.5 Flash (Multimodal).
 */
export const validateVisaPhoto = async (base64Image: string): Promise<string> => {
  const prompt = `
    You are a strict Schengen Visa Compliance Officer.
    Analyze this uploaded photo against official ICAO / Schengen biometric photo requirements.
    
    Check the following strictly:
    1. Background: Must be plain light/grey. (Pass/Fail)
    2. Facial Expression: Neutral, mouth closed, looking directly at camera. (Pass/Fail)
    3. Lighting: Even lighting, no shadows on face or background. (Pass/Fail)
    4. Accessories: No glasses glare, no headwear (unless religious), face fully visible. (Pass/Fail)
    5. Quality: Sharp, clear, high resolution. (Pass/Fail)
    
    Final Verdict: APPROVED or REJECTED.
    Provide a brief explanation for any failures.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      }
    }));
    return response.text || "Could not analyze photo.";
  } catch (error) {
    return handleApiError(error, "Error analyzing photo.");
  }
};

/**
 * Generates a "Virtual Travel" image using Gemini 2.5 Flash Image (Nano Banana).
 * Places the user in the destination country.
 */
export const generateVirtualTravelImage = async (base64UserImage: string, destination: string): Promise<string> => {
  const prompt = `
    Edit this image to place the person in front of the most famous and iconic tourist landmark in ${destination}.
    The composition should look like a souvenir travel photo. 
    Ensure lighting on the person matches the environment of the landmark.
    Make it look realistic and fun.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64UserImage } },
          { text: prompt }
        ]
      }
    }));
    
    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return ""; // No image generated
  } catch (error) {
    console.warn(error);
    return ""; // Fail silently or handle in UI
  }
};

/**
 * Validates quality of a supporting document using Gemini 2.5 Flash.
 */
export const validateDocumentQuality = async (file: File): Promise<string> => {
    // Convert file to base64 for the API
    const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const prompt = `
      Analyze this document scan for quality suitable for a formal visa application.
      
      Check for:
      1. Legibility: Is the text sharp and readable?
      2. Completeness: Are all 4 corners visible or is important info cut off?
      3. Obstructions: Is there glare, shadows, or blur?
      
      Provide a short 2-sentence assessment. 
      Start with "PASS:" or "FAIL:".
    `;
  
    try {
      const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            { inlineData: { mimeType: file.type === 'application/pdf' ? 'application/pdf' : 'image/jpeg', data: base64Data } },
            { text: prompt }
          ]
        }
      }));
      return response.text || "Could not analyze document.";
    } catch (error) {
      return handleApiError(error, "Error analyzing document quality.");
    }
  };
