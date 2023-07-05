import setup from "@/data/setup";
import { checkForNewItems } from "@/lib/checkForNewItems";
import { generateProposal } from "@/lib/generateProposal";
import { sendProposalEmail } from "@/lib/sendProposalEmail";
import Client from "@/types/client";

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { slug: "finnelliott" | "gzlegal" } }
) {
  const client: Client = setup[params.slug];

  if (!client) throw new Error(`No setup data for ${client}`)
  if (!client.feeds) throw new Error(`No feeds for ${client}`)
  if (!client.profile) throw new Error(`No profile ${client}`)

  const feedUrls = client.feeds;
  const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

  try {
    const newItems = await checkForNewItems(feedUrls, interval);
    if (newItems.length > 0) {
      for (let i = 0; i < newItems.length; i++) {
        const proposal = await generateProposal({
          item: newItems[i], 
          profile: client.profile, 
          proposal_format: client.proposal_format,
          work_samples: client.work_samples
        });
        if (!proposal) throw new Error('No proposal generated')
        await sendProposalEmail({ ...proposal, send_to: client.send_to, client: client.name })
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