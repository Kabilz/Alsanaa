<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class Form1
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Me.BtnPay = New System.Windows.Forms.Button()
        Me.TxtMobile = New System.Windows.Forms.TextBox()
        Me.Label1 = New System.Windows.Forms.Label()
        Me.TxtAmount = New System.Windows.Forms.TextBox()
        Me.Label2 = New System.Windows.Forms.Label()
        Me.BtnClose = New System.Windows.Forms.Button()
        Me.LblTitle = New System.Windows.Forms.Label()
        Me.LblMobileHint = New System.Windows.Forms.Label()
        Me.SuspendLayout()
        '
        'LblTitle - شريط العنوان
        '
        Me.LblTitle.Anchor = CType(((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.LblTitle.BackColor = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(120, Byte), Integer), CType(CType(212, Byte), Integer))
        Me.LblTitle.FlatStyle = System.Windows.Forms.FlatStyle.Flat
        Me.LblTitle.Font = New System.Drawing.Font("Droid Arabic Kufi", 11.0!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LblTitle.ForeColor = System.Drawing.Color.White
        Me.LblTitle.Location = New System.Drawing.Point(0, 0)
        Me.LblTitle.Name = "LblTitle"
        Me.LblTitle.RightToLeft = System.Windows.Forms.RightToLeft.Yes
        Me.LblTitle.Size = New System.Drawing.Size(280, 42)
        Me.LblTitle.TabIndex = 10
        Me.LblTitle.Text = "الدفع بخدمة أدفع لي"
        Me.LblTitle.TextAlign = System.Drawing.ContentAlignment.MiddleCenter
        '
        'BtnClose - زر الإغلاق
        '
        Me.BtnClose.BackColor = System.Drawing.Color.FromArgb(CType(CType(198, Byte), Integer), CType(CType(40, Byte), Integer), CType(CType(40, Byte), Integer))
        Me.BtnClose.FlatAppearance.BorderSize = 0
        Me.BtnClose.FlatStyle = System.Windows.Forms.FlatStyle.Flat
        Me.BtnClose.Font = New System.Drawing.Font("Tahoma", 11.0!, System.Drawing.FontStyle.Bold)
        Me.BtnClose.ForeColor = System.Drawing.Color.White
        Me.BtnClose.Location = New System.Drawing.Point(244, 0)
        Me.BtnClose.Name = "BtnClose"
        Me.BtnClose.Size = New System.Drawing.Size(36, 42)
        Me.BtnClose.TabIndex = 11
        Me.BtnClose.Text = "✕"
        Me.BtnClose.UseVisualStyleBackColor = False
        '
        'Label1 - تسمية رقم الهاتف
        '
        Me.Label1.AutoSize = True
        Me.Label1.Font = New System.Drawing.Font("Droid Arabic Kufi", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label1.ForeColor = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(50, Byte), Integer), CType(CType(50, Byte), Integer))
        Me.Label1.Location = New System.Drawing.Point(100, 58)
        Me.Label1.Name = "Label1"
        Me.Label1.Size = New System.Drawing.Size(162, 21)
        Me.Label1.TabIndex = 2
        Me.Label1.Text = "رقم الهاتف المرتبط بالخدمة"
        '
        'TxtMobile - خانة رقم الهاتف
        '
        Me.TxtMobile.Font = New System.Drawing.Font("Droid Arabic Kufi", 10.0!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.TxtMobile.Location = New System.Drawing.Point(16, 82)
        Me.TxtMobile.MaxLength = 9
        Me.TxtMobile.Name = "TxtMobile"
        Me.TxtMobile.Size = New System.Drawing.Size(248, 30)
        Me.TxtMobile.TabIndex = 1
        Me.TxtMobile.TextAlign = System.Windows.Forms.HorizontalAlignment.Right
        Me.TxtMobile.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle
        '
        'LblMobileHint - تلميح رقم الهاتف
        '
        Me.LblMobileHint.AutoSize = True
        Me.LblMobileHint.Font = New System.Drawing.Font("Droid Arabic Kufi", 7.5!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LblMobileHint.ForeColor = System.Drawing.Color.Gray
        Me.LblMobileHint.Location = New System.Drawing.Point(130, 116)
        Me.LblMobileHint.Name = "LblMobileHint"
        Me.LblMobileHint.TabIndex = 12
        Me.LblMobileHint.Text = "مثال: 912345678"
        '
        'Label2 - تسمية المبلغ
        '
        Me.Label2.AutoSize = True
        Me.Label2.Font = New System.Drawing.Font("Droid Arabic Kufi", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Label2.ForeColor = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(50, Byte), Integer), CType(CType(50, Byte), Integer))
        Me.Label2.Location = New System.Drawing.Point(172, 135)
        Me.Label2.Name = "Label2"
        Me.Label2.Size = New System.Drawing.Size(90, 21)
        Me.Label2.TabIndex = 4
        Me.Label2.Text = "القيمة بالدينار"
        '
        'TxtAmount - خانة المبلغ
        '
        Me.TxtAmount.Font = New System.Drawing.Font("Droid Arabic Kufi", 10.0!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.TxtAmount.Location = New System.Drawing.Point(16, 159)
        Me.TxtAmount.Name = "TxtAmount"
        Me.TxtAmount.Size = New System.Drawing.Size(248, 30)
        Me.TxtAmount.TabIndex = 3
        Me.TxtAmount.TextAlign = System.Windows.Forms.HorizontalAlignment.Right
        Me.TxtAmount.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle
        '
        'BtnPay - زر الدفع
        '
        Me.BtnPay.BackColor = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(120, Byte), Integer), CType(CType(212, Byte), Integer))
        Me.BtnPay.FlatAppearance.BorderSize = 0
        Me.BtnPay.FlatStyle = System.Windows.Forms.FlatStyle.Flat
        Me.BtnPay.Font = New System.Drawing.Font("Droid Arabic Kufi", 9.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.BtnPay.ForeColor = System.Drawing.Color.White
        Me.BtnPay.Location = New System.Drawing.Point(16, 202)
        Me.BtnPay.Name = "BtnPay"
        Me.BtnPay.Size = New System.Drawing.Size(248, 36)
        Me.BtnPay.TabIndex = 0
        Me.BtnPay.Text = "▶  إرسال طلب الدفع"
        Me.BtnPay.UseVisualStyleBackColor = False
        '
        'Form1
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.BackColor = System.Drawing.Color.White
        Me.ClientSize = New System.Drawing.Size(280, 254)
        Me.ControlBox = False
        Me.Controls.Add(Me.BtnClose)
        Me.Controls.Add(Me.LblTitle)
        Me.Controls.Add(Me.LblMobileHint)
        Me.Controls.Add(Me.Label2)
        Me.Controls.Add(Me.TxtAmount)
        Me.Controls.Add(Me.Label1)
        Me.Controls.Add(Me.TxtMobile)
        Me.Controls.Add(Me.BtnPay)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle
        Me.Name = "Form1"
        Me.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen
        Me.Text = "أدفع لي - نظام الدفع الإلكتروني"
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub
    Friend WithEvents BtnPay As System.Windows.Forms.Button
    Friend WithEvents TxtMobile As System.Windows.Forms.TextBox
    Friend WithEvents Label1 As System.Windows.Forms.Label
    Friend WithEvents TxtAmount As System.Windows.Forms.TextBox
    Friend WithEvents Label2 As System.Windows.Forms.Label
    Friend WithEvents BtnClose As System.Windows.Forms.Button
    Friend WithEvents LblTitle As System.Windows.Forms.Label
    Friend WithEvents LblMobileHint As System.Windows.Forms.Label

End Class
