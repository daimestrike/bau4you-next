export const optimizePrintLayout = () => {
  // Remove all non-essential elements for print
  const elements = document.querySelectorAll('*:not(.proposal-print-content):not(.proposal-print-content *)')
  elements.forEach(el => {
    const element = el as HTMLElement
    if (!element.closest('.proposal-print-content')) {
      element.style.display = 'none'
    }
  })
}

export const restoreLayout = () => {
  // Restore all elements after print
  const elements = document.querySelectorAll('*')
  elements.forEach(el => {
    const element = el as HTMLElement
    if (element.style.display === 'none') {
      element.style.display = ''
    }
  })
}

export const createPrintStyles = () => {
  const style = document.createElement('style')
  style.id = 'print-optimization'
  style.innerHTML = `
    @media print {
      @page {
        margin: 10mm;
        size: A4 portrait;
      }
      
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      
      /* Hide only specific interface elements */
      header,
      nav,
      footer,
      .no-print,
      [class*="sticky"],
      [class*="fixed"],
      button:not(.print-only),
      .bg-gradient-to-br {
        display: none !important;
      }
      
      .proposal-print-content {
        display: block !important;
        position: static !important;
        margin: 0 !important;
        padding: 10mm !important;
        width: 100% !important;
        max-width: none !important;
        background: white !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        color: #000 !important;
        font-size: 12pt !important;
        line-height: 1.4 !important;
      }
      
      .proposal-print-content * {
        color: #000 !important;
        background: transparent !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
      
      .proposal-print-content table {
        border-collapse: collapse !important;
        width: 100% !important;
        margin: 8pt 0 !important;
      }
      
      .proposal-print-content th,
      .proposal-print-content td {
        border: 1pt solid #000 !important;
        padding: 4pt 6pt !important;
        text-align: left !important;
        vertical-align: top !important;
        background: white !important;
      }
      
      .proposal-print-content th {
        background: #f5f5f5 !important;
        font-weight: bold !important;
      }
      
      .proposal-print-content h1,
      .proposal-print-content h2,
      .proposal-print-content h3,
      .proposal-print-content h4 {
        color: #000 !important;
        font-weight: bold !important;
        margin: 10pt 0 6pt 0 !important;
      }
      
      .proposal-print-content h1 {
        font-size: 18pt !important;
      }
      
      .proposal-print-content h2 {
        font-size: 16pt !important;
      }
      
      .proposal-print-content h3,
      .proposal-print-content h4 {
        font-size: 14pt !important;
      }
      
      .proposal-print-content img {
        max-width: 50mm !important;
        max-height: 50mm !important;
        object-fit: contain !important;
      }
      
      .proposal-print-content p {
        margin: 4pt 0 !important;
      }
      
      /* Page break controls */
      .no-page-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  `
  return style
}

export const removePrintStyles = () => {
  const existingStyle = document.getElementById('print-optimization')
  if (existingStyle) {
    existingStyle.remove()
  }
}

export const printProposal = (title: string = 'Коммерческое предложение') => {
  const originalTitle = document.title
  document.title = title
  
  // Add print-specific styles
  const printStyle = createPrintStyles()
  document.head.appendChild(printStyle)
  
  // Trigger print
  window.print()
  
  // Cleanup after print dialog closes
  setTimeout(() => {
    removePrintStyles()
    document.title = originalTitle
  }, 1000)
}

export const exportToPDF = (title: string = 'Коммерческое предложение') => {
  // For now, use the same print function
  // In the future, this could be enhanced with jsPDF or other PDF libraries
  printProposal(title)
}

