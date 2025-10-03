// DashboardProgressBarCard.tsx
import { Badge } from "@/extra-components/Badge";
import { ProgressBar, ProgressBarProps } from "@/extra-components/ProgressBar"; // Import ProgressBarProps
import { Button } from "@/components/ui/button"; // Import Button component

import { KpiEntry } from "@/app/overview/page";

export type CardProps = {
  title: string;
  change: string;
  value: string;
  valueDescription: string;
  ctaDescription: string;
  ctaText: string; // Keep ctaText for the button label
  ctaLink: string; // Keep ctaLink if you still want to navigate somewhere
  data: KpiEntry[];
  triggerButton: React.ReactNode; // New prop for the modal trigger button
  variant?: ProgressBarProps['variant']; // New optional variant prop
};

export function ProgressBarCard({
                                  title,
                                  change,
                                  value,
                                  valueDescription,
                                  ctaDescription,
                                  ctaText, // Now used for the label of the trigger button
                                  ctaLink, // Still available for the link within the modal content
                                  data,
                                  triggerButton, // Destructure the new prop
                                  variant, // Destructure the new variant prop
                                }: CardProps) {
  return (
    <>
      {/* Removed direct clickability (tabIndex, role, cursor-pointer) from the main div
          as the modal will now be triggered by a specific button inside */}
      <div
        className="flex flex-col justify-between p-6 bg-white rounded-lg shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:shadow-xl"
      >
        <div>
          <div className="flex items-center gap-2">
            <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
              {title}
            </dt>
            <Badge variant="neutral">{change}</Badge>
          </div>
          <dd className="mt-2 flex items-baseline gap-2">
            <span className="text-xl text-gray-900 dark:text-gray-50">
              {value}
            </span>
            <span className="text-sm text-gray-500">{valueDescription}</span>
          </dd>
          <ul role="list" className="mt-4 space-y-5">
            {data.map((item) => (
              <li key={item.title}>
                <p className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-gray-50">
                    {item.title}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-50">
                    {item.current}
                    <span className="font-normal text-gray-500">
                      /{item.allowed}
                      {item.unit}
                    </span>
                  </span>
                </p>
                <ProgressBar
                  value={item.percentage}
                  className="mt-2 [&>*]:h-1.5"
                  variant={variant} // Pass the variant here
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          {/* Display the ctaDescription above the button */}
          <p className="mt-6 text-xs text-gray-500">
            {ctaDescription}
          </p>
          {/* Render the triggerButton prop here */}
          {triggerButton}
        </div>
      </div>
    </>
  );
}