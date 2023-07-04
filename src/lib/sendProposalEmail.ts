import { Resend } from 'resend';
import { EmailTemplate } from '../emails/EmailTemplate';
import GeneratedProposal from '@/types/generatedProposal';
import { JSXElementConstructor, ReactElement } from 'react';

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable not set.');
}
  
const resend = new Resend(process.env.RESEND_API_KEY);
  
export async function sendProposalEmail({
    title,
    suitability,
    unsuitability_reasoning,
    proposal,
    job_summary, 
    job_url,
    send_to,
    client
  }: GeneratedProposal & {
    send_to: string[],
    client: string,
  }) {
      await resend.emails.send(
        {
          from: 'finn@finnelliott.com',
          to: send_to,
          subject: `New Upwork Job: ${title}`,
          react: EmailTemplate({
            suitability,
            unsuitability_reasoning,
            proposal,
            job_summary, 
            job_url,
            client,
            title 
          }) as ReactElement<any, string | JSXElementConstructor<any>> | null | undefined
        }
      );
      return;
  }