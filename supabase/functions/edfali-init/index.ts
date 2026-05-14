/**
 * edfali-init — Step 1: Initiate Adfali payment via SOAP.
 * ASMX services require SOAP/XML, not plain HTTP GET.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const EDFALI_MOBILE = Deno.env.get("EDFALI_MOBILE") ?? "0923987512";
const EDFALI_PIN    = Deno.env.get("EDFALI_PIN")    ?? "6529";
const EDFALI_PW     = Deno.env.get("EDFALI_PW")     ?? "123@xdsr$#!!";
const ADFALI_URL    = "http://62.240.55.2:6187/BCDUssd/NewEdfali.asmx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Extract value from SOAP XML response (handles any namespace prefix)
function extractSoapResult(xml: string): string | null {
  // Try DoPTransResult element (with or without namespace prefix)
  const match = xml.match(/<[a-zA-Z0-9_:]*DoPTransResult[^>]*>([\s\S]*?)<\/[a-zA-Z0-9_:]*DoPTransResult>/);
  if (match) return match[1].trim();
  // Fallback: any *Result element
  const fallback = xml.match(/<[a-zA-Z0-9_:]*Result[^>]*>([\s\S]*?)<\/[a-zA-Z0-9_:]*Result>/);
  if (fallback) return fallback[1].trim();
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { customerPhone, amount } = await req.json();

    if (!customerPhone || !amount) {
      return new Response(
        JSON.stringify({ error: "customerPhone and amount are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalise customer phone → +218XXXXXXXXX (13 chars)
    let cmobile = String(customerPhone).replace(/\s+/g, "");
    if (cmobile.startsWith("00218")) cmobile = "+" + cmobile.slice(2);
    else if (cmobile.startsWith("218"))  cmobile = "+" + cmobile;
    else if (cmobile.startsWith("0"))    cmobile = "+218" + cmobile.slice(1);
    else if (!cmobile.startsWith("+218")) cmobile = "+218" + cmobile;

    // Normalise merchant mobile → 9 digits starting with 9 (no leading zero)
    let merchantMobile = EDFALI_MOBILE.replace(/\s+/g, "");
    if (merchantMobile.startsWith("0")) merchantMobile = merchantMobile.slice(1);

    const decimalAmount = Number(amount).toFixed(2);

    // Build SOAP envelope
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <DoPTrans xmlns="http://tempuri.org/">
      <Mobile>${escapeXml(merchantMobile)}</Mobile>
      <Pin>${escapeXml(EDFALI_PIN)}</Pin>
      <Cmobile>${escapeXml(cmobile)}</Cmobile>
      <decimalAmount>${decimalAmount}</decimalAmount>
      <PW>${escapeXml(EDFALI_PW)}</PW>
    </DoPTrans>
  </soap:Body>
</soap:Envelope>`;

    console.log("Sending SOAP request to Adfali:", { merchantMobile, cmobile, decimalAmount });

    const response = await fetch(ADFALI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": '"http://tempuri.org/DoPTrans"',
      },
      body: soapBody,
    });

    const xmlText = await response.text();
    console.log("Adfali raw response:", xmlText.substring(0, 500));

    // If server returned HTML error page
    if (xmlText.includes("<!DOCTYPE") || xmlText.includes("<html")) {
      return new Response(
        JSON.stringify({ error: "خطأ في الاتصال بخدمة ادفع لي. يرجى التحقق من بيانات الاعتماد.", raw: xmlText.substring(0, 200) }),
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

    // Known error codes from Adfali (server returns them in UPPERCASE)
    const errorMap: Record<string, string> = {
      PW1:   "كلمة مرور الخدمة غير صحيحة",
      PW:    "رقم PIN الخاص بـ ادفع لي غير صحيح",
      LIMIT: "المبلغ خارج نطاق الحد المسموح به",
      ACC:   "رقم هاتف العميل غير موجود في نظام ادفع لي",
      BAL:   "رصيد الحساب غير كافٍ",
    };

    const resultUpper = result.toUpperCase().trim();
    if (errorMap[resultUpper]) {
      return new Response(
        JSON.stringify({ error: errorMap[resultUpper], code: resultUpper }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success — result is the sessionId
    return new Response(
      JSON.stringify({ sessionId: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("edfali-init error:", err);
    return new Response(
      JSON.stringify({ error: "فشل الاتصال بخدمة الدفع. يرجى المحاولة مرة أخرى.", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
