# Separate check-in from vital-sign recording

Check-in remains an operational arrival and queue-state transition that can succeed without clinical measurements. Receptionist vital signs are created through a separate endpoint as append-only records, allowing delayed, skipped, repeated, corrected, and voided measurements without coupling clinical history to the visit state machine.
