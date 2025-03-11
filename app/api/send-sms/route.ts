import { NextResponse } from "next/server";
import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = Twilio(accountSid, authToken);

export async function POST(req: Request) {
    try {
        const { phone, message } = await req.json();

        if (!phone || !message) {
            return NextResponse.json({ success: false, error: "Phone number and message are required" }, { status: 400 });
        }

        const response = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phone,
        });

        return NextResponse.json({ success: true, data: response });
    } catch (error:any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
