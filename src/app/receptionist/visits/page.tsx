import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReceptionistVisitsPage() {
  return (
    <Card className="border-emerald-200/70 dark:border-emerald-900/40">
      <CardHeader>
        <CardTitle className="text-2xl">Today Visits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Placeholder page for receptionist visit workflow. Integration with `/receptionist/visits` API will be added next.
        </p>
      </CardContent>
    </Card>
  );
}
