"use server"
import { EmailTemplate } from "@/components/emails/export-note-alert"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function SendLandNoteEmail(
  sendto: string[],
  plot: string,
  noteDetail: string
) {
  try {
    const data = await resend.emails.send({
      from: "JBPearce App <noreply@jbpearce.app>",
      to: sendto,
      subject: `Notes Added to Plot ${plot}`,
      react: EmailTemplate({ plot, noteDetail }),
      text: "",
    })
    console.log("Sent email", data)
    return data
  } catch (error) {
    return { error }
  }
}
