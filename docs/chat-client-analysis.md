# Chat Client Analysis

## Current chat flow summary

- `ChatSocketProvider` is mounted at the app root and creates a shared Socket.IO client for the `/chat` namespace.
- `ChatBubble` is rendered from doctor and user profile layouts. It reads the logged-in account id from `localStorage.id`, opens a floating chat panel, joins the personal chat room, lists/searches conversations, and passes the selected conversation into `ChatWindow`.
- `ConversationList` calls `GET /chat/conversations`, chooses the other participant by comparing `participant.accountId` with the current user's id, and displays the last message preview.
- `ChatWindow` fetches paginated messages, joins the conversation room, listens for realtime `CHAT_MESSAGE_RECEIVED`, renders message bubbles, and sends new messages through the shared socket.

## Message fetch flow

- API module: `src/apis/chat/chat.api.ts`
- Endpoint: `GET /chat/conversations/:id/messages?before=&limit=`
- Contract notes:
  - Authenticated endpoint.
  - Backend sorts messages by `createdAt desc, _id desc`.
  - Message schema from `api-contract/CHAT_FLOW_SUMMARY.md`: `conversationId`, `senderId`, `senderEmail`, `content`, `type`, `clientMessageId`, `createdAt`, `updatedAt`.
- Current client behavior before fix:
  - Stores raw API message payloads directly in component state.
  - Reverses the response array in place.
  - Uses raw `oldestMessage.createdAt` for pagination.
  - Does not normalize ids, dates, sender data, or missing fields.

## Realtime receive/send flow

- Namespace: `/chat`
- Join events:
  - `CHAT_JOIN_USER`
  - `CHAT_JOIN_CONVERSATION` with `{ conversationId }`
- Send event per contract:
  - `CHAT_MESSAGE_SEND` with `{ conversationId, content, clientMessageId? }`
  - Server derives sender identity from JWT.
- Receive event:
  - `CHAT_MESSAGE_RECEIVED` as a DataResponse containing the persisted message payload.
- Current client behavior before fix:
  - Realtime messages are appended as raw payloads, while fetched messages are also raw but may have different shapes.
  - Send payload includes client-provided `senderId` and `senderEmail`, which are not part of the current socket contract.
  - Deduplication checks only `_id || clientMessageId`.
  - Socket cleanup calls `off(CHAT_MESSAGE_RECEIVED)` without a callback, removing every listener for that event on the shared socket.

## Current sender/receiver detection logic

- `ChatBubble` builds `currentUser.accountId` from `localStorage.id`.
- `ChatWindow` treats a message as mine when `m.senderId === currentUser.accountId`.
- `ConversationList` treats a last message as mine when `conv.lastMessage.senderId === currentUserId`.
- `ConversationList` chooses the other participant with `participant.accountId !== currentUserId`.

## Found bugs or suspicious logic

- Raw id comparison is brittle. `senderId` and `currentUser.accountId` are compared with strict equality without normalizing string/number/ObjectId-like values.
- Message payloads are not normalized. API-fetched messages and realtime messages can diverge in shape and still flow into the same renderer.
- Sender display data is not modeled. The UI has no normalized sender name/avatar, so it can accidentally rely on selected receiver data instead of actual message sender data.
- Socket listener cleanup is unsafe. Calling `off(event)` on a shared socket can remove listeners registered by other chat components.
- `CHAT_MESSAGE_SEND` includes `senderId` and `senderEmail`, but the backend contract says sender identity comes from JWT. This is suspicious because role/profile/account id confusion is exactly the kind of issue that can flip message ownership.
- Conversation participant comparison is also strict and can choose the wrong receiver if one side is a number and the other is a string.
- There is no explicit error state in `ChatWindow`; failed fetches only log to console.
- There is no shared sorting/deduping path, so message order can differ between initial fetch, older-page fetch, and realtime append.

## Evidence: client-side or likely server-side?

- Evidence of client-side risk is strong:
  - The UI determines ownership with raw strict equality.
  - It does not use a single normalized message model.
  - It sends extra sender identity fields over the socket even though the contract says the server derives sender from JWT.
  - Shared socket listener cleanup can remove unrelated listeners and cause inconsistent realtime behavior.
- Evidence of backend-side payload ambiguity:
  - `api.md` documents the messages endpoint but does not include a concrete message response example.
  - The backend summary says message documents contain `senderId` as an account id, but sender profile/name/avatar enrichment is not documented for message fetch or realtime payloads.
- Conclusion:
  - The current bug can be caused on the client side even if the backend is correct.
  - If, after this client normalization, messages still arrive with a `senderId` that is not the sender's account id, that would be backend evidence to report.

## UI improvement plan

- Keep behavior and API calls intact.
- Normalize every fetched and realtime message before rendering.
- Align bubbles from `isMine`, derived only from logged-in account id versus normalized `senderId`.
- Add defensive sender display:
  - Own messages use a local "You" label.
  - Other messages use available sender name, selected receiver name, sender email, or a fallback.
  - Missing avatars fall back to initials.
- Add loading, error, and empty states.
- Improve spacing, bubbles, timestamps, input, send button, and responsive sizing.
- Auto-scroll when the user is near the bottom or after sending/receiving own messages.
- Preserve manual scroll position while loading older messages.

## Files that need changes

- `src/components/chat/ChatWindow.tsx`
- `src/components/chat/ChatBubble.tsx`
- `src/components/chat/ConversationList.tsx`
- `src/features/chat/types/chat.types.ts` (new)
- `src/features/chat/utils/chat-message.util.ts` (new)
- `docs/chat-client-analysis.md`

## Test/manual verification checklist

- Login as User A and send a message to User B. User A sees it as mine.
- Login as User B and view the same message. User B sees it as theirs.
- Login as User B and reply. User B sees the reply as mine; User A sees it as theirs.
- Refresh the chat page. Message sides remain correct.
- Send a message and wait for realtime/server acknowledgement. Message does not flip sides or duplicate.
- Switch between multiple conversations. Messages do not leak between conversations.
- Test missing avatar/name. UI does not crash and uses fallbacks.
- Test loading, empty, and error states.
- Test smaller screen width.
- Run `npm run lint`.
- Run `npm run build` if lint passes or after lint issues are resolved.
