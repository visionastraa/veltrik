import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const transporter = nodemailer.createTransport({
  host: process.env.HOSTINGER_SMTP_HOST,
  port: parseInt(process.env.HOSTINGER_SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.HOSTINGER_SMTP_USER,
    pass: process.env.HOSTINGER_SMTP_PASS,
  },
});

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  userId: string;
  type: string;
};

export async function sendEmail({ to, subject, html, userId, type }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"Veltrik" <${process.env.HOSTINGER_SMTP_USER}>`,
      to,
      subject,
      html,
    });

    await prisma.notificationLog.create({
      data: {
        userId,
        type,
        channel: "EMAIL",
        status: "SENT",
        payload: JSON.stringify({ to, subject, messageId: info.messageId }),
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Error]", error);

    await prisma.notificationLog.create({
      data: {
        userId,
        type,
        channel: "EMAIL",
        status: "FAILED",
        payload: JSON.stringify({ to, subject, error: error instanceof Error ? error.message : "Unknown error" }),
      },
    });

    return { success: false, error };
  }
}
