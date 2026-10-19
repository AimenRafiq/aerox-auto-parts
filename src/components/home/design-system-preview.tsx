"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Eye, ShieldCheck, Check, Info } from "lucide-react";

export const DesignSystemPreview: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testInput, setTestInput] = useState("");

  return (
    <section className="mt-12 rounded border border-brand-border bg-white p-6 shadow-sm">
      <div className="border-b border-brand-border/70 pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="accent">Phase 1 Verification</Badge>
          <span className="text-xs font-mono text-brand-muted">Design System &amp; UI Primitives</span>
        </div>
        <h2 className="mt-2 text-lg font-bold text-brand-ink">
          Interactive Design System Workbench
        </h2>
        <p className="text-xs text-brand-muted">
          All foundational primitives below follow the Aerox color tokens, typography scales, accessibility guidelines, and keyboard focus standards.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Buttons & Badges */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink">
            Buttons &amp; Badges
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Navy Secondary</Button>
            <Button variant="outline">Border Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" isLoading>Loading</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="default">In Stock</Badge>
            <Badge variant="accent">OEM Quality</Badge>
            <Badge variant="success">Verified Fit</Badge>
            <Badge variant="warning">Low Stock</Badge>
            <Badge variant="error">Discontinued</Badge>
            <Badge variant="outline">SKU #BRK-409</Badge>
          </div>
        </div>

        {/* Inputs & Form Controls */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink">
            Input Controls &amp; Validation
          </h3>
          <Input
            label="Part Specification Number"
            placeholder="e.g. OEM-48201-B"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            helperText="Matches manufacturer stamped part numbers."
          />
        </div>
      </div>

      {/* Alerts & Dialog Trigger */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Alert variant="info" title="Vehicle Application">
          Confirm the product part number against your VIN and the manufacturer&apos;s application catalog before ordering.
        </Alert>
        <Alert variant="success" title="Specification Confirmed">
          Replacement brake calipers match ISO 9001 and SAE J1401 pressure safety ratings.
        </Alert>
      </div>

      {/* Interactive Modal Verification */}
      <div className="mt-6 flex items-center justify-between rounded border border-brand-border bg-brand-bg/50 p-4">
        <div>
          <h4 className="text-xs font-semibold text-brand-ink">Accessible Dialog Component</h4>
          <p className="text-xs text-brand-muted">Tests focus trapping, Escape key listener, and backdrop click.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          leftIcon={<Eye className="h-4 w-4" />}
        >
          Open Test Modal
        </Button>
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Vehicle Application Checklist"
        description="Review the part number and vehicle details against manufacturer information."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(false)}>
              Acknowledge
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs leading-relaxed text-brand-ink">
          <p>
            When verifying auto parts, always inspect:
          </p>
          <ul className="list-disc space-y-1 pl-4 text-brand-muted">
            <li>Rotor outer diameter and vented vane thickness.</li>
            <li>Piston diameter and mounting bolt pitch spacing.</li>
            <li>Bleeder screw thread size and brake hose connection angle.</li>
          </ul>
        </div>
      </Dialog>
    </section>
  );
};
