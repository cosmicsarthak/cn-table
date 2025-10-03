// components/KpiDetailModal.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Order } from "@/app/overview/page"; // Import the Order interface
import Link from "next/link"; // Import Link from Next.js

export type KpiModalProps = {
  itemName: string;
  onSelect: () => void;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  orders: Order[]; // Pass the filtered orders
  ctaLink: string; // Pass the CTA link for the "Full List" button
};

export function KpiDetailModal({
                                 itemName,
                                 onSelect,
                                 onOpenChange,
                                 title,
                                 description,
                                 orders,
                                 ctaLink,
                               }: KpiModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger className="w-full text-left">
        {itemName}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6">
            {description}
          </DialogDescription>
          <div className="mt-4 max-h-60 overflow-y-auto">
            {orders.length > 0 ? (
              <ul className="list-disc pl-5">
                {orders.map((order) => (
                  <li key={order.sn} className="text-sm text-gray-700 dark:text-gray-300">
                    SN: {order.sn}, Part Number: {order.partNumber}, Status: {order.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No orders found for this KPI.</p>
            )}
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button
              className="mt-2 w-full sm:mt-0 sm:w-fit"
              variant="secondary"
            >
              Go back
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Link href={ctaLink}>
              <Button type="button" className="w-full sm:w-fit">
                View Full List
              </Button>
            </Link>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}