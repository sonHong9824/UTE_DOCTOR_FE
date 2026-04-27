import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReceptionistPaymentsPage() {
  return (
    <Card className="border-emerald-200/70 dark:border-emerald-900/40">
      <CardHeader>
        <CardTitle className="text-2xl">Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Placeholder page for receptionist payment workflow. Integration with `/receptionist/payment/mock` API will be added next.
        </p>
      </CardContent>
    </Card>
  );
}
