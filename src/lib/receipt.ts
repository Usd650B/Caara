import { Order } from './firestore'

export interface ReceiptData {
  order: Order
  receiptNumber: string
  issuedDate: string
  subtotal: number
  shipping: number
  total: number
}

export const generateReceiptPDF = (receiptData: ReceiptData): string => {
  const { order, receiptNumber, issuedDate, subtotal, shipping, total } = receiptData
  
  // Create HTML content for receipt
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CARA Order Receipt</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          margin: 0;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .receipt-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border: 2px solid #000;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 48px;
          font-weight: 900;
          letter-spacing: -2px;
          margin-bottom: 10px;
        }
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 15px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .item-details {
          flex: 1;
        }
        .item-name {
          font-weight: bold;
        }
        .item-meta {
          font-size: 12px;
          color: #666;
        }
        .item-price {
          text-align: right;
          font-weight: bold;
        }
        .totals {
          margin-top: 20px;
          border-top: 2px solid #000;
          padding-top: 15px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .total-row.final {
          font-weight: bold;
          font-size: 18px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #000;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-processing { background: #dbeafe; color: #1e40af; }
        .status-shipped { background: #e9d5ff; color: #6b21a8; }
        .status-delivered { background: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="logo">CARA</div>
          <div>Order Receipt</div>
        </div>
        
        <div class="receipt-info">
          <div>
            <strong>Receipt #:</strong> ${receiptNumber}<br>
            <strong>Order #:</strong> ${order.id}<br>
            <strong>Date:</strong> ${issuedDate}
          </div>
          <div>
            <strong>Status:</strong> 
            <span class="status-badge status-${order.status}">${order.status}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div>
            <strong>Name:</strong> ${order.customerName}<br>
            <strong>Email:</strong> ${order.customerEmail}<br>
            <strong>Phone:</strong> ${order.customerPhone || 'N/A'}<br>
            ${order.customerWhatsapp ? `<strong>WhatsApp:</strong> ${order.customerWhatsapp}<br>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Shipping Address</div>
          <div>
            ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.phone}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          ${order.items?.map(item => `
            <div class="order-item">
              <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-meta">
                  ${item.size ? `Size: ${item.size}` : ''} 
                  ${item.color ? `| Color: ${item.color}` : ''} 
                  | Qty: ${item.quantity}
                </div>
              </div>
              <div class="item-price">
                $${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          `).join('') || ''}
        </div>

        <div class="section totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Shipping (${order.shippingMethod}):</span>
            <span>$${shipping.toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        ${order.notes ? `
        <div class="section">
          <div class="section-title">Order Notes</div>
          <div>${order.notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          <div>Thank you for shopping at CARA!</div>
          <div>Every Queen Wear CARA</div>
          <div style="margin-top: 10px;">
            This is a computer-generated receipt and does not require a signature.<br>
            For questions about your order, please contact us at support@cara.com
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  return htmlContent
}

export const downloadReceipt = (receiptData: ReceiptData) => {
  const htmlContent = generateReceiptPDF(receiptData)
  
  // Create a blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' })
  
  // Create a download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `CARA-Receipt-${receiptData.order.id}.html`
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  URL.revokeObjectURL(url)
}

export const generateReceiptNumber = (orderId: string): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `RCPT-${year}${month}${day}-${random}`
}
