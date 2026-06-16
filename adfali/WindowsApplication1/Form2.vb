Public Class Form2

    ' ═══════════════════════════════════════════════
    '   المتغيرات العامة (تستقبل البيانات من Form1)
    ' ═══════════════════════════════════════════════
    Public EdfaliMobile As String
    Public EdfaliPW As String
    Public SessionID As String
    Public AmountValue As Decimal
    Public CustomerMobile As String

    ' ═══════════════════════════════════════════════
    '   عند تحميل الفورم
    ' ═══════════════════════════════════════════════
    Private Sub Form2_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        ' عرض المبلغ المطلوب تأكيده
        LblAmountInfo.Text = "المبلغ المطلوب: " & AmountValue.ToString("0.00") & " دينار"
    End Sub

    ' ═══════════════════════════════════════════════
    '   زر تأكيد الدفع
    ' ═══════════════════════════════════════════════
    Private Sub BtnConfirmPay_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles BtnConfirmPay.Click
        Try
            ' --- التحقق من إدخال الكود ---
            If TxtConfirmPin.Text.Trim = "" Then
                MsgBox("الرجاء إدخال كود التأكيد المرسل إلى هاتفك", _
                       MsgBoxStyle.Exclamation + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                       "تنبيه")
                TxtConfirmPin.Focus()
                Exit Sub
            End If

            ' --- التأكد من وجود SessionID ---
            If String.IsNullOrEmpty(SessionID) Then
                MsgBox("لا توجد عملية دفع نشطة للتأكيد.", _
                       MsgBoxStyle.Exclamation + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                       "خطأ")
                Exit Sub
            End If

            ' --- تعطيل الزر أثناء المعالجة ---
            BtnConfirmPay.Enabled = False
            BtnConfirmPay.Text = "جاري التأكيد..."
            Application.DoEvents()

            ' --- الاتصال بخدمة أدفع لي للتأكيد ---
            Dim ws As New EdfaliService.NewEdfali
            Dim ConfirmPin As String = TxtConfirmPin.Text.Trim

            Dim Result As String = ws.OnlineConfTrans(EdfaliMobile, ConfirmPin, SessionID, EdfaliPW)

            ' --- إعادة تفعيل الزر ---
            BtnConfirmPay.Enabled = True
            BtnConfirmPay.Text = "✔  تأكيد الدفع"

            ' --- معالجة النتيجة ---
            If Result.Trim.ToUpper = "OK" Then
                MsgBox("تمت عملية الدفع بنجاح.", _
                       MsgBoxStyle.Information + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                       "نجاح")
                Me.DialogResult = Windows.Forms.DialogResult.OK
                Me.Close()
            Else
                MsgBox(GetEdfaliMessage(Result), _
                       MsgBoxStyle.Exclamation + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                       "فشل تأكيد الدفع")
            End If

        Catch ex As Exception
            BtnConfirmPay.Enabled = True
            BtnConfirmPay.Text = "✔  تأكيد الدفع"
            MsgBox("حدث خطأ أثناء تأكيد عملية الدفع:" & vbCrLf & ex.Message, _
                   MsgBoxStyle.Critical + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                   "خطأ")
        End Try
    End Sub

    ' ═══════════════════════════════════════════════
    '   السماح بالأرقام فقط في خانة الكود
    ' ═══════════════════════════════════════════════
    Private Sub TxtConfirmPin_KeyPress(ByVal sender As Object, ByVal e As System.Windows.Forms.KeyPressEventArgs) Handles TxtConfirmPin.KeyPress
        If Not Char.IsDigit(e.KeyChar) AndAlso e.KeyChar <> Chr(8) Then
            e.Handled = True
        End If
    End Sub

    ' ═══════════════════════════════════════════════
    '   زر الإغلاق
    ' ═══════════════════════════════════════════════
    Private Sub BtnClose_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles BtnClose.Click
        Me.DialogResult = Windows.Forms.DialogResult.Cancel
        Me.Close()
    End Sub

    ' ═══════════════════════════════════════════════
    '   ترجمة أكواد خطأ أدفعلي إلى رسائل عربية
    ' ═══════════════════════════════════════════════
    Private Function GetEdfaliMessage(ByVal Result As String) As String
        Select Case Result.Trim.ToUpper
            Case "OK"
                Return "تمت عملية الدفع بنجاح ✔"
            Case "PW1"
                Return "كلمة مرور خدمة الدفع غير صحيحة."
            Case "PW"
                Return "الرقم السري الخاص بخدمة أدفعلي غير صحيح."
            Case "LIMIT"
                Return "تجاوز الحد المسموح به للدفع."
            Case "ACC"
                Return "تعذر إتمام العملية، يرجى التأكد من رقم الهاتف أو تفعيل خدمة أدفعلي."
            Case "BAL"
                Return "تعذر إتمام العملية، يرجى المحاولة لاحقًا أو مراجعة المصرف."
            Case Else
                Return "تعذر إتمام العملية. رمز الاستجابة: " & Result
        End Select
    End Function

End Class