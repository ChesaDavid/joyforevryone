'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY); 

export async function sendContactEmail(email: string, message: string) {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: 'david.chesa.it@gmail.com',
      subject: `New contact from ${email}`,
      html: `<div style="font-family: sans-serif;">
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>`,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
