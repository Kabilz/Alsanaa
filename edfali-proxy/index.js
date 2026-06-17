import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Secrets can be provided via environment variables in production
const EDFALI_MOBILE = process.env.EDFALI_MOBILE || "0923987512";
const EDFALI_PIN = process.env.EDFALI_PIN || "6529";
const EDFALI_PW = process.env.EDFALI_PW || "123@xdsr$#!!";
const ADFALI_URL = "http://62.240.55.2:6187/BCDUssd/NewEdfali.asmx";

// Helper: Escape XML
function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper: Extract SOAP Result
function extractSoapResult(xml) {
  const match = xml.match(/<[a-zA-Z0-9_:]*OnlineConfTransResult[^>]*>([\s\S]*?)<\/[a-zA-Z0-9_:]*OnlineConfTransResult>/);
  if (match) return match[1].trim();
  const fallback = xml.match(/<[a-zA-Z0-9_:]*Result[^>]*>([\s\S]*?)<\/[a-zA-Z0-9_:]*Result>/);
  if (fallback) return fallback[1].trim();
  return null;
}

const errorMap = {
  "ACC": "رقم الحساب أو رقم PIN الخاص بـ ادفع لي غير صحيح",
  "BAL": "رصيد الحساب غير كافٍ لإتمام العملية",
  "PW": "رقم PIN الخاص بـ ادفع لي غير صحيح",
  "PW1": "رقم PIN الخاص بـ ادفع لي غير صحيح",
  "SYS": "خطأ في النظام، يرجى المحاولة لاحقاً",
  "DUP": "عملية مكررة",
  "TIME": "انتهت مهلة الجلسة، يرجى إعادة المحاولة",
  "AMT": "المبلغ المدخل غير صحيح",
  "LMT": "تم تجاوز الحد المسموح للعمليات",
  "IP": "عنوان IP غير مصرح به",
  "OFF": "الخدمة متوقفة حالياً",
};

// Route: Initialize Transaction
app.post('/api/edfali-init', async (req, res) => {
  try {
    const { customerPhone, amount } = req.body;

    if (!customerPhone || !amount) {
      return res.status(400).json({ error: "customerPhone and amount are required" });
    }

    let merchantMobile = EDFALI_MOBILE.replace(/\s+/g, "");
    if (merchantMobile.startsWith("0")) merchantMobile = merchantMobile.slice(1);
    
    let cmobile = customerPhone.replace(/\s+/g, "");
    if (cmobile.startsWith("09")) {
      cmobile = "+218" + cmobile.slice(1);
    } else if (!cmobile.startsWith("+218")) {
      cmobile = "+218" + cmobile;
    }

    const decimalAmount = Number(amount).toFixed(2);
    const safeMobile = merchantMobile.trim();
    const safePw = EDFALI_PW.trim();
    const safePin = String(EDFALI_PIN).trim();

    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <DoPTrans xmlns="http://tempuri.org/">
      <Mobile>${escapeXml(safeMobile)}</Mobile>
      <Pin>${escapeXml(safePin)}</Pin>
      <Cmobile>${escapeXml(cmobile)}</Cmobile>
      <Amount>${decimalAmount}</Amount>
      <PW>${escapeXml(safePw)}</PW>
    </DoPTrans>
  </soap:Body>
</soap:Envelope>`;

    console.log("Sending init request to Adfali...", { customerPhone, amount });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(ADFALI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": '"http://tempuri.org/DoPTrans"',
      },
      body: soapBody,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const xmlText = await response.text();

    if (xmlText.includes("<!DOCTYPE") || xmlText.includes("<html")) {
      return res.json({ error: "خطأ في الاتصال بخدمة ادفع لي. يرجى التحقق من بيانات الاعتماد.", raw: xmlText.substring(0, 200) });
    }

    const result = extractSoapResult(xmlText);

    if (!result) {
      return res.json({ error: "استجابة غير متوقعة من خدمة ادفع لي.", raw: xmlText.substring(0, 300) });
    }

    const resultUpper = result.toUpperCase();
    if (errorMap[resultUpper]) {
      return res.json({ error: errorMap[resultUpper], code: resultUpper });
    }

    return res.json({ sessionId: result });

  } catch (err) {
    console.error("edfali-init error:", err);
    return res.json({ error: "فشل الاتصال بخدمة الدفع. يرجى المحاولة مرة أخرى.", detail: String(err) });
  }
});

// Route: Confirm Transaction
app.post('/api/edfali-confirm', async (req, res) => {
  try {
    const { customerPhone, smsPin, sessionId } = req.body;

    if (!customerPhone || !smsPin || !sessionId) {
      return res.status(400).json({ error: "customerPhone, smsPin, and sessionId are required" });
    }

    let merchantMobile = EDFALI_MOBILE.replace(/\s+/g, "");
    if (merchantMobile.startsWith("0")) merchantMobile = merchantMobile.slice(1);

    const safePw = EDFALI_PW.trim();
    const safePin = String(smsPin).trim();
    const safeSessionId = String(sessionId).trim();

    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <OnlineConfTrans xmlns="http://tempuri.org/">
      <Mobile>${escapeXml(merchantMobile)}</Mobile>
      <Pin>${escapeXml(safePin)}</Pin>
      <sessionID>${escapeXml(safeSessionId)}</sessionID>
      <PW>${escapeXml(safePw)}</PW>
    </OnlineConfTrans>
  </soap:Body>
</soap:Envelope>`;

    console.log("Sending confirm request to Adfali...", { smsPin, sessionId });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(ADFALI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": '"http://tempuri.org/OnlineConfTrans"',
      },
      body: soapBody,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const xmlText = await response.text();

    if (xmlText.includes("<!DOCTYPE") || xmlText.includes("<html")) {
      return res.json({ error: "خطأ في الاتصال بخدمة ادفع لي.", raw: xmlText.substring(0, 200) });
    }

    const result = extractSoapResult(xmlText);

    if (!result) {
      return res.json({ error: "استجابة غير متوقعة من خدمة ادفع لي.", raw: xmlText.substring(0, 300) });
    }

    if (result === "OK") {
      return res.json({ ok: true });
    }

    return res.json({ error: "رمز التأكيد غير صحيح أو انتهت صلاحية الجلسة.", code: result });

  } catch (err) {
    console.error("edfali-confirm error:", err);
    return res.json({ error: "فشل الاتصال بخدمة الدفع. يرجى المحاولة مرة أخرى.", detail: String(err) });
  }
});

app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});
