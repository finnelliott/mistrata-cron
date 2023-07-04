import setup from "@/data/setup";
import { checkForNewItems } from "@/lib/checkForNewItems";
import { generateProposal } from "@/lib/generateProposal";
import { sendProposalEmail } from "@/lib/sendProposalEmail";

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
        const proposal = await generateProposal({
          item: newItems[i], 
          profile: setup[client].profile, 
          proposal_format: setup[client].proposal_format,
          work_samples: setup[client].work_samples
        });
        if (!proposal) throw new Error('No proposal generated')
        sendProposalEmail({ ...proposal, send_to: setup[client].send_to })
      }
    }
    return new Response('Hello, Next.js!') 
  } catch (error) {
    console.error('Error in GET:', error);
    return new Response('Error in GET', { status: 500 });
  }
}