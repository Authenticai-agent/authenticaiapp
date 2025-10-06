# Donation Policy - AuthentiCare

## Non-Refundable Donations with Flexible Cancellation

### How It Works

1. **Annual Subscriptions**
   - Donations are recurring annual subscriptions
   - Three tiers: $10/year, $20/year, $35/year
   - Charged once per year on your anniversary date

2. **Non-Refundable Policy**
   - All donations are non-refundable
   - No partial refunds for unused time
   - This helps us maintain consistent funding for the platform

3. **Cancel Anytime**
   - You can cancel your donation subscription at any time
   - When you cancel:
     - ✅ You keep access until the end of your paid period
     - ✅ You won't be charged again when your year ends
     - ❌ No refund will be issued for the current period
   
4. **Example Timeline**
   ```
   Jan 1, 2025: You donate $10 (charged immediately)
   Jun 1, 2025: You decide to cancel
   Jan 1, 2026: Your access continues until this date
   Jan 1, 2026: Subscription ends, no charge, no refund
   ```

### How to Cancel

1. Go to Dashboard
2. Scroll to donation card
3. Click "Manage existing donation →"
4. Click "Cancel Subscription"
5. Confirm cancellation

### What Happens After Cancellation

- **Immediate**: Status changes to "Cancelling"
- **Until Period End**: You keep full access
- **After Period End**: Subscription ends, no further charges
- **No Refund**: The current period remains non-refundable

### Why Non-Refundable?

- Helps us plan and budget for server costs
- Prevents donation abuse
- Standard practice for non-profit donations
- You still get full value for your paid period

### Questions?

Contact us if you have any questions about our donation policy.

---

## Technical Implementation

### Backend Endpoints

1. **POST /api/v1/stripe/cancel-subscription**
   - Cancels subscription at period end
   - No immediate termination
   - No refund issued

2. **GET /api/v1/stripe/subscription-status/{user_id}**
   - Returns current subscription status
   - Shows cancellation status
   - Displays period end date

### Frontend Pages

1. **/manage-donation**
   - View subscription details
   - Cancel subscription
   - See cancellation status

### Stripe Configuration

- Uses `cancel_at_period_end=True`
- Keeps subscription active until period ends
- Prevents future charges
- No refund processing needed
