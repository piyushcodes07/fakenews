import { NextApiRequest, NextApiResponse } from 'next';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from 'dotenv';
import Twilio from "twilio";
import { log } from 'node:console';

config();

// Initialize Tavily Search
const tavilySearch = new TavilySearchResults({});

// Initialize Twilio Client
const twilioClient = Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function searchAndSummarize(query: string) {
    const searchResults = await tavilySearch.invoke(query);
    const llm = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0,
        maxOutputTokens: 1000,
        maxRetries: 2,
    });

    const prompt = new PromptTemplate({
        inputVariables: ["results"],
        template: `
        News statement to verify: ${query}

        You are an AI specializing in detecting fake news. Analyze the given web-scraped information and determine credibility based on trusted sources.

        Instructions:
        - mention fake news probability in very start of your response 
        - If no legitimate info supports the statement, return false information.
        - Evaluate the content carefully for authenticity.
        - Check if the statement is legit in the current time.
        - Compare the claims with verifiable sources.
        - Assign a fake news probability percentage (e.g., "Fake News Probability: 70%").
        - Provide a brief explanation.

        Web-Scraped Information:
        {results}

        Analysis:
        - Fake News Probability: [Provide percentage]
        - Web sources used: [web links]

        Final Verdict:
        `
    });

    const llmChain = new LLMChain({ llm, prompt });
    const summary = await llmChain.invoke({ results: searchResults });

    return summary;
}

async function sendSMS(phone: string, message: string) {
    try {
        const response = await twilioClient.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: phone,
        });
        console.log("SMS sent successfully:", response.sid);
        return response;
    } catch (error: any) {
        console.error("Error sending SMS:", error.message);
        throw new Error("Failed to send SMS");
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("API Called: Verifying News");

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query, phone } = req.body;
    console.log(phone,query)
    if (!query || !phone) {
        return res.status(400).json({ error: 'Query and phone number are required' });
    }

    try {
        // Get fake news verification result
        const result = await searchAndSummarize(query);
        console.log("===========================resulkt======================================")
        
        console.log(result.text)
        // Format the result for SMS (Shortened)
        const smsMessage = `News Check Result:
        Query: "${query}"
        Fake News Probability:${result.text.slice(0,100)}
        Verdict: See full analysis online.`;

        // Send SMS
        await sendSMS(phone, smsMessage);

        return res.status(200).json({ query, result, sms: "Sent Successfully" });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
