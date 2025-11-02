"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export function DatePicker({
  value,
  onChange,
  className = "",
  limitDays,
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
  limitDays?: number; // nếu undefined → không giới hạn ngày
}) {
  const [open, setOpen] = React.useState(false);

  const today = new Date();
  const maxDate = limitDays
    ? new Date(today.getTime() + limitDays * 24 * 60 * 60 * 1000)
    : undefined;

  // ✅ Tạo rule disable động — chỉ áp dụng khi limitDays tồn tại
  const disabledRule = limitDays
    ? { before: today, after: maxDate }
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${
            !value ? "text-muted-foreground" : ""
          } ${className}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            // ✅ Nếu có giới hạn ngày → kiểm tra hợp lệ trước khi chọn
            if (limitDays && date) {
              if (date < today || (maxDate && date > maxDate)) {
                alert("Ngày không hợp lệ!");
                return;
              }
            }

            onChange(date);
            setOpen(false);
          }}
          disabled={disabledRule}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
