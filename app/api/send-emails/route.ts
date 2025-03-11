import { Resend } from "resend";

const resend = new Resend(process.env.RESEND);

export async function GET(req: Request) {
    try {
        // const { email, subject, message } = await req.json();

        const response = await resend.emails.send({
            from: "hi@resend.dev",  
            to:"tmank14319@gmail.com",
            subject: "subject",
            html: `<p>${"message"}</p>`,
        });

        return new Response(JSON.stringify({ success: true, data: response }), { status: 200 });
    } catch (error) {

        return new Response(JSON.stringify({ success: false, error }), { status: 500 });
    }
}
