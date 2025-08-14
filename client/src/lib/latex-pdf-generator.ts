// Enhanced PDF generation using React-PDF with Bengali support
export interface TransactionReportData {
  businessName: string;
  ownerName: string;
  reportDate: string;
  totalSales: number;
  totalExpenses: number;
  totalCollections: number;
  netProfit: number;
  transactionCount: number;
  transactions: any[];
  periodTitle: string;
}

export interface BusinessInfo {
  businessName: string;
  ownerName: string;
  phone?: string;
  address?: string;
}

export interface SaleData {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_method: string;
  sale_date: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: number;
  }>;
}

export interface CustomerData {
  id: string;
  name: string;
  phone_number?: string;
  address?: string;
}

// These will be used by the React-PDF components
export const createTransactionReportData = (data: TransactionReportData): TransactionReportData => {
  return {
    ...data,
    reportDate: data.reportDate || new Date().toLocaleDateString('bn-BD'),
    periodTitle: data.periodTitle || 'সার্বিক প্রতিবেদন'
  };
};

% Page setup
\\geometry{
  a4paper,
  left=2cm,
  right=2cm,
  top=2.5cm,
  bottom=2.5cm,
  headheight=1.5cm,
  headsep=0.5cm
}

% Font setup for Bengali
\\setmainfont{Noto Sans Bengali}
\\newfontfamily{\\englishfont}{Arial}

% Colors
\\definecolor{primaryblue}{RGB}{37, 99, 235}
\\definecolor{successgreen}{RGB}{34, 197, 94}
\\definecolor{dangerred}{RGB}{239, 68, 68}
\\definecolor{lightgray}{RGB}{248, 250, 252}

% Header and footer
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0.5pt}

\\fancyhead[L]{
  \\begin{tikzpicture}[remember picture, overlay]
    \\fill[primaryblue] (0,0) rectangle (\\paperwidth,2cm);
    \\node[white, font=\\Large\\bfseries] at (8cm,1cm) {${data.businessName}};
    \\node[white, font=\\normalsize] at (8cm,0.5cm) {ব্যবসায়িক প্রতিবেদন};
  \\end{tikzpicture}
}

\\fancyfoot[C]{\\small পৃষ্ঠা \\thepage \\ | \\ তৈরি: ${data.reportDate}}

\\begin{document}

% Title section with business info
\\vspace{2cm}
\\begin{center}
  \\textcolor{primaryblue}{\\Huge\\textbf{লেনদেন প্রতিবেদন}}\\\\[0.5cm]
  \\Large ${data.periodTitle}\\\\[0.3cm]
  \\large মালিক: ${data.ownerName}\\\\[0.2cm]
  \\normalsize প্রতিবেদনের তারিখ: ${data.reportDate}
\\end{center}

\\vspace{1cm}

% Summary Cards
\\begin{center}
\\begin{tcolorbox}[
  colback=lightgray,
  colframe=primaryblue,
  width=\\textwidth,
  arc=5pt,
  boxrule=1pt
]
\\centering
\\Large\\textbf{আর্থিক সারসংক্ষেপ}\\\\[0.5cm]

\\begin{tabular}{|p{4cm}|p{4cm}|p{4cm}|}
\\hline
\\rowcolor{successgreen!20}
\\textbf{\\textcolor{successgreen}{মোট বিক্রয়}} & 
\\textbf{\\textcolor{dangerred}{মোট খরচ}} & 
\\textbf{\\textcolor{primaryblue}{মোট আদায়}} \\\\
\\hline
\\Large ${formatCurrency(data.totalSales)} টাকা & 
\\Large ${formatCurrency(data.totalExpenses)} টাকা & 
\\Large ${formatCurrency(data.totalCollections)} টাকা \\\\
\\hline
\\end{tabular}

\\vspace{0.5cm}

