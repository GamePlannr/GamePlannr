import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendSessionRequestEmail = async ({ to, mentorName, parentName }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'GamePlannr <noreply@gameplannr.com>',
      to,
      subject: `New Session Request from ${parentName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>You've received a new session request!</h2>
          <p><strong>${parentName}</strong> has requested a training session with you on GamePlannr.</p>
          <p>Please log into your dashboard to view and respond to the request.</p>
          <br/>
          <a href="https://gameplannr.com/dashboard" style="background-color: #4CAF50; padding: 10px 20px; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
          <br/><br/>
          <p>Thanks,<br/>The GamePlannr Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
    }

    return data;
  } catch (err) {
    console.error('Unexpected Resend error:', err);
  }
};