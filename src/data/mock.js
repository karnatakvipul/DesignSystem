
export function makeInitialLicenses() {
  const base = [
    { id: 1, account: "Aaxis Nano", name: "Reflashing Issue", status: "Active", type: "EF-10-NM-2P-PC1-PCB", term: "Yearly", key: "d8100779e1e403dfa44be4efbd475179", issue: "05 Nov 24", actDate: "05 Nov 24", expiry: "04 Nov 25", site: "Gmr Airport Hyderabad: Aemb Domestic", lastPi: "-", lastInvoice: "12-12-120", amount: "₹1,000", payment: "Done" },
    { id: 2, account: "Imtb Engineers Pvt Ltd", name: "Gmr Airport Hyderabad: Aemb Domestic Tank Terminal Refurbishment Node", status: "Expired", type: "EF-10-NM-2P-PC1-PCB", term: "Yearly", key: "4ff70a04944fe2a8ad4c7b80a424424a085ee", issue: "16 May 23", actDate: "16 May 23", expiry: "15 May 24", site: "Gmr Airport Hyderabad: Aemb Public Terminal", lastPi: "-", lastInvoice: "-", amount: "₹1,000", payment: "-" },
    { id: 3, account: "Imtb Engineers Pvt Ltd", name: "Tank Terminal 6", status: "Active", type: "EF-10-XX-420-SD4-BLE2", term: "2-Year", key: "ab7b5a15ae2ba8e08d6d9c669ee6e0691512", issue: "12 Nov 26", actDate: "Invalid date", expiry: "11 Nov 27", site: "-", lastPi: "-", lastInvoice: "-", amount: "₹5,000", payment: "-" },
    { id: 4, account: "Abc Industries Pvt Ltd", name: "Manufacturing - Noida Plant 3 (EF-10-XX-420-SD4-BLE2)", status: "Expired", type: "EF-10-XX-420-SD4-BLE2", term: "2-Year", key: "b0080eb9a27d2c1f061e871e9a5c0b89b4f99", issue: "10 May 25", actDate: "10 May 25", expiry: "09 May 26", site: "Noida Plant 3", lastPi: "-", lastInvoice: "-", amount: "₹5,000", payment: "-" },
    { id: 5, account: "Abc Industries Pvt Ltd", name: "Manufacturing - Noida Plant 3 - 2", status: "Active", type: "EF-10-XX-420-SD4-BLE2", term: "Yearly", key: "4238e92f25ce96ee24f9f461a6b0c26694e9", issue: "14 May 26", actDate: "14 May 26", expiry: "13 May 27", site: "Noida Plant 3", lastPi: "-", lastInvoice: "-", amount: "₹1,000", payment: "-" },
    { id: 6, account: "Abc Industries Pvt Ltd", name: "Manufacturing - Noida Plant 3", status: "Active", type: "EF-10-NM-1P-PR-CAA", term: "Yearly", key: "a298070af9fa4ee3966e460a6ebb96f3a612", issue: "13 May 26", actDate: "13 May 26", expiry: "12 May 27", site: "Noida Plant 3", lastPi: "-", lastInvoice: "-", amount: "₹1,000", payment: "-" },
    { id: 7, account: "my Design System - Imtb Engineers Pvt Ltd", name: "Gmr Airport Hyderabad: Aemb Domestic Tank Terminal", status: "Active", type: "DC-11-XX-11F-PR-CAA", term: "Yearly", key: "da76757688ad4c7d9e4871d34e2c842fa4b0", issue: "12 Mar 26", actDate: "12 Mar 26", expiry: "11 Mar 27", site: "Gmr Airport Hyderabad: Aemb Domestic", lastPi: "-", lastInvoice: "-", amount: "₹1,000", payment: "-" },
    { id: 8, account: "my Design System - Imtb Engineers Pvt Ltd", name: "0.4 Mm Water Sampling System 1, Outlet, Ca...", status: "Active", type: "DC-11-NM-1F-PR-CAA", term: "Yearly", key: "a281ce5b5f8f2d4e8774880efe8484a0d9e8", issue: "12 Mar 26", actDate: "12 Mar 26", expiry: "11 Mar 27", site: "0.4 Mm Water Sampling System 1, Outlet...", lastPi: "-", lastInvoice: "-", amount: "₹1,000", payment: "-" },
    { id: 9, account: "my Design System - Imtb Engineers Pvt Ltd", name: "0.4 Mm Water Sampling System 1, Outlet, Ca...", status: "Active", type: "DC-11-NM-1F-PR-CAA", term: "Yearly", key: "88aee4fa1ca111e8a8bca08cfd09bb09", issue: "12 Mar 26", actDate: "12 Mar 26", expiry: "11 Mar 27", site: "0.4 Mm Water Sampling System 1, Outlet...", lastPi: "PI-2401-20 / 30-Apr-25", lastInvoice: "12-12-120", amount: "₹1,000", payment: "Done" },
  ];

  const generated = [];
  const accounts = ["Aaxis Nano", "Imtb Engineers Pvt Ltd", "Abc Industries Pvt Ltd", "my Design System - Imtb Engineers", "Deewan Enterprises", "Cybertech Solutions", "Apex Global", "Zenith Logistics", "OmniCorp Systems"];
  const statuses = ["Active", "Expired", "Deactivated"];
  const types = ["EF-10-NM-2P-PC1-PCB", "EF-10-XX-420-SD4-BLE2", "DC-11-XX-11F-PR-CAA", "DC-11-NM-1F-PR-CAA"];
  const terms = ["Yearly", "2-Year", "7 day(s)", "Monthly"];

  for (let i = 10; i <= 500; i++) {
    const acct = accounts[i % accounts.length];
    const stat = statuses[i % statuses.length];
    const typ = types[i % types.length];
    const trm = terms[i % terms.length];
    generated.push({
      id: i,
      account: `${acct} #${i}`,
      name: `License Terminal Node ${i}`,
      status: stat,
      type: typ,
      term: trm,
      key: `key-${i}-${Math.random().toString(36).substring(2, 9)}`,
      issue: `10 Nov 24`,
      actDate: `10 Nov 24`,
      expiry: `09 Nov 25`,
      site: `Site Location ${i % 20 + 1}`,
      lastPi: i % 4 === 0 ? `PI-2401-${i}` : "-",
      lastInvoice: i % 5 === 0 ? `INV-${i}` : "-",
      amount: i % 2 === 0 ? "₹1,000" : "₹5,000",
      payment: i % 3 === 0 ? "Done" : "-",
    });
  }

  return [...base, ...generated];
}


