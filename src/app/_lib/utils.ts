import {
  CheckCircle2,
  Circle,
  CircleDashed,
  Clock,
  HelpCircle,
  Timer,
  XCircle,
  AlertCircle,
  Package,
  Plane,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { Order } from "@/db/schema";

export function getStatusIcon(status: Order["status"]): LucideIcon {
  const statusIconMap: Record<string, LucideIcon> = {
    "Order yet to be processed": CircleDashed,
    "Order processed": CheckCircle2,
    "Cancelled": XCircle,
    "Payment pending to Supplier": Clock,
    "Supplier Paid": CheckCircle2,
    "Long LT - Awaiting ESD": Timer,
    "Long LT - ESD Provided": CheckCircle2,
    "Awaiting Collection Details": HelpCircle,
    "Ready for Collection from Supplier": Package,
    "Awaiting AWB from FF": Clock,
    "AWB Shared to Supplier": CheckCircle2,
    "Transit to UAE": Plane,
    "Need to Collect": Package,
    "Received in UAE": CheckCircle2,
    "Hold": AlertCircle,
    "Issue": XCircle,
    "Ready for Dispatch": Truck,
    "Delivered": CheckCircle2,
  };

  return statusIconMap[status] || Circle;
}

export function getStatusVariant(
    status: Order["status"]
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "neutral" {
  const statusVariantMap: Record<
      string,
      "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "neutral"
  > = {
    "Order yet to be processed": "neutral",
    "Order processed": "success",
    "Cancelled": "destructive",
    "Payment pending to Supplier": "warning",
    "Supplier Paid": "success",
    "Long LT - Awaiting ESD": "neutral",
    "Long LT - ESD Provided": "neutral",
    "Awaiting Collection Details": "neutral",
    "Ready for Collection from Supplier": "neutral",
    "Awaiting AWB from FF": "neutral",
    "AWB Shared to Supplier": "neutral",
    "Transit to UAE": "neutral",
    "Need to Collect": "neutral",
    "Received in UAE": "success",
    "Hold": "warning",
    "Issue": "destructive",
    "Ready for Dispatch": "success",
    "Delivered": "success",
  };

  return statusVariantMap[status] || "outline";
}

export function generateRandomOrder(sn: number): Order {
  const partNumbers = [
    "C20207000",
    "P199753",
    "A45892",
    "B78321",
    "D12456",
    "E98765",
    "F34567",
    "G87654",
  ];

  const descriptions = [
    "HUBCAP",
    "FILTER",
    "BEARING",
    "GASKET",
    "VALVE",
    "CONNECTOR",
    "SEAL",
    "BRACKET",
  ];

  const customers = ["TTK", "AAL", "EK", "QR", "SV"];
  const suppliers = [
    "GMF AeroAsia Tbk",
    "Air Industries France, Inc",
    "Honeywell Aerospace",
    "Collins Aerospace",
    "Parker Hannifin",
  ];

  const statuses = [
    "Order yet to be processed",
    "Order processed",
    "Supplier Paid",
    "Transit to UAE",
    "Received in UAE",
    "Ready for Dispatch",
    "Delivered",
  ];

  const terms = ["PREPAY", "NET 7", "NET 30"];
  const currencies = ["USD", "EUR", "AED"];
  const yesNo = ["Yes", "No"];

  const randomElement = <T,>(arr: T[]): T => {
    if (arr.length === 0) {
      throw new Error("Cannot select a random element from an empty array.");
    }
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const randomDate = () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2025, 11, 31);
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    ).toLocaleDateString("en-US");
  };

  const poValue = Math.floor(Math.random() * 10000) + 100;
  const costs = Math.floor(poValue * (0.6 + Math.random() * 0.3));
  const grossProfit = poValue - costs;
  const profitPercent = (grossProfit / poValue) * 100;

  return {
    sn,
    partNumber: randomElement(partNumbers),
    description: randomElement(descriptions),
    qty: Math.floor(Math.random() * 20) + 1,
    poDate: randomDate(),
    term: randomElement(terms),
    customer: randomElement(customers),
    custPo: `PO ${9000 + sn}`,
    status: randomElement(statuses),
    remarks: Math.random() > 0.7 ? "Urgent delivery required" : "",
    currency: randomElement(currencies),
    poValue,
    costs,
    customsDutyB: Math.random() > 0.5 ? Math.floor(costs * 0.05) : null,
    freightCostC: Math.random() > 0.5 ? Math.floor(Math.random() * 500) : null,
    grossProfit,
    profitPercent,
    netProfit: grossProfit - (Math.random() > 0.5 ? Math.floor(costs * 0.05) : 0),
    profitPercentAfterCost: profitPercent - (Math.random() * 5),
    paymentReceived: randomElement(yesNo),
    investorPaid: randomElement(yesNo),
    targetDate: randomDate(),
    dispatchDate: Math.random() > 0.5 ? randomDate() : "",
    supplierPoDate: randomDate(),
    supplier: randomElement(suppliers),
    supplierPo: `PO24${String(sn).padStart(4, "0")}`,
    awbToUae: Math.random() > 0.3 ? String(Math.floor(Math.random() * 9000000000) + 1000000000) : "",
    haInvDate: "",
    haInv: "",
    anPoDate: "",
    anPo: "",
    anInvDate: "",
    anInv: "",
    audited: "",
    stability: Math.floor(Math.random() * 10) + 1,
    lastEdited: new Date().toLocaleString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}