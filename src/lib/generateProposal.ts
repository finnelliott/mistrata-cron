if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable not set.');
  }
import GeneratedProposal from "@/types/generatedProposal";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateProposal({
  item,
  profile,
  proposal_format,
  work_samples
} : {
  item: string, profile: string, proposal_format: string, work_samples: string
}) {
    const openai = new OpenAIApi(configuration);
    try {
      const completion = await openai.createChatCompletion({
        "model": "gpt-3.5-turbo-0613",
        "messages": [
          {
            "role": "system",
            "content": `The user has the following profile: ${profile}`
          },
          {
            "role": "user",
            "content": JSON.stringify(item)
          }
        ],
        "functions": [
          {
            "name": "generate_proposal",
            "description": "This function is used to generate a proposal to the job they've provided. The proposal is based on the job description, their profile, work samples, and desired proposal format.",
            "parameters": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "A short and descriptive title for the job. No more than 50 characters."
                },
                "suitability": {
                  "type": "string",
                  "description": "An indication of how suitable the user is for the job. This should be one of the following: 'Suitable', 'Unsuitable', 'Maybe Suitable'. Only return 'Suitable' if they meet the majority of the requirements for the job. "
                },
                "proposal": {
                  "type": "string",
                  "description": `Optimistically generate a proposal for the job. 
                  ---
                  Use the the following format: 
                  ${proposal_format}
                  ---
                  Include relevant links to the user's work from the following list:
                  ${work_samples}
                  `
                },
                "unsuitability_reasoning": {
                  "type": "string",
                  "description": "If there are any concerns about the users suitability for the job, provide a brief explanation of why."
                },
                "job_summary": {
                  "type": "string",
                  "description": "A detailed, and easily readable summary of the job description including location, payment and technologies involved."
                },
                "job_url": {
                  "type": "string",
                  "description": "The URL of the job description."
                },
                "unit": {
                  "type": "string"
                }
              },
              "required": [
                "suitability",
                "proposal",
                "job_summary",
                "job_url"
              ]
            }
          },
        ],
        function_call: {
          name: 'generate_proposal',
        }
      });
      const args = completion.data.choices[0].message?.function_call?.arguments
      if (args) {
        return JSON.parse(args) as GeneratedProposal;
      } else {
        return undefined;
      }
    } catch (err: any) {
      console.error('Error in generateProposal:', err.message);
    }
}