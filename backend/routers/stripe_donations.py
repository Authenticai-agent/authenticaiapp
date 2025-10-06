"""
Stripe Donation Checkout
"""
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from pydantic import BaseModel
import stripe
import os
import uuid
from typing import Optional
import logging
from utils.auth_utils import get_current_user
from models.schemas import User

logger = logging.getLogger(__name__)

router = APIRouter()

# Debug: This should print when module is loaded
print("🔵 stripe_donations.py module loaded - NEW VERSION")

class CreateCheckoutRequest(BaseModel):
    price_id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None

@router.post("/create-checkout-session")
async def create_checkout_session(request: CreateCheckoutRequest):
    """
    Create a Stripe Checkout session for donations
    """
    try:
        # Initialize Stripe with API key from environment
        api_key = os.getenv("STRIPE_SECRET_KEY")
        logger.info(f"Stripe API key loaded: {api_key[:20] if api_key else 'None'}...")
        
        if not api_key:
            logger.error("STRIPE_SECRET_KEY not found in environment variables")
            raise HTTPException(status_code=500, detail="Stripe not configured")
        
        stripe.api_key = api_key
        logger.info("Stripe API key set successfully")
        # Map amount to price IDs
        price_ids = {
            "10": os.getenv("STRIPE_PRICE_SUPPORTER"),
            "20": os.getenv("STRIPE_PRICE_CONTRIBUTOR"),
            "35": os.getenv("STRIPE_PRICE_CHAMPION"),
        }
        
        # Create Checkout Session with idempotency key
        idempotency_key = str(uuid.uuid4())
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': request.price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard?donation=success",
            cancel_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard?donation=cancelled",
            customer_email=request.user_email,
            metadata={
                'user_id': request.user_id or 'anonymous',
            },
            allow_promotion_codes=True,
            idempotency_key=idempotency_key,  # Prevent duplicate charges on retry
        )
        
        return {
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        }
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhooks for subscription events
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    logger.info(f"📨 Received webhook event: {event['type']}")
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        logger.info(f"💳 Processing checkout session: {session.get('id')}")
        await handle_successful_donation(session)
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        await handle_subscription_cancelled(subscription)
    
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        await handle_payment_succeeded(invoice)
    
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        await handle_payment_failed(invoice)
    else:
        logger.info(f"ℹ️ Unhandled event type: {event['type']}")
    
    return {'status': 'success'}


async def handle_successful_donation(session):
    """Save donation to Supabase"""
    from services.supabase_client import get_supabase_client
    
    supabase = get_supabase_client()
    user_id = session['metadata'].get('user_id')
    
    # Save to donations table
    donation_data = {
        'user_id': user_id,
        'stripe_customer_id': session.get('customer'),
        'stripe_subscription_id': session.get('subscription'),
        'amount': session['amount_total'] / 100,  # Convert cents to dollars
        'currency': session['currency'],
        'status': 'active',
        'interval': 'year',
    }
    
    try:
        result = supabase.table('donations').insert(donation_data).execute()
        logger.info(f"✅ Donation saved for user {user_id}")
    except Exception as e:
        logger.error(f"Error saving donation: {e}")


async def handle_subscription_cancelled(subscription):
    """Update donation status when cancelled"""
    from services.supabase_client import get_supabase_client
    
    supabase = get_supabase_client()
    
    try:
        supabase.table('donations').update({
            'status': 'cancelled'
        }).eq('stripe_subscription_id', subscription['id']).execute()
        
        logger.info(f"✅ Subscription cancelled: {subscription['id']}")
    except Exception as e:
        logger.error(f"Error updating cancelled subscription: {e}")


async def handle_payment_succeeded(invoice):
    """Log successful payment"""
    logger.info(f"✅ Payment succeeded: {invoice['id']}")


async def handle_payment_failed(invoice):
    """Handle failed payment"""
    logger.warning(f"⚠️ Payment failed: {invoice['id']}")


class StopDonationRequest(BaseModel):
    user_id: str

@router.post("/stop-donation")
async def stop_recurring_donation(request: StopDonationRequest, current_user: User = Depends(get_current_user)):
    """
    Stop a user's recurring donation
    - User keeps access until end of current period
    - No refund issued (non-refundable policy)
    - Won't be charged again
    Requires authentication and user can only stop their own donation
    """
    from services.supabase_client import get_supabase_client
    
    user_id = request.user_id
    
    # Authorization check: user can only stop their own donation
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You can only stop your own donation"
        )
    
    try:
        # Initialize Stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        
        # Get user's active recurring donation from database
        supabase = get_supabase_client()
        result = supabase.table('donations').select('*').eq('user_id', user_id).eq('status', 'active').execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="No active recurring donation found")
        
        donation = result.data[0]
        subscription_id = donation['stripe_subscription_id']
        
        # Stop recurring donation at period end (no refund, keeps access)
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
        
        # Update database to reflect that user requested to stop
        supabase.table('donations').update({
            'cancel_at_period_end': True,
            'updated_at': 'NOW()'
        }).eq('stripe_subscription_id', subscription_id).execute()
        
        logger.info(f"✅ Recurring donation set to stop at period end: {subscription_id}")
        
        return {
            'success': True,
            'message': 'Your recurring donation will stop at the end of your current period. No refund will be issued, and you\'ll continue to have access until then.',
            'cancel_at': getattr(subscription, 'cancel_at', None),
            'current_period_end': getattr(subscription, 'current_period_end', None)
        }
        
    except Exception as e:
        logger.error(f"Error stopping recurring donation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/donations/{user_id}")
