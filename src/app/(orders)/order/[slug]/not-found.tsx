import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">404</h1>
                <h2 className="text-2xl font-semibold">Order Not Found</h2>
                <p className="text-muted-foreground max-w-md">
                    The order you're looking for doesn't exist or has been removed.
                </p>
                <Link href="/">
                    <Button className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Button>
                </Link>
            </div>
        </div>
    );
}