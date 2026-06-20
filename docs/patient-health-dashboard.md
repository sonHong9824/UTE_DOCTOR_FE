# Patient health dashboard

The General Health profile tab now renders a read-only dashboard backed by `GET /patients/me/health-summary?limit=10`.

## Temporary mock fallback

Mock fallback is disabled by default. Enable it only for local/demo review:

```env
NEXT_PUBLIC_PATIENT_HEALTH_MOCK_FALLBACK=true
```

Fallback is used only for a confidently identified missing-route `404` (`ROUTE_NOT_FOUND` or a framework message naming `/patients/me/health-summary`). Authentication, authorization, network, server, patient-not-found, malformed-response, and ambiguous errors render the dashboard error state.

## Testing checklist

- General Health renders illustrative data when the route is missing and the fallback flag is enabled.
- The “Dữ liệu minh họa” notice remains visible in mock state.
- Loading skeleton appears before the request resolves.
- API `200` with `latest: null` and empty history renders the empty state.
- Non-eligible errors render the API error state and “Thử lại”.
- Blood-pressure and heart-rate charts render metric-specific records oldest-to-newest.
- Recent history renders one card per measurement session.
- Other profile tabs remain selectable and preserve the `?tab=` URL behavior.
- Retry and refresh always call the real API.