\\begin{tcolorbox}[
  colback=${data.netProfit >= 0 ? 'successgreen' : 'dangerred'}!10,
  colframe=${data.netProfit >= 0 ? 'successgreen' : 'dangerred'},
  width=8cm,
  arc=3pt
]
\\centering
\\textbf{নিট লাভ/ক্ষতি}\\\\
\\Huge\\textbf{\\textcolor{${data.netProfit >= 0 ? 'successgreen' : 'dangerred'}}{${formatCurrency(Math.abs(data.netProfit))} টাকা}}\\\\
\\normalsize ${data.netProfit >= 0 ? '(লাভ)' : '(ক্ষতি)'}
\\end{tcolorbox}
\\end{tcolorbox}
\\end{center}

\\vspace{1cm}

% Transaction Statistics
\\section{লেনদেন পরিসংখ্যান}

\\begin{itemize}
  \\item \\textbf{মোট লেনদেন:} ${toBengaliNumber(data.transactionCount)}টি
  \\item \\textbf{গড় বিক্রয়:} ${data.transactionCount > 0 ? formatCurrency(data.totalSales / data.transactionCount) : '০'} টাকা
  \\item \\textbf{রিপোর্ট তৈরির সময়:} ${new Date().toLocaleString('bn-BD')}
\\end{itemize}

\\vspace{1cm}

% Detailed Transaction Table (if transactions provided)
${data.transactions && data.transactions.length > 0 ? `
\\section{বিস্তারিত লেনদেন তালিকা}

\\small
\\begin{longtable}{|p{2cm}|p{3cm}|p{4cm}|p{2.5cm}|p{2cm}|}
\\hline
\\rowcolor{lightgray}
\\textbf{তারিখ} & \\textbf{ধরন} & \\textbf{বিবরণ} & \\textbf{পরিমাণ} & \\textbf{পদ্ধতি} \\\\
\\hline
\\endhead

${data.transactions.slice(0, 20).map(txn => `
${new Date(txn.date).toLocaleDateString('bn-BD')} & 
${txn.type === 'sale' ? 'বিক্রয়' : txn.type === 'expense' ? 'খরচ' : 'আদায়'} & 
${txn.description || 'N/A'} & 
${formatCurrency(txn.amount)} টাকা & 
${txn.method || 'নগদ'} \\\\
\\hline`).join('')}

\\end{longtable}

${data.transactions.length > 20 ? `\\textit{দ্রষ্টব্য: শুধুমাত্র সাম্প্রতিক ২০টি লেনদেন দেখানো হয়েছে}` : ''}
` : ''}

\\vspace{2cm}

% Footer with business info and signature
\\begin{center}
\\rule{\\textwidth}{0.5pt}\\\\[0.5cm]
\\textbf{${data.businessName}}\\\\
\\textit{মালিক: ${data.ownerName}}\\\\[1cm]

\\begin{minipage}{0.4\\textwidth}
\\centering
\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\\\
প্রস্তুতকারকের স্বাক্ষর
\\end{minipage}
\\hfill
\\begin{minipage}{0.4\\textwidth}
\\centering
\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\\\
অনুমোদনকারীর স্বাক্ষর
\\end{minipage}
\\end{center}

\\end{document}
`;
};

// Invoice template for sales
const generateInvoiceLatex = (sale: any, businessInfo: any) => {
  return `
