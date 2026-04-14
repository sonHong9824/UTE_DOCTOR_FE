import RescheduleAppointmentScreen from "@/features/appointment/screens/RescheduleAppointmentScreen";

interface ReschedulePageProps {
  params: { appointmentId: string };
}

export default function RescheduleAppointmentPage({ params }: ReschedulePageProps) {
  const { appointmentId } = params;

  return <RescheduleAppointmentScreen appointmentId={appointmentId} />;
}