export const generateWordContent = (proposalData: any): string => {
  const { companyInfo, header, beforeTable, afterTable, businessCard, items, additionalServices, discount } = proposalData
  
  // Calculate totals
  const itemsTotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
  const servicesTotal = additionalServices
    .filter((service: any) => service.addToTotal)
    .reduce((sum: number, service: any) => sum + service.price, 0)
  const subtotal = itemsTotal + servicesTotal
  const total = subtotal - (subtotal * discount / 100)
  
  // Generate RTF content that Word can open
  let rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
{\\colortbl;\\red0\\green0\\blue0;\\red128\\green128\\blue128;}
\\f0\\fs24

{\\b\\fs32 ${header}}\\par\\par

{\\b Информация о компании:}\\par
${companyInfo.name}\\par
${companyInfo.address}\\par
Тел: ${companyInfo.phone}\\par
Email: ${companyInfo.email}\\par
Сайт: ${companyInfo.website}\\par
${companyInfo.tax_id}\\par\\par

${beforeTable.replace(/\n/g, '\\par')}\\par\\par

{\\b Перечень работ и материалов:}\\par\\par

{\\trowd\\trgaph108\\trleft-108
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx1500
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx3500
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx4500
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx5500
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx7000
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx8500
{\\b Операция}\\cell
{\\b Материал/Услуга}\\cell
{\\b Кол-во}\\cell
{\\b Ед.изм}\\cell
{\\b Цена за ед.}\\cell
{\\b Сумма}\\cell
\\row}

`

  // Add table rows
  items.forEach((item: any) => {
    rtfContent += `{\\trowd\\trgaph108\\trleft-108
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx1500
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx3500
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx4500
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx5500
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx7000
\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx8500
${item.operation}\\cell
${item.product}\\cell
${item.quantity}\\cell
${item.unit}\\cell
${item.pricePerUnit.toLocaleString('ru-RU')}\\cell
${item.totalPrice.toLocaleString('ru-RU')}\\cell
\\row}
`
  })

  // Add additional services if any
  if (additionalServices.length > 0) {
    rtfContent += `\\par\\par{\\b Дополнительные услуги:}\\par\\par`
    
    additionalServices.forEach((service: any) => {
      rtfContent += `${service.name}: ${service.price.toLocaleString('ru-RU')}${service.addToTotal ? ' (включено в итого)' : ' (отдельно)'}\\par`
    })
  }

  // Add totals
  rtfContent += `\\par\\par{\\b Итого к оплате:}\\par
Стоимость работ и материалов: ${itemsTotal.toLocaleString('ru-RU')}\\par`

  if (servicesTotal > 0) {
    rtfContent += `Дополнительные услуги: ${servicesTotal.toLocaleString('ru-RU')}\\par`
  }

  if (discount > 0) {
    rtfContent += `Скидка ${discount}%: -${((subtotal * discount) / 100).toLocaleString('ru-RU')}\\par`
  }

  rtfContent += `{\\b\\fs28 ИТОГО: ${total.toLocaleString('ru-RU')}}\\par\\par`

  rtfContent += `${afterTable.replace(/\n/g, '\\par')}\\par\\par`

  rtfContent += `{\\b Контактная информация:}\\par
${businessCard.replace(/\n/g, '\\par')}\\par

}`

  return rtfContent
}

export const exportToWord = (proposalData: any, filename: string = 'commercial-proposal') => {
  try {
    const rtfContent = generateWordContent(proposalData)
    
    const blob = new Blob([rtfContent], { 
      type: 'application/rtf' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.rtf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error exporting to Word:', error)
    return false
  }
}

// Alternative HTML-based Word export
export const exportToWordHTML = (proposalData: any, filename: string = 'commercial-proposal') => {
  try {
    const { companyInfo, header, beforeTable, afterTable, businessCard, items, additionalServices, discount } = proposalData
    
    // Calculate totals
    const itemsTotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
    const servicesTotal = additionalServices
      .filter((service: any) => service.addToTotal)
      .reduce((sum: number, service: any) => sum + service.price, 0)
    const subtotal = itemsTotal + servicesTotal
    const total = subtotal - (subtotal * discount / 100)
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${header}</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; margin: 20mm; }
        h1 { font-size: 18pt; text-align: center; margin-bottom: 20pt; }
        h2 { font-size: 14pt; margin-top: 15pt; margin-bottom: 8pt; }
        table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
        th, td { border: 1pt solid black; padding: 6pt; text-align: left; vertical-align: top; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .company-info { margin-bottom: 20pt; }
        .totals { margin-top: 15pt; font-weight: bold; }
        .final-total { font-size: 14pt; margin-top: 10pt; }
        .text-section { margin: 15pt 0; text-align: justify; }
        .business-card { margin-top: 20pt; font-style: italic; }
    </style>
</head>
<body>
    <h1>${header}</h1>
    
    <div class="company-info">
        <h2>Информация о компании:</h2>
        <p><strong>${companyInfo.name}</strong><br>
        ${companyInfo.address}<br>
        Тел: ${companyInfo.phone}<br>
        Email: ${companyInfo.email}<br>
        Сайт: ${companyInfo.website}<br>
        ${companyInfo.tax_id}</p>
    </div>
    
    <div class="text-section">
        ${beforeTable.replace(/\n/g, '<br>')}
    </div>
    
    <h2>Перечень работ и материалов:</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 20%">Операция</th>
                <th style="width: 25%">Материал/Услуга</th>
                <th style="width: 10%">Кол-во</th>
                <th style="width: 10%">Ед.изм</th>
                <th style="width: 15%">Цена за ед.</th>
                <th style="width: 20%">Сумма</th>
            </tr>
        </thead>
        <tbody>
            ${items.map((item: any) => `
                         <tr>
                 <td>${item.operation}</td>
                 <td>${item.product}</td>
                 <td>${item.quantity}</td>
                 <td>${item.unit}</td>
                 <td>${item.pricePerUnit.toLocaleString('ru-RU')}</td>
                 <td>${item.totalPrice.toLocaleString('ru-RU')}</td>
             </tr>
            `).join('')}
        </tbody>
    </table>
    
    ${additionalServices.length > 0 ? `
    <h2>Дополнительные услуги:</h2>
    <ul>
        ${additionalServices.map((service: any) => `
                 <li>${service.name}: ${service.price.toLocaleString('ru-RU')} ${service.addToTotal ? '(включено в итого)' : '(отдельно)'}</li>
        `).join('')}
    </ul>
    ` : ''}
    
         <div class="totals">
         <p>Стоимость работ и материалов: ${itemsTotal.toLocaleString('ru-RU')}</p>
         ${servicesTotal > 0 ? `<p>Дополнительные услуги: ${servicesTotal.toLocaleString('ru-RU')}</p>` : ''}
         ${discount > 0 ? `<p>Скидка ${discount}%: -${((subtotal * discount) / 100).toLocaleString('ru-RU')}</p>` : ''}
         <p class="final-total">ИТОГО: ${total.toLocaleString('ru-RU')}</p>
     </div>
    
    <div class="text-section">
        ${afterTable.replace(/\n/g, '<br>')}
    </div>
    
    <div class="business-card">
        <h2>Контактная информация:</h2>
        ${businessCard.replace(/\n/g, '<br>')}
    </div>
</body>
</html>`
    
    const blob = new Blob([htmlContent], { 
      type: 'application/msword' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error exporting to Word HTML:', error)
    return false
  }
} 