# Security Specification - MoneyDB (Income & Expense Tracker)

## 1. Data Invariants
1. **User Isolation**: A user can only read, create, update, or delete their own transactions located at `/users/{userId}/transactions/{transactionId}` where `request.auth.uid == userId`.
2. **Identity Integrity**: For transactions, `userId` field inside document must strictly equal `request.auth.uid` and `{userId}` path variable.
3. **Immutability of Owner & Timestamp**: `userId` and `createdAt` cannot be altered once created.
4. **Valid Types and Boundaries**:
   - `amount`: Must be a positive number (`amount > 0` and `amount < 1000000000`).
   - `type`: Must be strictly `'income'` or `'expense'`.
   - `category`: String with length between 1 and 64 characters.
   - `description`: String with length up to 255 characters.
   - `date`: Valid date string format (YYYY-MM-DD).
   - `paymentMethod`: String with length up to 50 characters.
5. **No Unauthenticated Access**: All read/write operations require `request.auth != null`.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Unauthenticated Write**: Creating transaction without login (`auth == null`).
2. **Impersonation Attack**: User A creating a transaction in User B's `/users/{userB}/transactions/{txId}` path.
3. **Cross-Tenant UserId Spoofing**: User A creating in `/users/{userA}/...` but setting `userId: userB`.
4. **Negative or Zero Amount**: Setting `amount: -500` or `amount: 0`.
5. **Invalid Transaction Type**: Setting `type: 'crypto_drain'` instead of `'income'` or `'expense'`.
6. **Ghost Field / Shadow Injection**: Adding unauthorized field `isAdmin: true` or `verified: true`.
7. **Giant String / Denial-of-Wallet Attack**: Injecting 5MB string into `description`.
8. **Date Poisoning**: Setting date to invalid format or executable script injection `<script>`.
9. **Tampering createdAt**: Attempting to alter `createdAt` on an existing document update.
10. **Tampering userId on Update**: Attempting to switch owner `userId` on update.
11. **Path Variable Traversal/Poisoning**: Using invalid non-alphanumeric document ID with special characters like `../../hack`.
12. **Blanket Collection Traversal**: Attempting an unrestricted cross-user collection query.

## 3. Security Verification Checklist
- All operations validated through `isValidTransaction()` helper.
- `allow read, write: if false;` catch-all present at root.
- Document IDs validated using regex `^[a-zA-Z0-9_-]+$`.
- Updates strictly restricted via `affectedKeys().hasOnly(...)`.
