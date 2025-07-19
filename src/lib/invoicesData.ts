
export type InvoiceItem = {
  description: string;
  amount: number;
};

export type Invoice = {
  id: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: "Pending" | "Paid" | "Overdue";
};

let invoices: Invoice[] = [
  {
    id: "UVRLPINV001",
    merchantId: "merch_123",
    merchantName: "MyStore.com",
    customerName: "Liam Johnson",
    customerEmail: "liam@example.com",
    issueDate: "2023-10-25",
    dueDate: "2023-11-24",
    items: [{ description: "Pro Subscription", amount: 250.00 }],
    totalAmount: 250.00,
    status: "Paid",
  },
  {
    id: "UVRLPINV002",
    merchantId: "merch_123",
    merchantName: "MyStore.com",
    customerName: "Olivia Smith",
    customerEmail: "olivia@example.com",
    issueDate: "2023-10-24",
    dueDate: "2023-11-23",
    items: [{ description: "Web Design Service", amount: 150.00 }],
    totalAmount: 150.00,
    status: "Pending",
  },
  {
    id: "UVRLPINV003",
    merchantId: "merch_123",
    merchantName: "MyStore.com",
    customerName: "Noah Williams",
    customerEmail: "noah@example.com",
    issueDate: "2023-10-23",
    dueDate: "2023-11-22",
    items: [{ description: "Premium Hosting", amount: 350.00 }],
    totalAmount: 350.00,
    status: "Paid",
  },
  {
    id: "UVRLPINV004",
    merchantId: "merch_123",
    merchantName: "MyStore.com",
    customerName: "Emma Brown",
    customerEmail: "emma@example.com",
    issueDate: "2023-10-22",
    dueDate: "2023-10-29", // This one is overdue
    items: [{ description: "SEO Consultation", amount: 450.00 }],
    totalAmount: 450.00,
    status: "Overdue",
  },
  {
    id: "UVRLPINV005",
    merchantId: "merch_789",
    merchantName: "AnotherShop",
    customerName: "James White",
    customerEmail: "james@example.com",
    issueDate: "2023-10-28",
    dueDate: "2023-11-27",
    items: [{ description: "Graphic Design Pack", amount: 500.00 }],
    totalAmount: 500.00,
    status: "Pending",
  },
];

// Helper to check for overdue invoices
const checkOverdueInvoices = () => {
    const today = new Date();
    invoices.forEach(invoice => {
        if (invoice.status === 'Pending' && new Date(invoice.dueDate) < today) {
            invoice.status = 'Overdue';
        }
    });
};

export const getInvoices = (): Invoice[] => {
  checkOverdueInvoices();
  return [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};

export const getInvoiceById = (id: string): Invoice | undefined => {
  checkOverdueInvoices();
  return invoices.find(invoice => invoice.id === id);
};

export const addInvoice = (newInvoiceData: Omit<Invoice, 'id' | 'totalAmount'>): void => {
  const totalAmount = newInvoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  const newInvoice: Invoice = {
    ...newInvoiceData,
    id: `UVRLPINV${String(invoices.length + 1).padStart(3, '0')}`,
    totalAmount,
  };
  invoices.unshift(newInvoice); // Add to the beginning of the array
};

export const updateInvoiceStatus = (id: string, status: "Paid" | "Pending" | "Overdue"): void => {
  const index = invoices.findIndex(invoice => invoice.id === id);
  if (index !== -1) {
    invoices[index].status = status;
  }
};
