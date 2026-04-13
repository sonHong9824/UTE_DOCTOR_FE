"use client";

import { medicalRecordService } from "@/features/medical-record/services/medical-record.service";
import { MedicalRecordDetailPdfContext, MedicalRecordPdfState } from "@/features/medical-record/types/medical-record.types";
import { buildPdfUrlFromPath, buildPrescriptionPdfDto, resolvePdfRequestId, resolvePdfUrlFromResponse } from "@/features/medical-record/utils/medical-record.utils";
import { useEffect, useState } from "react";

export const useMedicalRecordDetailPdf = ({ selectedRecord, user, medicalRecord }: MedicalRecordDetailPdfContext): MedicalRecordPdfState => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!selectedRecord || typeof window === "undefined") return;
      if (localStorage.getItem("role") !== "PATIENT") {
        return;
      }

      setPdfLoading(true);
      setPdfError(null);
      setPdfUrl(null);

      try {
        const dto = buildPrescriptionPdfDto({
          selectedRecord,
          patientName:
            user?.accountProfileDto?.name ||
            selectedRecord?.patient?.name ||
            medicalRecord?.patient?.name ||
            medicalRecord?.patientName,
          patientAge: (() => {
            const candidate =
              user?.accountProfileDto?.age ??
              user?.patientAge ??
              selectedRecord?.patient?.age ??
              medicalRecord?.patient?.age ??
              medicalRecord?.patientAge;
            const num = Number(candidate);
            return Number.isNaN(num) ? undefined : num;
          })(),
          doctorName: localStorage.getItem("name") || undefined,
        });

        const requestId = resolvePdfRequestId(selectedRecord);
        if (!requestId) {
          setPdfError(new Error("Không tìm thấy ID lượt khám để xuất PDF"));
          return;
        }

        const res = await medicalRecordService.generatePrescriptionPdf(requestId, dto);
        if (!mounted) return;

        const url = resolvePdfUrlFromResponse(res);
        if (!url) {
          const pdfPath = (res as any)?.data?.pdfPath || (res as any)?.pdfPath;
          setPdfUrl(pdfPath ? buildPdfUrlFromPath(pdfPath) : null);
          return;
        }

        setPdfUrl(url);
      } catch (error) {
        setPdfError(error);
      } finally {
        if (mounted) {
          setPdfLoading(false);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [medicalRecord, selectedRecord, user]);

  return {
    pdfUrl,
    pdfLoading,
    pdfError,
  };
};
