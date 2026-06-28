"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { adminReceptionistService } from "@/features/admin-receptionists/services/admin-receptionist.service";
import type {
  CreatedReceptionist,
  ReceptionistFormErrors,
  ReceptionistFormState,
  ReceptionistListItem,
} from "@/features/admin-receptionists/types/admin-receptionist.types";
import {
  buildReceptionistPayload,
  createInitialReceptionistForm,
  getCreateReceptionistErrorMessage,
  getReceptionistListErrorMessage,
  validateReceptionistForm,
} from "@/features/admin-receptionists/utils/admin-receptionist.utils";

export const useAdminReceptionistCreation = () => {
  const [form, setForm] = useState<ReceptionistFormState>(
    createInitialReceptionistForm
  );
  const [errors, setErrors] = useState<ReceptionistFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdReceptionist, setCreatedReceptionist] =
    useState<CreatedReceptionist | null>(null);
  const [receptionists, setReceptionists] = useState<ReceptionistListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const listRequestId = useRef(0);

  const loadReceptionists = useCallback(
    async (targetPage = page, targetSearch = search) => {
      const requestId = ++listRequestId.current;
      setLoadingList(true);
      setListError("");
      try {
        const response = await adminReceptionistService.list({
          page: targetPage,
          limit: pagination.limit,
          search: targetSearch,
        });
        if (response.code?.toUpperCase() !== "SUCCESS" || !response.data) {
          throw new Error(response.message || "Không thể tải danh sách lễ tân.");
        }
        if (requestId !== listRequestId.current) return;
        setReceptionists(response.data.receptionists);
        setPagination(response.data.pagination);
      } catch (error) {
        if (requestId !== listRequestId.current) return;
        setReceptionists([]);
        setListError(getReceptionistListErrorMessage(error));
      } finally {
        if (requestId === listRequestId.current) {
          setLoadingList(false);
        }
      }
    },
    [page, pagination.limit, search]
  );

  useEffect(() => {
    void loadReceptionists();
  }, [loadReceptionists]);

  const updateField = (field: keyof ReceptionistFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setCreatedReceptionist(null);
  };

  const submit = async () => {
    const validationErrors = validateReceptionistForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await adminReceptionistService.create(
        buildReceptionistPayload(form)
      );
      if (response.code?.toUpperCase() !== "SUCCESS" || !response.data) {
        throw new Error(response.message || "Không thể tạo tài khoản lễ tân.");
      }
      const created = response.data;

      setCreatedReceptionist(created);
      setForm(createInitialReceptionistForm());
      setErrors({});
      setSearch("");
      setPage(1);
      await loadReceptionists(1, "");

      if (created.emailSent) {
        toast.success(
          "Tạo tài khoản lễ tân thành công. Thông tin đăng nhập tạm thời đã được gửi qua email."
        );
      } else {
        toast.success("Tạo tài khoản lễ tân thành công.");
        toast.warning(
          "Tài khoản đã được tạo nhưng email thông tin đăng nhập chưa gửi được."
        );
      }
      return true;
    } catch (error) {
      toast.error(getCreateReceptionistErrorMessage(error));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    errors,
    submitting,
    createdReceptionist,
    receptionists,
    loadingList,
    listError,
    search,
    page,
    pagination,
    updateField,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    setPage,
    retryList: loadReceptionists,
    submit,
  };
};