\\documentclass[a4paper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[bangla]{babel}
\\\usepackage{fontspec}
\\\usepackage{geometry}
\\\usepackage{xcolor}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{fancyhdr}
\\\usepackage{tikz}
\\\usepackage{tcolorbox}

% Page setup
\\geometry{
  a4paper,
  left=2cm,
  right=2cm,
  top=3cm,
  bottom=2cm
}

% Font setup
\\setmainfont{Noto Sans Bengali}

% Colors
\\definecolor{primaryblue}{RGB}{37, 99, 235}
\\definecolor{successgreen}{RGB}{34, 197, 94}
\\definecolor{lightgray}{RGB}{248, 250, 252}

\\begin{document}

% Header
\\begin{tikzpicture}[remember picture, overlay]
  \\fill[primaryblue] (0,0) rectangle (\\paperwidth,2.5cm);
\\end{tikzpicture}

\\vspace{0.5cm}
\\begin{center}
  \\textcolor{white}{\\Huge\\textbf{চালান}}\\\\[0.2cm]
  \\textcolor{white}{\\Large ${businessInfo.businessName}}\\\\
  \\textcolor{white}{\\normalsize মালিক: ${businessInfo.ownerName}}
\\end{center}

\\vspace{1.5cm}

% Invoice details
\\begin{minipage}{0.5\\textwidth}
\\textbf{চালান নম্বর:} \\#${sale.id?.slice(-8).toUpperCase()}\\\\
\\textbf{তারিখ:} ${new Date(sale.sale_date).toLocaleDateString('bn-BD')}\\\\
\\textbf{সময়:} ${new Date(sale.sale_date).toLocaleTimeString('bn-BD')}
\\end{minipage}
\\hfill
\\begin{minipage}{0.45\\textwidth}
\\textbf{গ্রাহকের তথ্য:}\\\\
নাম: ${sale.customer_name}\\\\
${sale.customer_phone ? `ফোন: ${sale.customer_phone}\\\\` : ''}
${sale.customer_address ? `ঠিকানা: ${sale.customer_address}` : ''}
\\end{minipage}

\\vspace{1cm}

% Items table
\\section{পণ্যের বিবরণ}

\\begin{table}[h]
\\centering
\\begin{tabular}{|p{4cm}|c|c|c|}
\\hline
\\rowcolor{lightgray}
\\textbf{পণ্যের নাম} & \\textbf{পরিমাণ} & \\textbf{একক মূল্য} & \\textbf{মোট মূল্য} \\\\
\\hline
${sale.items?.map((item: any) => `
${item.productName} & 
${toBengaliNumber(item.quantity)} & 
${formatCurrency(parseFloat(item.unitPrice))} টাকা & 
${formatCurrency(item.totalPrice)} টাকা \\\\
\\hline`).join('') || 'কোন পণ্য নেই & - & - & - \\\\\\hline'}
\\end{tabular}
\\end{table}

\\vspace{1cm}

% Payment summary
\\begin{tcolorbox}[
  colback=lightgray,
  colframe=primaryblue,
  width=\\textwidth,
  arc=5pt
]
\\centering
\\Large\\textbf{পেমেন্ট সারসংক্ষেপ}\\\\[0.5cm]

\\begin{tabular}{|p{6cm}|p{4cm}|}
\\hline
\\textbf{মোট পরিমাণ} & \\Large ${formatCurrency(sale.total_amount)} টাকা \\\\
\\hline
\\textbf{পরিশোধিত পরিমাণ} & \\Large\\textcolor{successgreen}{${formatCurrency(sale.paid_amount || 0)} টাকা} \\\\
\\hline
\\textbf{বকেয়া পরিমাণ} & \\Large\\textcolor{red}{${formatCurrency(sale.due_amount || 0)} টাকা} \\\\
\\hline
\\textbf{পেমেন্ট পদ্ধতি} & ${sale.payment_method || 'নগদ'} \\\\
\\hline
\\end{tabular}
\\end{tcolorbox}

\\vspace{2cm}

% Footer
\\begin{center}
\\rule{\\textwidth}{0.5pt}\\\\[0.5cm]
\\textbf{ধন্যবাদ আপনার ব্যবসার জন্য!}\\\\[0.5cm]
\\small যোগাযোগ: ${businessInfo.ownerName} | ${businessInfo.businessName}\\\\
\\tiny এই চালানটি ${new Date().toLocaleString('bn-BD')} সময়ে তৈরি করা হয়েছে
\\end{center}

\\end{document}
`;
};

// Customer statement template
const generateCustomerStatementLatex = (customer: any, transactions: any[], businessInfo: any) => {
  const totalDue = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.due_amount || 0), 0);
  
  const totalPaid = transactions
    .filter(t => t.type === 'collection')
    .reduce((sum, t) => sum + t.amount, 0);

  return `
\\documentclass[a4paper,11pt]{article}
\\\usepackage[utf8]{inputenc}
\\usepackage[bangla]{babel}
\\\usepackage{fontspec}
\\usepackage{geometry}
\\\usepackage{xcolor}
\\usepackage{array}
\\usepackage{booktabs}
\\\usepackage{longtable}
\\usepackage{fancyhdr}
\\usepackage{tikz}
\\usepackage{tcolorbox}

% Page setup
\\geometry{
  a4paper,
  left=2cm,
  right=2cm,
  top=3cm,
  bottom=2cm
}

% Font setup
\\setmainfont{Noto Sans Bengali}

% Colors
\\definecolor{primaryblue}{RGB}{37, 99, 235}
\\definecolor{successgreen}{RGB}{34, 197, 94}
\\definecolor{dangerred}{RGB}{239, 68, 68}
\\definecolor{lightgray}{RGB}{248, 250, 252}

\\begin{document}

% Header
\\begin{tikzpicture}[remember picture, overlay]
  \\fill[primaryblue] (0,0) rectangle (\\paperwidth,2.5cm);
\\end{tikzpicture}

\\vspace{0.5cm}
\\begin{center}
  \\textcolor{white}{\\Huge\\textbf{গ্রাহক বিবৃতি}}\\\\[0.2cm]
  \\textcolor{white}{\\Large ${businessInfo.businessName}}\\\\
  \\textcolor{white}{\\normalsize প্রতিবেদনের তারিখ: ${getBengaliDate()}}
\\end{center}

\\vspace{1.5cm}

% Customer info
\\section{গ্রাহকের তথ্য}

\\begin{tcolorbox}[
  colback=lightgray,
  colframe=primaryblue,
  width=\\textwidth,
  arc=5pt
]
\\Large\\textbf{${customer.name}}\\\\[0.3cm]
\\normalsize
${customer.phone_number ? `ফোন: ${customer.phone_number}\\\\` : ''}
${customer.address ? `ঠিকানা: ${customer.address}\\\\` : ''}
গ্রাহক আইডি: ${customer.id?.slice(-8).toUpperCase()}
\\end{tcolorbox}

\\vspace{1cm}

% Account summary
\\section{হিসাব সারসংক্ষেপ}

\\begin{center}
\\begin{tabular}{|p{4cm}|p{4cm}|p{4cm}|}
\\hline
\\rowcolor{lightgray}
\\textbf{মোট কেনাকাটা} & \\textbf{মোট পরিশোধ} & \\textbf{বকেয়া পরিমাণ} \\\\
\\hline
${formatCurrency(transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.total_amount, 0))} টাকা & 
\\textcolor{successgreen}{${formatCurrency(totalPaid)} টাকা} & 
\\textcolor{dangerred}{${formatCurrency(totalDue)} টাকা} \\\\
\\hline
\\end{tabular}
\\end{center}

