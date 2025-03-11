import { NextApiRequest, NextApiResponse } from 'next';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from 'dotenv';

config();

const tavilySearch = new TavilySearchResults({
});

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

        news statement to verify: ${query}

        You are an advanced AI specializing in detecting fake news. Your task is to analyze the given web-scraped information and determine its credibility based on trusted sources.
    
        Instructions:
        - if you dont find any legitimate info in web scraped information supporting the human input, return false information, dont think too much.
        - Carefully evaluate the provided content for authenticity.
        - check if the statement is legit strictly in current time.
        - Compare the claims with verifiable sources.
        - Assign a fake news probability percentage (e.g., "Fake News Probability: 70%").
        - Justify your assessment with key supporting reasons.
        
        Web-Scraped Information:
        {results}
        
        Analysis:
        - Fake News Probability: [Provide percentage]
        - web sources used to conclude: [web links]
        
        Final Verdict:
        
        `
    });
    

    const llmChain = new LLMChain({ llm, prompt });
    const summary = await llmChain.invoke({ results: searchResults });
    return summary;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("API======");
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const result = await searchAndSummarize(query);
        return res.status(200).json({ query, result });
    } catch (error:any) {
        console.log(error);
        
        return res.status(500).json({ error: error.message });
    }
}