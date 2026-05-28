# Security Specification: Nigeria Pulse Survey Engine

## Data Invariants
1. A **Survey** must have a unique ID (Calendar Week based, e.g., CW20-2026).
2. **Votes** are strictly nested under the Survey they belong to.
3. A **Vote** must include a `deviceId` to prevent multiple votes (enforced via application logic and checked in rules if possible, but primarily via unique ID if we use `deviceId` as part of the vote ID).
4. **Surveys** can only be created or modified by an Admin.
5. **Results** (counts) on the Survey document are updated via Cloud Functions or a Batch write (if using client-side updates, we need strict count validation). Since we are forgoing Cloud Functions for a simple MVP, we will allow users to increment the count atomically *only* if they are also creating a vote document in the same batch.

## Dirty Dozen Payloads (Targeting Critical Failures)

1. **The Ghost Survey Payload**: Attempt to create a survey as a non-admin.
2. **The Result Spammer**: Attempt to update `totalVotes` without creating a vote document.
3. **The Multiple Voter**: Attempt to create multiple votes for the same survey with the same `deviceId`. (We will use `deviceId` as the document ID for votes to enforce uniqueness).
4. **The Time Traveler**: Attempt to vote for an archived or planned survey.
5. **The Identity Thief**: Attempt to delete another user's vote.
6. **The Option Overflower**: Attempt to vote for an `optionIndex` that doesn't exist (out of range).
7. **The Bulk Deletion**: Attempt to delete the `surveys` collection.
8. **The PII Leak**: Attempt to read all votes across all surveys (listing subcollections).
9. **The Admin Escalation**: Attempt to create a document in the `/admins/` collection.
10. **The Field Poisoner**: Attempt to add extra fields to a Survey document (e.g. `isVerified: true`).
11. **The Sentiment Spoofer**: Attempt to update another user's demographic data in their vote.
12. **The Terminal Lockbreaker**: Attempt to change the question of an active survey.

## Path Mapping
- `/surveys/{surveyId}`: Read access for all. Write for admins.
- `/surveys/{surveyId}/votes/{deviceId}`: Create for all (if active). Read for none (aggregate only) or owner.
- `/admins/{userId}`: No access (internal check).
