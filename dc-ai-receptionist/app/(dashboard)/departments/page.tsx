"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Building2,
  Clock,
  Globe,
  Hash,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Department } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-dc-blue/10 px-2 py-0.5 text-xs font-medium text-dc-blue">
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Add Department Dialog
// ---------------------------------------------------------------------------

function AddDepartmentDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phones, setPhones] = useState("");
  const [keywords, setKeywords] = useState("");
  const [hoursStart, setHoursStart] = useState("09:00");
  const [hoursEnd, setHoursEnd] = useState("18:00");

  const reset = () => {
    setName("");
    setPhones("");
    setKeywords("");
    setHoursStart("09:00");
    setHoursEnd("18:00");
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Department name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone_numbers: phones
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          routing_keywords: keywords
            .split(",")
            .map((k) => k.trim().toLowerCase())
            .filter(Boolean),
          hours_start: hoursStart || null,
          hours_end: hoursEnd || null,
          languages: ["urdu", "english"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create");
      toast.success(`Department "${data.name}" created`);
      reset();
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-dc-blue text-white hover:bg-dc-blue-dark">
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Department</DialogTitle>
          <DialogDescription>
            Add a department for the AI receptionist to route calls to.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="dept-name">Name *</Label>
            <Input
              id="dept-name"
              placeholder="e.g. Sales"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dept-phones">Phone Numbers (comma‑separated)</Label>
            <Input
              id="dept-phones"
              placeholder="+92-21-111-000-001, +92-21-111-000-002"
              value={phones}
              onChange={(e) => setPhones(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dept-keywords">
              Routing Keywords (comma‑separated)
            </Label>
            <Input
              id="dept-keywords"
              placeholder="sales, buy, price, quote"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="dept-start">Hours Start</Label>
              <Input
                id="dept-start"
                type="time"
                value={hoursStart}
                onChange={(e) => setHoursStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dept-end">Hours End</Label>
              <Input
                id="dept-end"
                type="time"
                value={hoursEnd}
                onChange={(e) => setHoursEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            disabled={saving}
            className="bg-dc-blue text-white hover:bg-dc-blue-dark"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Department Card
// ---------------------------------------------------------------------------

function DepartmentCard({
  dept,
  onDeleted,
}: {
  dept: Department;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${dept.name}"? Calls linked to this department will lose their reference.`))
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      toast.success(`"${dept.name}" deleted`);
      onDeleted();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/60 transition-shadow hover:shadow-md">
      {/* Active indicator */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          dept.is_active ? "bg-emerald-500" : "bg-rose-400"
        }`}
      />

      <CardHeader className="pb-3 pl-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-dc-blue" />
            <CardTitle className="text-lg text-dc-navy">{dept.name}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={`Delete ${dept.name}`}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          {dept.is_active ? "Active" : "Inactive"}
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-3 pt-4 pl-5 text-sm">
        {/* Hours */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            {dept.hours_start && dept.hours_end
              ? `${dept.hours_start} – ${dept.hours_end}`
              : "24 / 7"}
          </span>
        </div>

        {/* Languages */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe className="h-4 w-4 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {(dept.languages ?? []).map((l) => (
              <Badge key={l}>{l}</Badge>
            ))}
          </div>
        </div>

        {/* Keywords */}
        {dept.routing_keywords && dept.routing_keywords.length > 0 && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <Hash className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {dept.routing_keywords.map((k) => (
                <Badge key={k}>{k}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Phone numbers */}
        {dept.phone_numbers && dept.phone_numbers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            📞 {dept.phone_numbers.join(", ")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      if (res.ok) setDepartments(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-dc-navy">
            Departments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure departments, routing keywords, and business hours.
          </p>
        </div>
        <AddDepartmentDialog onCreated={fetchAll} />
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-dc-blue" />
        </div>
      ) : departments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-dc-navy">No departments yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first department to start routing calls.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <DepartmentCard key={d.id} dept={d} onDeleted={fetchAll} />
          ))}
        </div>
      )}
    </div>
  );
}
