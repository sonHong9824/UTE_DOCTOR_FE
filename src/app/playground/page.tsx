"use client";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../../components/ui/button";

export default function Playground() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Playground</h1>
      <div className="space-x-2">
        <Button variant="default">Default Button</Button>
        <Card className="p-4"></Card>
        <CardHeader className="text-lg font-semibold">Card Header</CardHeader>
        <CardTitle className="mt-2">Card Title</CardTitle>
        <CardAction className="mt-4">Card Action</CardAction>
      </div>
      <div className="space-x-2">
      </div>
    </div>
  );
}
