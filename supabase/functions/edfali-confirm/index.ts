/**
 * edfali-confirm — Step 2: Confirm Adfali payment via SOAP.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const EDFALI_MOBILE = Deno.env.get("EDFALI_MOBILE") ?? "0923987512";
const EDFALI_PW     = Deno.env.get("EDFALI_PW")     ?? "123@xdsr$#!!";
const ADFALI_URL    = "http://62.240.55.2:6187/BCDUssd/NewEdfali.asmx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractSoapResult(xml: string): string | null {
  const match = xml.match(/<[a-zA-Z0-9_:]*OnlineConfTransResult[^>]*>([\s\S]*?)<\/[a-zA-Z0-9_:]*OnlineConfTransResult>/);
  if (match) return match[1].trim();
  const fallback = xml.match(/<[a-zA-Z0-9_:]*Result[^>]*>([\s\S]*?)<\/[a-zA-Z0-9_:]*Result>/);
  if (fallback) return fallback[1].trim();
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { customerPhone, smsPin, sessionId } = await req.json();

    if (!customerPhone || !smsPin || !sessionId) {
      return new Response(
        JSON.stringify({ error: "customerPhone, smsPin, and sessionId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalise merchant mobile → 9 digits starting with 9
    let merchantMobile = EDFALI_MOBILE.replace(/\s+/g, "");
    if (merchantMobile.startsWith("0")) merchantMobile = merchantMobile.slice(1);

    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <OnlineConfTrans xmlns="http://tempuri.org/">
      <Mobile>${escapeXml(merchantMobile)}</Mobile>
      <Pin>${escapeXml(String(smsPin).trim())}</Pin>
      <sessionID>${escapeXml(String(sessionId).trim())}</sessionID>
      <PW>${escapeXml(EDFALI_PW)}</PW>
    </OnlineConfTrans>
  </soap:Body>
</soap:Envelope>`;

    console.log("Sending SOAP confirm to Adfali:", { merchantMobile, smsPin, sessionId });

    const response = await fetch(ADFALI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": '"http://tempuri.org/OnlineConfTrans"',
      },
      body: soapBody,
    });

    const xmlText = await response.text();
    console.log("Adfali confirm raw response:", xmlText.substring(0, 500));

    if (xmlText.includes("<!DOCTYPE") || xmlText.includes("<html")) {
      return new Response(
        JSON.stringify({ error: "خطأ في الاتصال بخدمة ادفع لي.", raw: xmlText.substring(0, 200) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = extractSoapResult(xmlText);

    if (!result) {
      return new Response(
        JSON.stringify({ error: "استجابة غير متوقعة من خدمة ادفع لي.", raw: xmlText.substring(0, 300) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (result === "OK") {
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "رمز التأكيد غير صحيح أو انتهت صلاحية الجلسة.", code: result }),
      { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("edfali-confirm error:", err);
    return new Response(
      JSON.stringify({ error: "فشل الاتصال بخدمة الدفع. يرجى المحاولة مرة أخرى.", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
