<?php
// إعدادات CORS للسماح لموقعك بالاتصال بهذا الملف
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// التعامل مع طلبات OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// المتغيرات الخاصة بك (اتركها هكذا إذا كنت تختبر، أو غيرها ببياناتك الحقيقية لاحقاً)
$EDFALI_MOBILE = "0923987512";
$EDFALI_PIN = "6529";
$EDFALI_PW = "123@xdsr$#!!";
$ADFALI_URL = "http://62.240.55.2:6187/BCDUssd/NewEdfali.asmx";

$action = isset($_GET['action']) ? $_GET['action'] : '';
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

if (!$input) {
    echo json_encode(["error" => "بيانات الطلب غير صحيحة."]);
    exit();
}

function escapeXml($str) {
    return htmlspecialchars($str, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

function extractSoapResult($xml) {
    if (preg_match('/<[a-zA-Z0-9_:]*OnlineConfTransResult[^>]*>([\s\S]*?)<\/[a-zA-Z0-9_:]*OnlineConfTransResult>/', $xml, $matches)) {
        return trim($matches[1]);
    }
    if (preg_match('/<[a-zA-Z0-9_:]*Result[^>]*>([\s\S]*?)<\/[a-zA-Z0-9_:]*Result>/', $xml, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

$errorMap = [
    "ACC" => "رقم الحساب أو رقم PIN الخاص بـ ادفع لي غير صحيح",
    "BAL" => "رصيد الحساب غير كافٍ لإتمام العملية",
    "PW" => "رقم PIN الخاص بـ ادفع لي غير صحيح",
    "PW1" => "رقم PIN الخاص بـ ادفع لي غير صحيح",
    "SYS" => "خطأ في النظام، يرجى المحاولة لاحقاً",
    "DUP" => "عملية مكررة",
    "TIME" => "انتهت مهلة الجلسة، يرجى إعادة المحاولة",
    "AMT" => "المبلغ المدخل غير صحيح",
    "LMT" => "تم تجاوز الحد المسموح للعمليات",
    "IP" => "عنوان IP غير مصرح به",
    "OFF" => "الخدمة متوقفة حالياً",
];

if ($action === 'init') {
    $customerPhone = isset($input['customerPhone']) ? $input['customerPhone'] : '';
    $amount = isset($input['amount']) ? $input['amount'] : '';

    if (!$customerPhone || !$amount) {
        echo json_encode(["error" => "customerPhone and amount are required"]);
        exit();
    }

    $merchantMobile = preg_replace('/\s+/', '', $EDFALI_MOBILE);
    if (substr($merchantMobile, 0, 1) === '0') {
        $merchantMobile = substr($merchantMobile, 1);
    }

    $cmobile = preg_replace('/\s+/', '', $customerPhone);
    if (substr($cmobile, 0, 2) === '09') {
        $cmobile = '+218' . substr($cmobile, 1);
    } elseif (substr($cmobile, 0, 4) !== '+218') {
        $cmobile = '+218' . $cmobile;
    }

    $decimalAmount = number_format((float)$amount, 2, '.', '');
    
    $safeMobile = trim($merchantMobile);
    $safePw = trim($EDFALI_PW);
    $safePin = trim($EDFALI_PIN);

    $soapBody = '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <DoPTrans xmlns="http://tempuri.org/">
      <Mobile>' . escapeXml($safeMobile) . '</Mobile>
      <Pin>' . escapeXml($safePin) . '</Pin>
      <Cmobile>' . escapeXml($cmobile) . '</Cmobile>
      <Amount>' . $decimalAmount . '</Amount>
      <PW>' . escapeXml($safePw) . '</PW>
    </DoPTrans>
  </soap:Body>
</soap:Envelope>';

    $ch = curl_init($ADFALI_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $soapBody);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: text/xml; charset=utf-8',
        'SOAPAction: "http://tempuri.org/DoPTrans"'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);

    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        echo json_encode(["error" => "فشل الاتصال بخدمة الدفع. يرجى المحاولة مرة أخرى."]);
        exit();
    }
    curl_close($ch);

    $result = extractSoapResult($response);

    if (!$result) {
        echo json_encode(["error" => "استجابة غير متوقعة من خدمة ادفع لي."]);
        exit();
    }

    $resultUpper = strtoupper($result);
    if (isset($errorMap[$resultUpper])) {
        echo json_encode(["error" => $errorMap[$resultUpper], "code" => $resultUpper]);
        exit();
    }

    echo json_encode(["sessionId" => $result]);
    exit();

} elseif ($action === 'confirm') {
    $customerPhone = isset($input['customerPhone']) ? $input['customerPhone'] : '';
    $smsPin = isset($input['smsPin']) ? $input['smsPin'] : '';
    $sessionId = isset($input['sessionId']) ? $input['sessionId'] : '';

    if (!$customerPhone || !$smsPin || !$sessionId) {
        echo json_encode(["error" => "customerPhone, smsPin, and sessionId are required"]);
        exit();
    }

    $merchantMobile = preg_replace('/\s+/', '', $EDFALI_MOBILE);
    if (substr($merchantMobile, 0, 1) === '0') {
        $merchantMobile = substr($merchantMobile, 1);
    }

    $safePw = trim($EDFALI_PW);
    $safePin = trim($smsPin);
    $safeSessionId = trim($sessionId);

    $soapBody = '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <OnlineConfTrans xmlns="http://tempuri.org/">
      <Mobile>' . escapeXml($merchantMobile) . '</Mobile>
      <Pin>' . escapeXml($safePin) . '</Pin>
      <sessionID>' . escapeXml($safeSessionId) . '</sessionID>
      <PW>' . escapeXml($safePw) . '</PW>
    </OnlineConfTrans>
  </soap:Body>
</soap:Envelope>';

    $ch = curl_init($ADFALI_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $soapBody);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: text/xml; charset=utf-8',
        'SOAPAction: "http://tempuri.org/OnlineConfTrans"'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);

    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        echo json_encode(["error" => "فشل الاتصال بخدمة الدفع. يرجى المحاولة مرة أخرى."]);
        exit();
    }
    curl_close($ch);

    $result = extractSoapResult($response);

    if (!$result) {
        echo json_encode(["error" => "استجابة غير متوقعة من خدمة ادفع لي."]);
        exit();
    }

    if ($result === "OK") {
        echo json_encode(["ok" => true]);
        exit();
    }

    echo json_encode(["error" => "رمز التأكيد غير صحيح أو انتهت صلاحية الجلسة.", "code" => $result]);
    exit();

} else {
    echo json_encode(["error" => "Invalid action parameter."]);
    exit();
}
