"use client";

import { useToolOutput } from "../../hooks/use-tool-output";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timeDataOutputSchema } from "@/mcp/date-time-three";
import z from "zod";

type TimeOutput = z.infer<typeof timeDataOutputSchema>;

export default function TimeDataWidget() {
  const output = useToolOutput<TimeOutput>();

  if (output === null) {
    return (
      <div className="w-full p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = output.input.type === "time" ? "Current Time" : "Current Date";

  return (
    <div className="w-full p-6">
      <Card className="max-w-2xl mx-auto border border-green-500">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-semibold">
              {output.input.type === "time" ? output.time : output.date}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
