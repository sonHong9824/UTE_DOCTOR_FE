import { Building2, Loader2, Mail, MapPin, Phone, UserRound } from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ReceptionistFormErrors,
  ReceptionistFormState,
} from "@/features/admin-receptionists/types/admin-receptionist.types";

interface ReceptionistCreateFormProps {
  form: ReceptionistFormState;
  errors: ReceptionistFormErrors;
  submitting: boolean;
  onFieldChange: (field: keyof ReceptionistFormState, value: string) => void;
  onSubmit: () => void;
}

interface FormFieldProps {
  id: keyof ReceptionistFormState;
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  icon?: ComponentType<{ className?: string }>;
  onChange: (value: string) => void;
}

const FormField = ({
  id,
  label,
  value,
  placeholder,
  type = "text",
  required,
  error,
  icon: Icon,
  onChange,
}: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {required ? <span className="text-red-500">*</span> : null}
    </Label>
    <div className="relative">
      {Icon ? (
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      ) : null}
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={Icon ? "pl-10" : undefined}
      />
    </div>
    {error ? <p className="text-sm text-red-600">{error}</p> : null}
  </div>
);

export const ReceptionistCreateForm = ({
  form,
  errors,
  submitting,
  onFieldChange,
  onSubmit,
}: ReceptionistCreateFormProps) => (
  <form
    className="space-y-6"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <div className="grid gap-5 md:grid-cols-2">
          <FormField
            id="fullName"
            label="Họ và tên"
            value={form.fullName}
            placeholder="Nguyễn Văn A"
            required
            error={errors.fullName}
            icon={UserRound}
            onChange={(value) => onFieldChange("fullName", value)}
          />
          <FormField
            id="email"
            label="Email"
            value={form.email}
            placeholder="letan@example.com"
            type="email"
            required
            error={errors.email}
            icon={Mail}
            onChange={(value) => onFieldChange("email", value)}
          />
          <FormField
            id="phone"
            label="Số điện thoại"
            value={form.phone}
            placeholder="0901234567"
            type="tel"
            icon={Phone}
            onChange={(value) => onFieldChange("phone", value)}
          />
          <FormField
            id="dateOfBirth"
            label="Ngày sinh"
            value={form.dateOfBirth}
            type="date"
            onChange={(value) => onFieldChange("dateOfBirth", value)}
          />
          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính</Label>
            <select
              id="gender"
              value={form.gender}
              onChange={(event) => onFieldChange("gender", event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <FormField
            id="hospitalName"
            label="Cơ sở làm việc"
            value={form.hospitalName}
            placeholder="UTE Clinic"
            icon={Building2}
            onChange={(value) => onFieldChange("hospitalName", value)}
          />
    </div>

    <FormField
      id="address"
      label="Địa chỉ"
      value={form.address}
      placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
      icon={MapPin}
      onChange={(value) => onFieldChange("address", value)}
    />

    <div className="flex justify-end border-t pt-5">
      <Button
        type="submit"
        disabled={submitting}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
      >
        {submitting ? <Loader2 className="animate-spin" /> : <UserRound />}
        {submitting ? "Đang tạo..." : "Tạo tài khoản lễ tân"}
      </Button>
    </div>
  </form>
);
