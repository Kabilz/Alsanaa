<?php
// إعدادات CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================
// إعدادات يسر باي (MITF Online Payment)
// ==========================================
$YUSR_USER_ID   = 115339;
$YUSR_PIN       = "87306321";
$YUSR_PROVIDER_ID = 972759;

$YUSR_BASE_URL  = "https://yussor-pay-online.mitflink.ly:40120/YusorOnline";

// ==========================================

$action    = isset($_GET['action']) ? $_GET['action'] : '';
$inputJSON = file_get_contents('php://input');
$input     = json_decode($inputJSON, TRUE);

if (!$input) {
    echo json_encode(["error" => "بيانات الطلب غير صحيحة."]);
    exit();
}

// دالة مساعدة لإرسال طلبات JSON لـ Yusr Pay API
function callYusrApi($endpoint, $payload, $token = null) {
    global $YUSR_BASE_URL;
    // إضافة culture=ar-LY لكل الطلبات
    $sep = (strpos($endpoint, '?') !== false) ? '&' : '?';
    $url = $YUSR_BASE_URL . $endpoint . $sep . 'culture=ar-LY';

    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
    ];

    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    // تجاهل التحقق من شهادة SSL لأن بعض الخوادم المحلية تستخدم شهادات غير موثقة
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

    // إضافة شهادة المصادقة الخاصة بيسر باي mTLS
    $certPath = __DIR__ . '/ccc/alsanaa.com_yussor_cert/alsanaa.alsanact.com.pem';
    $keyPath  = __DIR__ . '/ccc/alsanaa_alsanact_new.key';
    curl_setopt($ch, CURLOPT_SSLCERT, $certPath);
    curl_setopt($ch, CURLOPT_SSLKEY, $keyPath);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error_msg = curl_error($ch);
        curl_close($ch);
        return ["error" => "فشل الاتصال بخدمة يسر باي. السبب: " . $error_msg];
    }
    curl_close($ch);

    $result = json_decode($response, true);

    if (!$result) {
        return ["error" => "استجابة غير متوقعة من خدمة يسر باي.", "raw" => $response];
    }

    return $result;
}

// ==========================================
// action=init → Signin ثم OpenSession
// ==========================================
if ($action === 'init') {

    $identityCard = isset($input['identityCard'])
        ? $input['identityCard']
        : (isset($input['customerPhone']) ? $input['customerPhone'] : '');
    $amount = isset($input['amount']) ? $input['amount'] : '';

    if (!$identityCard || !$amount) {
        echo json_encode(["error" => "identityCard (أو customerPhone) و amount مطلوبان."]);
        exit();
    }

    // --- خطوة 1: Signin للحصول على التوكن ---
    // pin يجب أن يكون string وفقاً لتوثيق API
    $signinRes = callYusrApi('/api/OnlinePaymentServices/Signin', [
        "userId"       => (int)$YUSR_USER_ID,
        "pin"          => (string)$YUSR_PIN,
        "providerId"   => (int)$YUSR_PROVIDER_ID,
        "authUserType" => 0
    ]);

    if (isset($signinRes['error'])) {
        echo json_encode(["error" => $signinRes['error']]);
        exit();
    }

    if (!isset($signinRes['type']) || $signinRes['type'] !== 1) {
        $msg = (!empty($signinRes['messages']) && is_array($signinRes['messages']))
            ? implode(", ", $signinRes['messages'])
            : "فشل تسجيل الدخول في يسر باي.";
        $msg = "خطأ في تسجيل الدخول (Signin): " . $msg;
        echo json_encode(["error" => $msg, "details" => $signinRes]);
        exit();
    }

    $merchantToken = isset($signinRes['content']['value']) ? $signinRes['content']['value'] : '';

    // --- خطوة 2: OpenSession لبدء عملية الدفع ---
    $transactionId = "YUSR_" . time() . "_" . rand(1000, 9999);

    $openRes = callYusrApi('/api/OnlinePaymentServices/OpenSession', [
        "amount"          => (int)$amount,
        "identityCard"    => (string)$identityCard,
        "transactionId"   => $transactionId,
        "onlineOperation" => 1 // 1 = Sell
    ], $merchantToken);

    if (isset($openRes['error'])) {
        echo json_encode(["error" => $openRes['error']]);
        exit();
    }

    if (!isset($openRes['type']) || $openRes['type'] !== 1) {
        $msg = (!empty($openRes['messages']) && is_array($openRes['messages']))
            ? implode(", ", $openRes['messages'])
            : "فشل في إنشاء الجلسة.";
        $msg = "خطأ في إنشاء الجلسة (OpenSession): " . $msg;
        echo json_encode(["error" => $msg, "details" => $openRes]);
        exit();
    }

    $sessionToken = isset($openRes['content']['value']) ? $openRes['content']['value'] : '';

    echo json_encode([
        "sessionId"     => $sessionToken,
        "transactionId" => $transactionId
    ]);
    exit();

// ==========================================
// action=confirm → CompleteSession بالـ OTP
// ==========================================
} elseif ($action === 'confirm') {

    $otp       = isset($input['smsPin']) ? $input['smsPin'] : (isset($input['otp']) ? $input['otp'] : '');
    $sessionId = isset($input['sessionId']) ? $input['sessionId'] : '';

    if (!$otp || !$sessionId) {
        echo json_encode(["error" => "smsPin (otp) و sessionId مطلوبان."]);
        exit();
    }

    $confirmRes = callYusrApi('/api/OnlinePaymentServices/CompleteSession', [
        "otp" => (string)$otp
    ], $sessionId);

    if (isset($confirmRes['error'])) {
        echo json_encode(["error" => $confirmRes['error']]);
        exit();
    }

    if (!isset($confirmRes['type']) || $confirmRes['type'] !== 1) {
        $msg = (!empty($confirmRes['messages']) && is_array($confirmRes['messages']))
            ? implode(", ", $confirmRes['messages'])
            : "رمز التأكيد غير صحيح أو انتهت صلاحية الجلسة.";
        echo json_encode(["error" => $msg, "code" => $confirmRes['type'] ?? null]);
        exit();
    }

    echo json_encode([
        "ok"      => true,
        "message" => isset($confirmRes['content']) ? $confirmRes['content'] : "تمت العملية بنجاح"
    ]);
    exit();

} else {
    echo json_encode(["error" => "Invalid action parameter."]);
    exit();
}
