"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PrintReceiptButton: React.FC = () => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      leftIcon={<Printer className="h-4 w-4" />}
    >
      Print Receipt
    </Button>
  );
};

