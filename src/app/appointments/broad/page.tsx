import AppointmentBookingScreen from "@/features/appointment/screens/AppointmentBookingScreen";

// Deep link that opens the unified booking screen defaulting to broad (no doctor/slot) mode.
export default function BroadAppointmentBookingPage() {
  return <AppointmentBookingScreen initialStrategy="BROAD" />;
}
