import RescheduleAppointmentScreen from "@/features/appointment/screens/RescheduleAppointmentScreen";

interface ReschedulePageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function RescheduleAppointmentPage({ params }: ReschedulePageProps) {
  const { appointmentId } = await params;
  return <RescheduleAppointmentScreen appointmentId={appointmentId} />;
}
