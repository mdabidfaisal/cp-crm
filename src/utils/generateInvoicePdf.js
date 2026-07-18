import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'

applyPlugin(jsPDF)

const FONT = 'times'
const TAN = [138, 125, 99]
const DARK = [28, 33, 32]
const GRAY = [120, 120, 120]
const LIGHT_GRAY = [230, 230, 230]

function fmt(n) {
  return 'BDT ' + (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return day + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
}

export async function generateInvoicePdf(invoice, client) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const ml = 20
  const mr = 20
  const cw = pw - ml - mr

  doc.setFont(FONT)

  // ── Top section: Logo + Company + INVOICE title ──
  try {
    const logo = await loadImage('/logo.png')
    doc.addImage(logo, 'PNG', ml, 12, 18, 18)
  } catch (_) {}

  doc.setFont(FONT, 'bold')
  doc.setFontSize(22)
  doc.text('Code Prophet Inc.', ml + 24, 22)

  doc.setFont(FONT, 'italic')
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Envisioning Tomorrow\u2019s Solutions', ml + 24, 30)
  doc.setTextColor(0)

  doc.setFont(FONT, 'bold')
  doc.setFontSize(32)
  doc.text('INVOICE', pw - mr, 22, { align: 'right' })

  // ── Decorative header band (tan) ──
  doc.setFillColor(...TAN)
  doc.rect(0, 33, pw, 12, 'F')

  // Thin white line inside the band
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.3)
  doc.line(ml, 39, pw - mr, 39)

  // ── Divider below the band ──
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(ml, 50, pw - mr, 50)

  // ── Bill To (left) ──
  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('BILL TO', ml, 60)
  doc.setTextColor(0)

  const clientName = client?.name || invoice.clientName || ''
  const clientCompany = client?.company || invoice.clientCompany || ''
  const clientAddress = client?.address || invoice.clientAddress || ''
  const clientEmail = client?.email || invoice.clientEmail || ''
  const clientPhone = client?.phone || invoice.clientPhone || ''

  const billToLines = []
  if (clientName) billToLines.push(clientName)
  if (clientCompany) billToLines.push(clientCompany)
  if (clientAddress) billToLines.push(clientAddress)
  if (clientEmail) billToLines.push(clientEmail)
  if (clientPhone) billToLines.push('Phone: ' + clientPhone)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  let by = 68
  billToLines.forEach((line, i) => {
    doc.text(line, ml, by + i * 5.5)
  })

  // ── Invoice Details (right) ──
  const invDetailStartY = 60
  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('INVOICE DETAILS', pw - mr, invDetailStartY, { align: 'right' })
  doc.setTextColor(0)

  const invDetails = [
    { label: 'Invoice No:', value: invoice.invoiceNumber },
    { label: 'Date:', value: fmtDate(invoice.date) },
  ]
  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  invDetails.forEach((d, i) => {
    doc.setFont(FONT, 'bold')
    doc.text(d.label, pw - mr, invDetailStartY + 8 + i * 6, { align: 'right' })
    const lw = doc.getTextWidth(d.label)
    doc.setFont(FONT, 'normal')
    doc.text(d.value, pw - mr - lw - 2, invDetailStartY + 8 + i * 6, { align: 'right' })
  })

  // ── Items Table ──
  const tableStartY = by + billToLines.length * 5.5 + 10

  const tableData = invoice.items.map((item, idx) => [
    (idx + 1).toString(),
    item.item || '',
    item.specification || '',
    String(item.quantity || 0),
    fmt(item.unitPrice || 0),
    fmt((item.quantity || 0) * (item.unitPrice || 0)),
  ])

  doc.autoTable({
    startY: tableStartY,
    tableWidth: cw,
    margin: { left: ml, right: mr },
    head: [['#', 'Work / Item', 'Feature / Specification', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    foot: [['', '', '', '', 'Subtotal', fmt(invoice.subtotal)]],
    theme: 'plain',
    styles: {
      font: FONT,
      fontSize: 9,
      cellPadding: 4,
      textColor: [30, 30, 30],
      lineColor: [210, 210, 210],
      lineWidth: 0.3,
    },
    headStyles: {
      font: FONT,
      fontStyle: 'bold',
      fontSize: 8,
      textColor: [...TAN],
      fillColor: [250, 250, 250],
      lineWidth: 0.5,
      lineColor: [200, 200, 200],
    },
    footStyles: {
      font: FONT,
      fontStyle: 'bold',
      fontSize: 9,
      textColor: [30, 30, 30],
      fillColor: [248, 248, 248],
      halign: 'right',
      lineWidth: 0.5,
      lineColor: [200, 200, 200],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 42, halign: 'left' },
      2: { cellWidth: 42, halign: 'left' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 34, halign: 'right' },
    },
  })

  // ── Total Due bar ──
  const fy = (doc.lastAutoTable?.finalY || 200) + 10
  doc.setFillColor(...TAN)
  doc.rect(ml, fy, cw, 10, 'F')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('Total Due:', ml + cw - 55, fy + 7)
  doc.text(fmt(invoice.total), pw - mr - 2, fy + 7, { align: 'right' })

  // ── Payment Details ──
  const paymentY = fy + 18
  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('PAYMENT DETAILS', ml, paymentY)
  doc.setTextColor(0)

  const paymentLines = [
    'Bank Name: Pubali Bank LTD',
    'Account Name: Code Prophet Inc.',
    'Account Number: 0099901003242',
    'Branch: Khulna Branch',
    'Routing Number: 175471722',
    'Swift Code: PUBABDDH211',
  ]
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9)
  paymentLines.forEach((line, i) => {
    doc.text(line, ml, paymentY + 6 + i * 5)
  })

  // ── Dark Footer Band ──
  const fh = 35
  const footerTop = ph - fh
  doc.setFillColor(...DARK)
  doc.rect(0, footerTop, pw, fh, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8)
  doc.text('Thank you for your business!', ml, footerTop + 10)
  doc.setFont(FONT, 'italic')
  doc.text('www.codeprophet.tech  |  www.codeprophet.com.bd', ml, footerTop + 18)
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 180)
  doc.text('This is a computer-generated invoice.', ml, footerTop + 26)

  // Company address on right side of footer
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(200, 200, 200)
  doc.text('Code Prophet Inc.', pw - mr, footerTop + 10, { align: 'right' })
  doc.text('6th Floor, Kapadia Dreams, 206 M A Bari St, Khulna 9000', pw - mr, footerTop + 17, { align: 'right' })
  doc.text('Phone: 01773-477697  |  Email: codeprophet.tech@gmail.com', pw - mr, footerTop + 24, { align: 'right' })

  doc.setTextColor(0)

  doc.save('Invoice-' + invoice.invoiceNumber + '.pdf')
}
