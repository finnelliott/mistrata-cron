import { Resend } from "resend";
if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable not set.');
}
  
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const { TextBody, HtmlBody } = await request.json();
    await resend.emails.send(
        {
          from: 'finn@finnelliott.com',
          to: 'finn@finnelliott.com',
          subject: `Finn Elliott – Bark Job`,
          text: HtmlBody ?? TextBody
        }
      );
    return new Response('Hello, Next.js!')
}