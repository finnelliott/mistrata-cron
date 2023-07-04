import { Resend } from 'resend';
import { EmailTemplate } from '../emails/EmailTemplate';
import GeneratedProposal from '@/types/generatedProposal';

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable not set.');
}
  
const resend = new Resend(process.env.RESEND_API_KEY);
  
export async function sendProposalEmail({
    suitability,
    unsuitability_reasoning,
    proposal,
    job_summary, 
    job_url,
    send_to
  }: GeneratedProposal & {
    send_to: string[]
  }) {
      await resend.emails.send(
        {
          from: 'finn@finnelliott.com',
          to: send_to,
          subject: `New Upwork Job Available: ${job_summary.slice(0, 25)}`,
          // @ts-ignore
          react: EmailTemplate({
            suitability,
            unsuitability_reasoning,
            proposal,
            job_summary, 
            job_url,
          })
        }
      );
      return;
  }