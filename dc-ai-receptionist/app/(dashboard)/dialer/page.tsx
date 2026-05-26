import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DialerForm } from "@/components/dashboard/DialerForm";

export default function DialerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-dc-navy">Dialer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Place outbound calls through the AI assistant.
        </p>
      </div>

      <Card className="border-border/60 shadow-lg shadow-dc-navy/5">
        <CardHeader>
          <CardTitle className="text-xl text-dc-navy">New Outbound Call</CardTitle>
          <CardDescription>
            Enter a phone number to initiate a call via the AI receptionist.
            The assistant will handle the conversation automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DialerForm />
        </CardContent>
      </Card>
    </div>
  );
}