async def get_all_donations(user_id: str, current_user: User = Depends(get_current_user)):
    """
    Get all donations for a user
    Requires authentication and user can only access their own donations
    """
    from services.supabase_client import get_supabase_client
    
    # Authorization check: user can only access their own donations
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: You can only access your own donations"
        )
    
    try:
        supabase = get_supabase_client()
        result = supabase.table('donations').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        
        if not result.data or len(result.data) == 0:
            return {'donations': []}
        
        donations_list = []
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        
        for donation in result.data:
            try:
                # Get full details from Stripe if subscription exists
                if donation.get('stripe_subscription_id'):
                    subscription = stripe.Subscription.retrieve(donation['stripe_subscription_id'])
                    
                    # Calculate period end from created_at + 1 year if Stripe doesn't have it
                    current_period_end = getattr(subscription, 'current_period_end', None)
                    if not current_period_end and donation.get('created_at'):
                        from datetime import datetime, timedelta
                        created_at = datetime.fromisoformat(donation['created_at'].replace('Z', '+00:00'))
                        period_end = created_at + timedelta(days=365)
                        current_period_end = int(period_end.timestamp())
                    
                    donations_list.append({
                        'id': donation['id'],
                        'status': donation['status'],
                        'amount': float(donation['amount']),
                        'currency': donation['currency'],
                        'interval': donation['interval'],
                        'created_at': donation['created_at'],
                        'stripe_subscription_id': donation['stripe_subscription_id'],
                        'current_period_end': current_period_end,
                        'cancel_at_period_end': donation.get('cancel_at_period_end', False),  # Use DB field
                        'cancelled_at': getattr(subscription, 'canceled_at', None)
                    })
                else:
                    # Include donation even without Stripe subscription
                    donations_list.append({
                        'id': donation['id'],
                        'status': donation['status'],
                        'amount': float(donation['amount']),
                        'currency': donation['currency'],
                        'interval': donation['interval'],
                        'created_at': donation['created_at']
                    })
            except Exception as e:
                logger.error(f"Error processing donation {donation.get('id')}: {e}")
                # Still include the donation with basic info
                donations_list.append({
                    'id': donation['id'],
                    'status': donation['status'],
                    'amount': float(donation['amount']),
                    'currency': donation['currency'],
                    'interval': donation['interval'],
                    'created_at': donation['created_at']
                })
        
        return {'donations': donations_list}
        
    except Exception as e:
        logger.error(f"Error getting donations: {e}")
        return {'donations': [], 'error': str(e)}


@router.get("/subscription-status/{user_id}")
async def get_subscription_status(user_id: str, current_user: User = Depends(get_current_user)):
    """
    Get user's current subscription status (latest active donation)
    Requires authentication and user can only access their own subscription
    """
    from services.supabase_client import get_supabase_client
    
    # Authorization check: user can only access their own subscription
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You can only access your own subscription status"
        )
    
    try:
        supabase = get_supabase_client()
        result = supabase.table('donations').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
        
        if not result.data or len(result.data) == 0:
            return {'has_subscription': False}
        
        donation = result.data[0]
        
        # Get full details from Stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        subscription = stripe.Subscription.retrieve(donation['stripe_subscription_id'])
        
        # Calculate period end from created_at + 1 year if Stripe doesn't have it
        current_period_end = getattr(subscription, 'current_period_end', None)
        if not current_period_end and donation.get('created_at'):
            from datetime import datetime, timedelta
            created_at = datetime.fromisoformat(donation['created_at'].replace('Z', '+00:00'))
            period_end = created_at + timedelta(days=365)
            current_period_end = int(period_end.timestamp())
        
        return {
            'has_subscription': True,
            'status': donation['status'],
            'amount': donation['amount'],
            'currency': donation['currency'],
            'current_period_end': current_period_end,
            'cancel_at_period_end': getattr(subscription, 'cancel_at_period_end', False),
            'cancelled_at': getattr(subscription, 'canceled_at', None)
        }
        
    except Exception as e:
        logger.error(f"Error getting subscription status: {e}")
        return {'has_subscription': False, 'error': str(e)}