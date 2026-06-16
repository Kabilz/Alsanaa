Public Class Form1

    ' ═══════════════════════════════════════════════
    '   بيانات التاجر في خدمة أدفع لي
    ' ═══════════════════════════════════════════════
    Private Const MERCHANT_MOBILE As String = "923987512"   ' رقم حساب التاجر بدون صفر
    Private Const MERCHANT_PIN As String = "6529"           ' الرقم السري للتاجر
    Private Const SERVICE_PW As String = "123@xdsr$#!!"     ' كلمة مرور خدمة API

    ' ═══════════════════════════════════════════════
    '   زر إرسال طلب الدفع
    ' ═══════════════════════════════════════════════
    Private Sub BtnPay_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles BtnPay.Click
        Try
            ' --- التحقق من رقم الهاتف ---
            If TxtMobile.Text.Trim = "" Then
                MsgBox("الرجاء إدخال رقم الهاتف", _
                       MsgBoxStyle.Exclamation + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                       "تنبيه")
                TxtMobile.Focus()
                Exit Sub
            End If

            If TxtMobile.Text.Trim.Length <> 9 OrElse Not TxtMobile.Text.Trim.StartsWith("9") Then
                MsgBox("رقم الهاتف يجب أن يكون 9 أرقام ويبدأ بالرقم 9" & vbCrLf & "مثال: 912345678", _
                       MsgBoxStyle.Exclamation + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                       "رقم غير صحيح")
                TxtMobile.Focus()
                Exit Sub
            End If

            ' --- التحقق من المبلغ ---
            If TxtAmount.Text.Trim = "" OrElse Val(TxtAmount.Text) <= 0 Then
                MsgBox("الرجاء إدخال القيمة المالية بشكل صحيح", _
                       MsgBoxStyle.Exclamation + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                       "تنبيه")
                TxtAmount.Focus()
                Exit Sub
            End If

            ' --- إعداد البيانات ---
            Dim Cmobile As String = "+218" & TxtMobile.Text.Trim     ' رقم العميل بالصيغة الدولية
            Dim Amount As Decimal = CDec(Val(TxtAmount.Text))         ' المبلغ

            ' --- الاتصال بخدمة أدفع لي ---
            BtnPay.Enabled = False
            BtnPay.Text = "جاري الإرسال..."
            Application.DoEvents()

            Dim ws As New EdfaliService.NewEdfali
            Dim Result As String = ws.DoPTrans(MERCHANT_MOBILE, MERCHANT_PIN, Cmobile, Amount, SERVICE_PW)

            BtnPay.Enabled = True
            BtnPay.Text = "▶  إرسال طلب الدفع"

            ' --- معالجة النتيجة ---
            If IsNumeric(Result) Then
                ' السيرفر رجّع SessionID  → نفتح فورم التأكيد
                Dim f As New Form2
                f.EdfaliMobile = MERCHANT_MOBILE
                f.EdfaliPW = SERVICE_PW
                f.SessionID = Result
                f.AmountValue = Amount
                f.CustomerMobile = Cmobile
                f.ShowDialog(Me)

                ' بعد إغلاق Form2 نمسح الحقول
                TxtMobile.Clear()
                TxtAmount.Clear()
            Else
                ' السيرفر رجّع كود خطأ
                MsgBox(GetEdfaliMessage(Result), _
                       MsgBoxStyle.Exclamation + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                       "عملية الدفع")
            End If

        Catch ex As Exception
            BtnPay.Enabled = True
            BtnPay.Text = "▶  إرسال طلب الدفع"
            MsgBox("حدث خطأ أثناء تنفيذ عملية الدفع:" & vbCrLf & ex.Message, _
                   MsgBoxStyle.Critical + MsgBoxStyle.MsgBoxRight + MsgBoxStyle.MsgBoxRtlReading, _
                   "خطأ")
        End Try
    End Sub

    ' ═══════════════════════════════════════════════
    '   منع إدخال حروف في خانة رقم الهاتف
    ' ═══════════════════════════════════════════════
    Private Sub TxtMobile_KeyPress(ByVal sender As Object, ByVal e As System.Windows.Forms.KeyPressEventArgs) Handles TxtMobile.KeyPress
        ' السماح فقط بالأرقام + Backspace
        If Not Char.IsDigit(e.KeyChar) AndAlso e.KeyChar <> Chr(8) Then
            e.Handled = True
            Exit Sub
        End If
        ' منع البدء بـ 0 (الموبايل الليبي يبدأ بـ 9)
        If e.KeyChar = "0"c AndAlso TxtMobile.Text.Trim = "" Then
            e.Handled = True
        End If
    End Sub

    ' ═══════════════════════════════════════════════
    '   منع إدخال غير أرقام في خانة المبلغ
    ' ═══════════════════════════════════════════════
    Private Sub TxtAmount_KeyPress(ByVal sender As Object, ByVal e As System.Windows.Forms.KeyPressEventArgs) Handles TxtAmount.KeyPress
        ' السماح بالأرقام والنقطة العشرية وBackspace فقط
        If Not Char.IsDigit(e.KeyChar) AndAlso e.KeyChar <> "."c AndAlso e.KeyChar <> Chr(8) Then
            e.Handled = True
            Exit Sub
        End If
        ' منع تكرار النقطة العشرية
        If e.KeyChar = "."c AndAlso TxtAmount.Text.Contains(".") Then
            e.Handled = True
        End If
    End Sub

    ' ═══════════════════════════════════════════════
    '   زر الإغلاق
    ' ═══════════════════════════════════════════════
    Private Sub BtnClose_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles BtnClose.Click
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
