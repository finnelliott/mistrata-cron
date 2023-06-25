import { Parser } from 'xml2js';
import { Resend } from 'resend';
import { Configuration, OpenAIApi } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable not set.');
}

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable not set.');
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const resend = new Resend(process.env.RESEND_API_KEY);

async function fetchFeedData(feedUrl: string) {
  const response = await fetch(feedUrl);
  const xmlData = await response.text();
  const parser = new Parser();
  const jsonData = await parser.parseStringPromise(xmlData);
  return jsonData.rss.channel[0].item;
}

function filterNewItems(items: any[], interval: number) {
  const currentDate = new Date();
  return items.filter(item => {
    const itemDate = new Date(item.pubDate[0]);
    const timeDifference = currentDate.getTime() - itemDate.getTime();
    return timeDifference <= interval;
  });
}

async function checkForNewItems(feedUrl: string, interval: number) {
  try {
    const items = await fetchFeedData(feedUrl);
    const newItems = filterNewItems(items, interval);
    for (const item of newItems) {
      await checkSuitability(item);
    }
  } catch (error) {
    console.error('Error in checkForNewItems:', error);
  }
}

async function checkSuitability(item: string) {
  try {
    const completion = await openai.createChatCompletion({
      "model": "gpt-3.5-turbo-0613",
      "messages": [
        {
          "role": "system",
          "content": `The user has the following profile:
---
**Educational Background:**

- Pate's Grammar School: 3 As in Maths, Economics, and Psychology
- University of Bath: BSc in Business Administration

**Work Experience:**

1. Vita Coco, London (Innovation Intern)
   - Worked with design and marketing teams to apply new branding to over 30 SKUs
   - Conducted tasks related to bringing a new product to market, including sourcing suppliers, taste testing, shelf life testing, and cost forecasting
   - Presented work by external lawyers regarding packaging claims to the head of marketing and managing director

2. Capita Scaling Partner (Origination Analyst)
   - Outreach and initial meetings with startup founders
   - Organisation and marketing of online ‘Dragon’s Den-style’ pitching events
   - Financial modelling of investment opportunities and presenting findings to partners

3. Freelance Web Designer & Developer
   - Web Development (Next.js, MongoDB, Prisma, TailwindCSS, Vercel)
   - Design (Figma) & SEO (SEMRush)
   - Experience with common web builders (Webflow, Squarespace, Wix)
   - Third-party integrations (Stripe, Mailchimp, Resend, Hubspot, Clerk, OpenAI, Stability AI, Google APIs, Payload CMS, Prismic)

**Project Management:**

- Familiar with Notion, Trello, and Monday
- Primarily works through email

**Marketing:**

- Platforms: Google Ads, Facebook Ads, SEMRush, Instagram, Facebook, Twitter
- Adobe Suite: Photoshop, Illustrator, Premier Pro
- Full marketing service for clients, including ad strategy, creation and optimisation, content creation, and social media management

**Sales & Business Development:**

- Founder of a profitable inter-city travel and events company for students
- Identified market gap, sold-out events, negotiated with event organisers and travel companies, and built a custom e-ticketing solution

**Graphic Design & Multimedia Production:**

- Heavy use of Figma as a web designer
- Experience with Illustrator

**Writing & Copywriting:**

- Content creation for landing pages of businesses as a web designer
- Focus on clear copy that highlights benefits rather than features

**Research:**

- Conducted an extensive research project in the final year of University, interviewing members of Boeing Defence UK's team regarding social value criteria in the UK's public sector contracting evaluation system

**Finance:**

- Financial modelling at Capita Scaling Partner, using Excel to create sophisticated models based on existing financial data from prospective partner startups and presenting findings to partners

**Industry-specific Software:**

- Hubspot, Monday

**Career Goals:**

- Seeking contracts with small businesses to improve their online presence
- Creating new websites or web applications using Next.js, including content-based solutions with a CMS, SaaS solutions, or eCommerce solutions
- Open to contracts outside of this realm if the required skill exists within abilities

---
Evaluate the user's suitability for the job description they provide. If they are suitable, send them a suggested proposal via email. If they are not suitable, send them an email with the reasoning why they are not suitable.`
        },
        {
          "role": "user",
          "content": JSON.stringify(item)
        }
      ],
      "functions": [
        {
          "name": "send_suggested_proposal_email",
          "description": "This function is used if the user is suitable for the job description provided. The function sends an email to the user with a suggested proposal which they could send in order to apply for the given job.",
          "parameters": {
            "type": "object",
            "properties": {
              "proposal": {
                "type": "string",
                "description": "The proposal should follow a format similar to the following:\nHi, I'm a web designer and developer based in Gloucester, UK.\n\nI have strong creative design skills and am highly attentive to the technical details of the websites I deliver. The best examples of my creative work can be found attached. A great example of my ability to deliver high-quality websites is a demo site which I use when selling to dental clients: https: //demo.mistrata.com. It's responsive, fast and adheres to all of the SEO and accessibility best practices. I have previously used Squarespace and am so far confident that your needs can be met adequately on the platform.\n\nHopefully, these examples give you an idea of my creativity, attention to detail and ability to deliver high-performance websites. I have availability to work with you on an ongoing basis and would appreciate the opportunity to discuss your needs further.\n\nThanks,\n\nFinn"
              },
              "job_summary": {
                "type": "string",
                "description": "A summary of the job description."
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
              "proposal",
              "job_summary",
              "job_url"
            ]
          }
        },
        {
          "name": "send_unsuitability_email",
          "description": "This function is used if the user is not suitable for the job description provided. The function sends an email to the user with the reasoning why they are not suitable for the given job.",
          "parameters": {
            "type": "object",
            "properties": {
              "reasoning": {
                "type": "string",
                "description": "A brief explanation of why the user is not suitable for the job."
              },
              "job_summary": {
                "type": "string",
                "description": "A summary of the job description."
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
              "reasoning",
              "job_summary",
              "job_url"
            ]
          }
        }
      ]
    });
    if (completion.data.choices[0].message?.function_call?.arguments) {
      await sendEmail(JSON.parse(completion.data.choices[0].message?.function_call?.arguments));
    } else {
      await resend.emails.send(
        {
          from: 'finn@finnelliott.com',
          to: 'finn@finnelliott.com',
          subject: 'No function call found',
          html: "No function call found."
        }
      );
    }
  } catch (err: any) {
    console.error('Error in checkSuitability:', err.message);
  }
}

async function sendEmail({
  reasoning, 
  proposal,
  job_summary, 
  job_url
}: { 
  reasoning: string | undefined,
  proposal: string | undefined,
  job_summary: string,
  job_url: string}) {
    await resend.emails.send(
      {
        from: 'finn@finnelliott.com',
        to: 'finn@finnelliott.com',
        subject: `New job: ${job_summary.slice(0, 25)}`,
        html: JSON.stringify({
            reasoning,
            proposal,
            job_summary,
            job_url
        })
      }
    );
    return;
}

export async function GET(request: Request) {
  const feedUrl = 'https://www.upwork.com/ab/feed/jobs/rss?q=web+design&user_location_match=1&sort=recency&paging=0%3B10&api_params=1&securityToken=1480d28b8c9192afef5994366f86aeb9593b6b3caaac0164e0959a94754865db67903bebb8e572475fb3c337fe1dcd6e5136758579fa2db13350b0dd9b5614ce&userUid=1566080122037977088&orgUid=1566080122037977089';
  const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

  try {
    await checkForNewItems(feedUrl, interval);
    return new Response('Hello, Next.js!') 
  } catch (error) {
    console.error('Error in GET:', error);
    return new Response('Error in GET', { status: 500 });
  }
}