import dayjs from "dayjs";

import { toLocalDateInput } from "@/utils/time.util";

// Date helpers for appointment feature.
export const getTodayLocalDate = () => toLocalDateInput(dayjs().toDate());
