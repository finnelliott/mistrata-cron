if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable not set.');
}

import { Configuration, OpenAIApi } from "openai";
import setup from "@/data/setup";

const profile = setup.gzlegal.profile;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function checkIfIsGZSuitable(item: string) {
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
            "name": "checkIfIsGZSuitable",
            "description": "This function is used to generate a proposal to the job they've provided. The proposal is based on the job description, their profile, work samples, and desired proposal format.",
            "parameters": {
              "type": "object",
              "properties": {
                "is_suitable": {
                  "type": "boolean",
                  "description": "Does the job describe services which the user can provide?"
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
                "is_suitable",
                "job_summary",
                "job_url"
              ]
            }
          },
        ],
        function_call: {
          name: 'checkIfIsGZSuitable',
        }
      });
      const args = completion.data.choices[0].message?.function_call?.arguments
      if (args) {
        return JSON.parse(args);
      } else {
        return undefined;
      }
    } catch (err: any) {
      console.error('Error in checkIfIsGZSuitable:', err.message);
    }
}