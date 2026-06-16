<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class Form2
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
        Me.BtnConfirmPay = New System.Windows.Forms.Button()
        Me.TxtConfirmPin = New System.Windows.Forms.TextBox()
        Me.LblTitle = New System.Windows.Forms.Label()
        Me.BtnClose = New System.Windows.Forms.Button()
        Me.LblInstruction = New System.Windows.Forms.Label()
        Me.LblCodeLabel = New System.Windows.Forms.Label()
        Me.LblAmountInfo = New System.Windows.Forms.Label()
        Me.SuspendLayout()
        '
        'LblTitle - شريط العنوان
        '
        Me.LblTitle.Anchor = CType(((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Left) _
                    Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.LblTitle.BackColor = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(150, Byte), Integer), CType(CType(136, Byte), Integer))
        Me.LblTitle.Font = New System.Drawing.Font("Droid Arabic Kufi", 11.0!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LblTitle.ForeColor = System.Drawing.Color.White
        Me.LblTitle.Location = New System.Drawing.Point(0, 0)
        Me.LblTitle.Name = "LblTitle"
        Me.LblTitle.RightToLeft = System.Windows.Forms.RightToLeft.Yes
        Me.LblTitle.Size = New System.Drawing.Size(280, 42)
        Me.LblTitle.TabIndex = 0
        Me.LblTitle.Text = "تأكيد عملية الدفع"
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
        Me.BtnClose.TabIndex = 5
        Me.BtnClose.Text = "✕"
        Me.BtnClose.UseVisualStyleBackColor = False
        '
        'LblInstruction - رسالة التوجيه
        '
        Me.LblInstruction.AutoSize = False
        Me.LblInstruction.Font = New System.Drawing.Font("Droid Arabic Kufi", 8.5!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LblInstruction.ForeColor = System.Drawing.Color.FromArgb(CType(CType(80, Byte), Integer), CType(CType(80, Byte), Integer), CType(CType(80, Byte), Integer))
        Me.LblInstruction.Location = New System.Drawing.Point(16, 54)
        Me.LblInstruction.Name = "LblInstruction"
        Me.LblInstruction.RightToLeft = System.Windows.Forms.RightToLeft.Yes
        Me.LblInstruction.Size = New System.Drawing.Size(248, 38)
        Me.LblInstruction.TabIndex = 6
        Me.LblInstruction.Text = "تم إرسال كود التأكيد إلى هاتفك عبر SMS، يرجى إدخاله أدناه"
        Me.LblInstruction.TextAlign = System.Drawing.ContentAlignment.MiddleRight
        '
        'LblAmountInfo - عرض المبلغ
        '
        Me.LblAmountInfo.AutoSize = False
        Me.LblAmountInfo.BackColor = System.Drawing.Color.FromArgb(CType(CType(232, Byte), Integer), CType(CType(245, Byte), Integer), CType(CType(233, Byte), Integer))
        Me.LblAmountInfo.Font = New System.Drawing.Font("Droid Arabic Kufi", 9.0!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LblAmountInfo.ForeColor = System.Drawing.Color.FromArgb(CType(CType(27, Byte), Integer), CType(CType(94, Byte), Integer), CType(CType(32, Byte), Integer))
        Me.LblAmountInfo.Location = New System.Drawing.Point(16, 96)
        Me.LblAmountInfo.Name = "LblAmountInfo"
        Me.LblAmountInfo.RightToLeft = System.Windows.Forms.RightToLeft.Yes
        Me.LblAmountInfo.Size = New System.Drawing.Size(248, 32)
        Me.LblAmountInfo.TabIndex = 7
        Me.LblAmountInfo.Text = "المبلغ: --- دينار"
        Me.LblAmountInfo.TextAlign = System.Drawing.ContentAlignment.MiddleCenter
        '
        'LblCodeLabel - تسمية خانة الكود
        '
        Me.LblCodeLabel.AutoSize = True
        Me.LblCodeLabel.Font = New System.Drawing.Font("Droid Arabic Kufi", 8.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LblCodeLabel.ForeColor = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(50, Byte), Integer), CType(CType(50, Byte), Integer))
        Me.LblCodeLabel.Location = New System.Drawing.Point(144, 140)
        Me.LblCodeLabel.Name = "LblCodeLabel"
        Me.LblCodeLabel.Size = New System.Drawing.Size(120, 21)
        Me.LblCodeLabel.TabIndex = 8
        Me.LblCodeLabel.Text = "كود التأكيد المرسل"
        '
        'TxtConfirmPin - خانة إدخال الكود
        '
        Me.TxtConfirmPin.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle
        Me.TxtConfirmPin.Font = New System.Drawing.Font("Courier New", 14.0!, System.Drawing.FontStyle.Bold)
        Me.TxtConfirmPin.Location = New System.Drawing.Point(16, 164)
        Me.TxtConfirmPin.MaxLength = 10
        Me.TxtConfirmPin.Name = "TxtConfirmPin"
        Me.TxtConfirmPin.Size = New System.Drawing.Size(248, 30)
        Me.TxtConfirmPin.TabIndex = 1
        Me.TxtConfirmPin.TextAlign = System.Windows.Forms.HorizontalAlignment.Center
        '
        'BtnConfirmPay - زر تأكيد الدفع
        '
        Me.BtnConfirmPay.BackColor = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(150, Byte), Integer), CType(CType(136, Byte), Integer))
        Me.BtnConfirmPay.FlatAppearance.BorderSize = 0
        Me.BtnConfirmPay.FlatStyle = System.Windows.Forms.FlatStyle.Flat
        Me.BtnConfirmPay.Font = New System.Drawing.Font("Droid Arabic Kufi", 9.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.BtnConfirmPay.ForeColor = System.Drawing.Color.White
        Me.BtnConfirmPay.Location = New System.Drawing.Point(16, 208)
        Me.BtnConfirmPay.Name = "BtnConfirmPay"
        Me.BtnConfirmPay.Size = New System.Drawing.Size(248, 36)
        Me.BtnConfirmPay.TabIndex = 2
        Me.BtnConfirmPay.Text = "✔  تأكيد الدفع"
        Me.BtnConfirmPay.UseVisualStyleBackColor = False
        '
        'Form2
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.BackColor = System.Drawing.Color.White
        Me.ClientSize = New System.Drawing.Size(280, 260)
        Me.ControlBox = False
        Me.Controls.Add(Me.BtnClose)
        Me.Controls.Add(Me.LblTitle)
        Me.Controls.Add(Me.LblInstruction)
        Me.Controls.Add(Me.LblAmountInfo)
        Me.Controls.Add(Me.LblCodeLabel)
        Me.Controls.Add(Me.TxtConfirmPin)
        Me.Controls.Add(Me.BtnConfirmPay)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle
        Me.Name = "Form2"
        Me.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent
        Me.Text = "تأكيد الدفع - أدفع لي"
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub

    Friend WithEvents BtnConfirmPay As System.Windows.Forms.Button
    Friend WithEvents TxtConfirmPin As System.Windows.Forms.TextBox
    Friend WithEvents LblTitle As System.Windows.Forms.Label
    Friend WithEvents BtnClose As System.Windows.Forms.Button
    Friend WithEvents LblInstruction As System.Windows.Forms.Label
    Friend WithEvents LblCodeLabel As System.Windows.Forms.Label
    Friend WithEvents LblAmountInfo As System.Windows.Forms.Label

End Class