\\vspace{1cm}

% Transaction history
\\section{লেনদেন ইতিহাস}

\\small
\\begin{longtable}{|p{2cm}|p{2cm}|p{4cm}|p{2.5cm}|p{2cm}|}
\\hline
\\rowcolor{lightgray}
\\textbf{তারিখ} & \\textbf{ধরন} & \\textbf{বিবরণ} & \\textbf{পরিমাণ} & \\textbf{অবস্থা} \\\\
\\hline
\\endhead

${transactions.slice(0, 30).map(txn => `
${new Date(txn.date).toLocaleDateString('bn-BD')} & 
${txn.type === 'sale' ? 'বিক্রয়' : 'আদায়'} & 
${txn.description || 'N/A'} & 
${formatCurrency(txn.amount)} টাকা & 
${txn.type === 'sale' ? (txn.due_amount > 0 ? 'বকেয়া' : 'পরিশোধিত') : 'আদায়'} \\\\
\\hline`).join('')}

\\end{longtable}

\\vspace{2cm}

% Footer
\\begin{center}
\\rule{\\textwidth}{0.5pt}\\\\[0.5cm]
\\textbf{${businessInfo.businessName}}\\\\
\\textit{মালিক: ${businessInfo.ownerName}}\\\\[1cm]

\\small এই বিবৃতি ${new Date().toLocaleString('bn-BD')} সময়ে তৈরি করা হয়েছে
\\end{center}

\\end{document}
`;
};

export {
  generateTransactionReportLatex,
  generateInvoiceLatex,
  generateCustomerStatementLatex
};