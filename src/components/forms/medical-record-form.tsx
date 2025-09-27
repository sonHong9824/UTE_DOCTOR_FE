import { MedicalRecordDescriptionDto, MedicalRecordDto } from "@/types/userDTO/medical-record.dto";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "../ui/textarea";



export default function MedicalRecordForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordDto>({
    medicalHistory: [],
    drugAllergies: [],
    foodAllergies: [],
  });

  const handleAddRecord = (type: keyof MedicalRecordDto) => {
    setMedicalRecord({
      ...medicalRecord,
      [type]: [
        ...medicalRecord[type],
        { name: "", description: "", dateRecord: "" },
      ],
    });
  };

    const handleRemoveRecord = (section: keyof MedicalRecordDto, index: number) => {
        setMedicalRecord((prev) => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index),
        }));
    };

  const handleChangeRecord = (
    type: keyof MedicalRecordDto,
    index: number,
    field: keyof MedicalRecordDescriptionDto,
    value: string
  ) => {
    const updated = [...medicalRecord[type]];
    updated[index] = { ...updated[index], [field]: value };
    setMedicalRecord({ ...medicalRecord, [type]: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fullName,
      email,
      password,
      medicalRecord,
    };
    console.log("Form submitted:", payload);
  };

   return (
  <div className="space-y-6">
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="medical-record">
        <AccordionTrigger>
          <h3 className="text-lg font-semibold">Thông tin y tế</h3>
        </AccordionTrigger>
        <AccordionContent>
          <Accordion type="multiple" className="w-full mt-3">
            {(["medicalHistory", "drugAllergies", "foodAllergies"] as const).map(
              (section) => (
                <AccordionItem key={section} value={section}>
                  <AccordionTrigger>
                    {section === "medicalHistory"
                      ? "Tiền sử bệnh"
                      : section === "drugAllergies"
                      ? "Dị ứng thuốc"
                      : "Dị ứng thức ăn"}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 mt-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAddRecord(section)}
                        >
                          + Thêm
                        </Button>
                      </div>

                      {medicalRecord[section].map((record, index) => (
                        <div
                          key={index}
                          className="flex flex-col space-y-4 p-4 rounded-lg"
                        >
                          <div className="flex flex-col space-y-1">
                            <Label htmlFor={`${section}-name-${index}`}>Tên</Label>
                            <Input
                              id={`${section}-name-${index}`}
                              placeholder="Tên bệnh / dị ứng"
                              value={record.name}
                              onChange={(e) =>
                                handleChangeRecord(section, index, "name", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex flex-col space-y-1">
                            <Label htmlFor={`${section}-desc-${index}`}>Mô tả</Label>
                            <Textarea
                              id={`${section}-desc-${index}`}
                              placeholder="Mô tả chi tiết"
                              value={record.description}
                              onChange={(e) =>
                                handleChangeRecord(section, index, "description", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex flex-col space-y-1">
                            <Label htmlFor={`${section}-date-${index}`}>
                              Ngày ghi nhận
                            </Label>
                            <Input
                              id={`${section}-date-${index}`}
                              type="date"
                              value={
                                record.dateRecord
                                  ? new Date(record.dateRecord).toISOString().split("T")[0]
                                  : ""
                              }
                              onChange={(e) =>
                                handleChangeRecord(section, index, "dateRecord", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveRecord(section, index)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

}