export function makeInitialUsers() {
  return [
    { id: 1, name: "Super Admin", email: "admin@my Design System.com", role: "Super Admin", status: "Active" },
    { id: 2, name: "Priya Sharma", email: "priya.sharma@my Design System.com", role: "Admin", status: "Active" },
    { id: 3, name: "Rohit Verma", email: "rohit.verma@my Design System.com", role: "Viewer", status: "Deactivated" },
  ];
}

export function makeInitialLicenseTypes() {
  return [
    { id: 1, name: "EF-1Y-5M-1Y-PR-PURL", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 2, name: "OC-1Y-5M-1Y-PR-PURL", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "OCEMS", productType: "Web Application" },
    { id: 3, name: "EF-1Y-5M-1Y-PR-ODAMS", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 4, name: "EF-1Y-5M-1Y-PR-OSPCB", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 5, name: "EF-1Y-5M-1Y-PR-NMCG", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 6, name: "EF-1Y-5M-1Y-PR-BSPCB", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 7, name: "EF-1Y-1M-1Y-PR-EARTHSEN...", description: "1 Year Renewal, 1 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 8, name: "EF-1Y-5M-XX-PR-API", description: "1 Year Renewal, 5 Minute Data Rate, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 9, name: "EF-1Y-5M-1Y-PR-HREX1", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 10, name: "EF-1Y-15M-1Y-PR-PDA", description: "1 Year Renewal, 15 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 11, name: "OC-1Y-1M-1Y-PR-XX", description: "1 Year Renewal, 1 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "OCEMS", productType: "Web Application" },
    { id: 12, name: "EF-3M-5M-3M-PR-XX", description: "3 Month Renewal, 5 Minute Data Rate, 3 Month Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 13, name: "OC-1Y-5M-1Y-PR-GSPCB", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "OCEMS", productType: "Web Application" },
    { id: 14, name: "SF-1Y-10M-1Y-PR-P350", description: "1 Year Renewal, 10 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "SolarFRONT", productType: "Web Application" },
    { id: 15, name: "SF-1Y-10M-1Y-PR-P300", description: "1 Year Renewal, 10 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "SolarFRONT", productType: "Web Application" },
    { id: 16, name: "SF-1Y-10M-1Y-PR-P250", description: "1 Year Renewal, 10 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "SolarFRONT", productType: "Web Application" },
    { id: 17, name: "SF-1Y-10M-1Y-PR-P200", description: "1 Year Renewal, 10 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "SolarFRONT", productType: "Web Application" },
    { id: 18, name: "SF-1Y-10M-1Y-PR-P150", description: "1 Year Renewal, 10 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "SolarFRONT", productType: "Web Application" },
    { id: 19, name: "SF-2M-5M-2M-PR-XX", description: "2 Month Renewal, 5 Minute Data Rate, 2 Month Data Retention, Prepaid", product: "SolarFRONT", productType: "Web Application" },
    { id: 20, name: "OC-1Y-5M-1Y-PR-CPCC", description: "1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid", product: "OCEMS", productType: "Web Application" },
    { id: 21, name: "EF-2Y-5M-2Y-PR-XX", description: "2 Year Renewal, 5 Minute Data Rate, 2 Year Data Retention, Prepaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 22, name: "SF-7D-XX-XX-TEST", description: "Testing License", product: "SolarFRONT", productType: "Web Application" },
    { id: 23, name: "EF-3M-1M-3M-PO-XX", description: "3 Month Renewal, 1 Minute Data Rate, 3 Month Data Retention, Postpaid", product: "EnviroFRONT", productType: "Web Application" },
    { id: 24, name: "OC-1Y-5M-1Y-PR-RSPCB", description: "1 Year Renewal, 5 Min Data Rate, 1 Year Data Retention, Prepaid", product: "OCEMS", productType: "Web Application" },
    { id: 25, name: "OC-1Y-5M-1Y-PR-HWRA", description: "1 Year Renewal, 5 Min Plus Data Record, 1 Year Data Retention, Prepaid", product: "OCEMS", productType: "Web Application" },
  ];
}

export function makeInitialLicenseTerms() {
  return [
    { id: 1, name: "Yearly" },
    { id: 2, name: "7 day(s)" },
    { id: 3, name: "Monthly" },
  ];
}

export function makeInitialProductTypes() {
  return [
    { id: 1, name: "SLS Pro", status: "Active" },
    { id: 2, name: "SLS Lite", status: "Active" },
    { id: 3, name: "EnviroFRONT", status: "Deactivated" },
  ];
}

export function makeInitialReports() {
  return [
    { id: 1, product: "SLS Pro", account: "Aaxis Nano", invoice: "PIC260010", payment: "Paid", date: "23-Feb-26", amount: 60475 },
    { id: 2, product: "SLS Lite", account: "Abc Industries Pvt Ltd", invoice: "-", payment: "Pending", date: "13-May-26", amount: 0 },
  ];
}

export function makeInitialTimeline() {
  return [
    {
      id: "1",
      date: "03-JUL-26",
      time: "14:16",
      title: "Activate License",
      before: "Deactivate (0000000000)",
      after: "Activate",
      changes: [
        { label: "Status", before: "Deactivate (0000000000)", after: "Activate" }
      ]
    },
    {
      id: "2",
      date: "03-JUL-26",
      time: "14:15",
      title: "Deactivate License",
      before: "Activate",
      after: "Deactivate (0000000000)",
      changes: [
        { label: "Status", before: "Activate", after: "Deactivate (0000000000)" }
      ]
    },
    {
      id: "3",
      date: "03-JUL-26",
      time: "11:20",
      title: "Change Account",
      before: "Aaxis Nano",
      after: "Imtb Engineers Pvt Ltd",
      changes: [
        { label: "Account", before: "Aaxis Nano", after: "Imtb Engineers Pvt Ltd" }
      ]
    },
    {
      id: "4",
      date: "13-JAN-26",
      time: "15:38",
      title: "Change Site",
      before: "Unassigned Site",
      after: "Arunachal Logger: Arunachal Pradesh",
      changes: [
        { label: "Site", before: "Unassigned Site", after: "Arunachal Logger: Arunachal Pradesh" }
      ]
    }
  ];
}

export function makeUpcomingRenewalData() {
  return [
    { label: "Apr", value: 12 },
    { label: "May", value: 18 },
    { label: "Jun", value: 9 },
    { label: "Jul", value: 24 },
    { label: "Aug", value: 15 },
  ];
}

export function makeLicenseTrendData() {
  return [
    { label: "Feb", total: 1520, accountWise: 340 },
    { label: "Mar", total: 1580, accountWise: 360 },
    { label: "Apr", total: 1610, accountWise: 400 },
    { label: "May", total: 1639, accountWise: 415 },
  ];
}

export const demoColumns = [
  { key: "id", header: "ID", sortable: true },
  { key: "account", header: "ACCOUNT", sortable: true },
  { key: "name", header: "NAME", sortable: true },
  { key: "status", header: "STATUS" },
  { key: "type", header: "TYPE" },
  { key: "expiry", header: "EXPIRY" },
];

export const demoData = [
  { id: 1, account: "Aaxis Nano", name: "Reflashing Issue", status: "Active", type: "Yearly", expiry: "02-Nov-26" },
  { id: 2, account: "Imtb Engineers", name: "Gmr Airport Kit", status: "Expired", type: "Yearly", expiry: "30-Apr-26" },
  { id: 3, account: "Abc Industries", name: "Manufacturing Noida", status: "Active", type: "7 day(s)", expiry: "12-May-27" },
  { id: 4, account: "my Design System", name: "Test Interlocking", status: "Deactivated", type: "Yearly", expiry: "05-Mar-27" },
];

export const demoDataTableProps = {
  columns: demoColumns,
  data: demoData,
  rowKey: (r) => r.id,
  selectable: true,
};

export const demoPaginationProps = {
  page: 1,
  pageSize: 10,
  total: 50,
  onPageChange: () => {},
};

export const demoDropdownProps = {
  label: "Select Option",
  options: [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ],
  placeholder: "Choose...",
};

export const demoSidebarProps = {
  logo: "SLS UI",
  items: [
    { key: "license", label: "License" },
    { key: "users", label: "Users" },
    { key: "reports", label: "Reports" },
  ],
};

export function makeMaterialsData() {
  return [
    { id: 1, customer: "Aaxis Nano", material: "Reflashing Issue", qty: 4 },
    { id: 2, customer: "Imtb Engineers Pvt Ltd", material: "Gmr Airport Hyderabad Tan Kit", qty: 2 },
    { id: 3, customer: "Abc Industries Pvt Ltd", material: "Manufacturing Sensor Pack", qty: 7 },
  ];
}
