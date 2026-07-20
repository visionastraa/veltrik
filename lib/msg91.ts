export interface SMSResult {
  success: boolean
  error?: string
}

function getConfig() {
  const authKey = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  if (!authKey || !templateId) {
    return null
  }
  return { authKey, templateId }
}

export async function sendOTP(phone: string, otp: string): Promise<SMSResult> {
  try {
    const config = getConfig()
    if (!config) {
      console.warn("[msg91] MSG91 not configured. Skipping OTP to", phone)
      return { success: false, error: "MSG91 not configured" }
    }

    const response = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authkey: config.authKey,
        template_id: config.templateId,
        mobile: phone,
        otp,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return { success: false, error: `MSG91 OTP failed: ${text}` }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[msg91] sendOTP error:", message)
    return { success: false, error: message }
  }
}

export async function sendSMS(phone: string, message: string): Promise<SMSResult> {
  try {
    const config = getConfig()
    if (!config) {
      console.warn("[msg91] MSG91 not configured. Skipping SMS to", phone)
      return { success: false, error: "MSG91 not configured" }
    }

    const url = new URL("https://api.msg91.com/api/sendhttp.php")
    url.searchParams.set("authkey", config.authKey)
    url.searchParams.set("mobiles", phone)
    url.searchParams.set("message", message)
    url.searchParams.set("route", "1")
    url.searchParams.set("country", "91")

    const response = await fetch(url.toString())
    if (!response.ok) {
      const text = await response.text()
      return { success: false, error: `MSG91 SMS failed: ${text}` }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[msg91] sendSMS error:", message)
    return { success: false, error: message }
  }
}
