# Frontend notification rendering from epoch data

The notification contract sends structured notification payloads with epoch
millisecond date fields. The frontend renders user-facing notification text from
that structured data in `src/lib/notification/renderNotification.ts`.

Rendering rules:

- Use `notification.type`, `recipientRole`, `titleKey`, `messageKey`, and
  structured `data`/legacy `details` to choose the display template.
- Format dates with `vi-VN` locale and `Asia/Ho_Chi_Minh` timezone.
- Treat 13-digit epochs as milliseconds and 10-digit epochs as seconds for
  legacy compatibility, then reject values outside the 2020-2100 range.
- Do not append optional fields when missing, null, or undefined.
- Do not mutate saved fallback `title` or `message` data from the API layer.
- If structured rendering is unavailable, apply the display-only legacy
  normalizer to date-like epoch contexts such as `ngày <epoch>` and remove
  broken `undefined`/`null` fragments.

The renderer is used by the notification dropdown, detail modal, full
notification center/profile tab, and socket notification toast text.
