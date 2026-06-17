import AdminAppointmentLifecycleDetailScreen from "@/features/admin-appointment-lifecycle/screens/AdminAppointmentLifecycleDetailScreen";

export default async function AdminAppointmentLifecyclePage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;

  return <AdminAppointmentLifecycleDetailScreen appointmentId={appointmentId} />;
}
