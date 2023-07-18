import setup from "@/data/setup";
import { GZTemplate } from "@/emails/gz-template";
import { checkForNewItems } from "@/lib/checkForNewItems";
import { checkIfIsGZSuitable } from "@/lib/checkIfIsGZSuitable";
import { Resend } from "resend";
if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable not set.');
}
  
const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';
const client = 'gzlegal';

if (!setup[client]) throw new Error(`No setup data for ${client}`)
if (!setup[client].feeds) throw new Error(`No feeds for ${client}`)
if (!setup[client].profile) throw new Error(`No profile ${client}`)

export async function GET() {
  const feedUrls = setup[client].feeds;
  const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

  try {
    const newItems = await checkForNewItems(feedUrls, interval);
    if (newItems.length > 0) {
      for (let i = 0; i < newItems.length; i++) {
        const { is_suitable, job_summary, job_url } = await checkIfIsGZSuitable(newItems[i])
        if (is_suitable) {
          await resend.emails.send(
            {
              from: 'finn@finnelliott.com',
              to: 'finn@finnelliott.com',
              subject: `GZ Legal – Upwork Job`,
              // @ts-ignore
              react: GZTemplate({
                job_summary,
                job_url
              })
            }
          );
        } else {
          await resend.emails.send(
            {
              from: 'finn@finnelliott.com',
              to: 'finn@finnelliott.com',
              subject: `Unsuitable – GZ Legal – Upwork Job`,
              // @ts-ignore
              react: GZTemplate({
                job_summary,
                job_url
              })
            }
          );
        }
      }
    } else {
        console.log('No new items')
    }
    return new Response('Hello, Next.js!') 
  } catch (error) {
    console.error('Error in GET:', error);
    return new Response('Error in GET', { status: 500 });
  }
}