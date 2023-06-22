import { Parser } from 'xml2js';
import { Resend } from 'resend';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const feedUrl = 'https://www.upwork.com/ab/feed/jobs/rss?q=web+design&user_location_match=1&sort=recency&paging=0%3B10&api_params=1&securityToken=1480d28b8c9192afef5994366f86aeb9593b6b3caaac0164e0959a94754865db67903bebb8e572475fb3c337fe1dcd6e5136758579fa2db13350b0dd9b5614ce&userUid=1566080122037977088&orgUid=1566080122037977089';
  const interval = 300 * 60 * 1000; // 30 minutes in milliseconds

  async function sendEmail({proposal,
    job_summary, 
    job_url}: {proposal: string,
      job_summary: string,
      job_url: string}) {
      resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'finn@finnelliott.com',
          subject: 'Hello World',
          html: JSON.stringify({
              proposal,
              job_summary,
              job_url
          })
      });
      return;
  }

  async function checkSuitability(item: string) {
      console.log(item)
      const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{"role": "system", "content": `
          The user has the following skill profile:
  - Next.js
  - Webflow
  - Expert REDCap developer
  - Full-stack web development
  - Web design

  The user will provide a job from an Upwork RSS feed. If the job fits the user's skill profile, return a JSON object with the keys:
  - suitable (true)
  - job_summary (string)
  - job_url (string)
  - proposal

  Always be optimistic about the users' ability to complete the job. If the job is not suitable, return a JSON object with the keys:
  - suitable (false)
  - reason (string)

  Only return the appropriate JSON. Do not return anything else.

  The proposal should follow a format similar to the following:
  Hi, I'm a web designer and developer based in Gloucester, UK.

  I have strong creative design skills and am highly attentive to the technical details of the websites I deliver. The best examples of my creative work can be found attached. A great example of my ability to deliver high-quality websites is a demo site which I use when selling to dental clients: https://demo.mistrata.com. It's responsive, fast and adheres to all of the SEO and accessibility best practices. I have previously used Squarespace and am so far confident that your needs can be met adequately on the platform.

  Hopefully, these examples give you an idea of my creativity, attention to detail and ability to deliver high-performance websites. I have availability to work with you on an ongoing basis and would appreciate the opportunity to discuss your needs further.

  Thanks,

  Finn
  `}, {role: "user", content: JSON.stringify(item)}],
      });
      console.log(completion.data.choices[0].message)
      if (!completion?.data?.choices[0]?.message?.content) return;
      const { suitable, job_summary, job_url, proposal}: { suitable: boolean, job_summary: string, job_url: string, proposal: string} = JSON.parse(completion.data.choices[0].message.content)
      if (suitable) {
          sendEmail({
              proposal,
              job_summary, 
              job_url
          });
      }
      return;
  }

  async function checkForNewItems() {
    try {
      const response = await fetch(feedUrl);
      const xmlData = await response.text();
      const parser = new Parser();
      const jsonData = await parser.parseStringPromise(xmlData);
      const items = jsonData.rss.channel[0].item;

      items.forEach((item: any) => {
        const itemDate = new Date(item.pubDate[0]);
        const currentDate = new Date();
        // @ts-ignore
        const timeDifference = currentDate - itemDate;

        if (timeDifference <= interval) {
          checkSuitability(item);
        }
      });
    } catch (error) { console.log(error); } }

  checkForNewItems();
  return new Response('Hello, Next.js!') 
}