import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <DoPTrans xmlns="http://tempuri.org/">
      <Mobile>923987512</Mobile>
      <Pin>6529</Pin>
      <Cmobile>+218912345678</Cmobile>
      <Amount>10.00</Amount>
      <PW>123@xdsr$#!!</PW>
    </DoPTrans>
  </soap:Body>
</soap:Envelope>`;

    const res = await fetch("http://62.240.55.2:6187/BCDUssd/NewEdfali.asmx", { 
        method: 'POST',
        headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": '"http://tempuri.org/DoPTrans"',
        },
        body: soapBody
    });
    const text = await res.text();
    return new Response(JSON.stringify({ success: true, text: text }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { headers: { "Content-Type": "application/json" } });
  }
});
