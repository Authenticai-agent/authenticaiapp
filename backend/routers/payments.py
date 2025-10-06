from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Dict, Any
import stripe
import os
from datetime import datetime

from models.schemas import Subscription, SubscriptionCreate, User
from routers.auth import get_current_user
from database import get_db
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

SUBSCRIPTION_PLANS = {
    "premium": {
        "name": "Premium Plan",
        "price": 999,  # $9.99 in cents
        "features": [
            "Proactive alerts and notifications",
            "Advanced personalization",
            "Smart home device control",
            "Unlimited coaching sessions",
            "Priority support"
        ]
    },
    "enterprise": {
        "name": "Enterprise Plan", 
        "price": 2999,  # $29.99 in cents
        "features": [
            "All Premium features",
            "Multi-location monitoring",
            "Team management",
            "Custom integrations",
            "Dedicated support"
        ]
    }
}

@router.get("/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return {
        "plans": SUBSCRIPTION_PLANS,
        "currency": "usd"
    }

@router.post("/create-subscription", response_model=Subscription)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new subscription"""
    db = get_db()
    
    try:
        # Check if user already has an active subscription
        existing_sub = db.table("subscriptions").select("*").eq("user_id", current_user.id).eq("status", "active").execute()
        
        if existing_sub.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription"
            )
        
        # Get or create Stripe customer
        customer = await _get_or_create_stripe_customer(current_user)
        
        # Attach payment method to customer
        stripe.PaymentMethod.attach(
            subscription_data.payment_method_id,
            customer=customer.id
        )
        
        # Set as default payment method
        stripe.Customer.modify(
            customer.id,
            invoice_settings={'default_payment_method': subscription_data.payment_method_id}
        )
        
        # Get plan details
        plan_details = SUBSCRIPTION_PLANS.get(subscription_data.plan_type)
        if not plan_details:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid subscription plan"
            )
        
        # Create Stripe subscription
        stripe_subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': plan_details['name'],
                    },
                    'unit_amount': plan_details['price'],
                    'recurring': {
                        'interval': 'month',
                    },
                },
            }],
            payment_behavior='default_incomplete',
            expand=['latest_invoice.payment_intent'],
        )
        
        # Store subscription in database
        subscription_record = {
            "user_id": current_user.id,
            "stripe_customer_id": customer.id,
            "stripe_subscription_id": stripe_subscription.id,
            "plan_type": subscription_data.plan_type,
            "status": stripe_subscription.status,
            "current_period_start": datetime.fromtimestamp(stripe_subscription.current_period_start),
            "current_period_end": datetime.fromtimestamp(stripe_subscription.current_period_end)
        }
        
        result = db.table("subscriptions").insert(subscription_record).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create subscription record"
            )
        
        # Update user subscription tier
        db.table("users").update({"subscription_tier": subscription_data.plan_type}).eq("id", current_user.id).execute()
        
        subscription = Subscription(**result.data[0])
        
        return subscription
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription"
        )

@router.get("/subscription", response_model=Subscription)
async def get_current_subscription(current_user: User = Depends(get_current_user)):
    """Get user's current subscription"""
    db = get_db()
    
    try:
        result = db.table("subscriptions").select("*").eq("user_id", current_user.id).order("created_at", desc=True).limit(1).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No subscription found"
            )
        
        return Subscription(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch subscription"
        )

@router.post("/cancel-subscription")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    """Cancel user's subscription"""
    db = get_db()
    
    try:
        # Get current subscription
        result = db.table("subscriptions").select("*").eq("user_id", current_user.id).eq("status", "active").execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found"
            )
        
        subscription_data = result.data[0]
        stripe_subscription_id = subscription_data["stripe_subscription_id"]
        
        # Cancel Stripe subscription
        stripe.Subscription.modify(
            stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        # Update subscription status
        db.table("subscriptions").update({"status": "canceled"}).eq("id", subscription_data["id"]).execute()
        
        return {"message": "Subscription canceled successfully. Access will continue until the end of the current billing period."}
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error canceling subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error canceling subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
        
        # Handle the event
        if event['type'] == 'invoice.payment_succeeded':
            await _handle_payment_succeeded(event['data']['object'])
        elif event['type'] == 'invoice.payment_failed':
            await _handle_payment_failed(event['data']['object'])
        elif event['type'] == 'customer.subscription.deleted':
            await _handle_subscription_deleted(event['data']['object'])
        elif event['type'] == 'customer.subscription.updated':
            await _handle_subscription_updated(event['data']['object'])
        else:
            logger.info(f"Unhandled event type: {event['type']}")
        
        return {"status": "success"}
        
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.get("/usage")
async def get_usage_stats(current_user: User = Depends(get_current_user)):
    """Get user's usage statistics"""
    db = get_db()
    
    try:
        # Get coaching sessions count for current month
        coaching_result = db.table("coaching_sessions").select("id").eq("user_id", current_user.id).gte("created_at", datetime.now().replace(day=1).isoformat()).execute()
        
        # Get predictions count for current month
        predictions_result = db.table("predictions").select("id").eq("user_id", current_user.id).gte("created_at", datetime.now().replace(day=1).isoformat()).execute()
        
        # Get smart devices count
        devices_result = db.table("smart_devices").select("id").eq("user_id", current_user.id).eq("is_active", True).execute()
        
        usage_stats = {
            "coaching_sessions_this_month": len(coaching_result.data) if coaching_result.data else 0,
            "predictions_this_month": len(predictions_result.data) if predictions_result.data else 0,
            "active_devices": len(devices_result.data) if devices_result.data else 0,
            "subscription_tier": current_user.subscription_tier,
            "period": datetime.now().strftime("%B %Y")
        }
        
        # Add tier limits
        if current_user.subscription_tier == "free":
            usage_stats["limits"] = {
                "coaching_sessions": 10,
                "predictions": 5,
                "devices": 1
            }
        elif current_user.subscription_tier == "premium":
            usage_stats["limits"] = {
                "coaching_sessions": "unlimited",
                "predictions": "unlimited", 
                "devices": 10
            }
        else:  # enterprise
            usage_stats["limits"] = {
                "coaching_sessions": "unlimited",
                "predictions": "unlimited",
                "devices": "unlimited"
            }
        
        return usage_stats
        
    except Exception as e:
        logger.error(f"Error fetching usage stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch usage statistics"
        )

async def _get_or_create_stripe_customer(user: User):
    """Get existing Stripe customer or create new one"""
    try:
        # Try to find existing customer by email
        customers = stripe.Customer.list(email=user.email, limit=1)
        
        if customers.data:
            return customers.data[0]
        
        # Create new customer
        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}".strip() or user.email,
            metadata={
                'user_id': user.id
            }
        )
        
        return customer
        
    except Exception as e:
        logger.error(f"Error managing Stripe customer: {e}")
        raise

async def _handle_payment_succeeded(invoice):
    """Handle successful payment"""
    db = get_db()
    subscription_id = invoice['subscription']
    
    # Update subscription status
    db.table("subscriptions").update({"status": "active"}).eq("stripe_subscription_id", subscription_id).execute()
    
    logger.info(f"Payment succeeded for subscription: {subscription_id}")

async def _handle_payment_failed(invoice):
    """Handle failed payment"""
    db = get_db()
    subscription_id = invoice['subscription']
    
    # Update subscription status
    db.table("subscriptions").update({"status": "past_due"}).eq("stripe_subscription_id", subscription_id).execute()
    
    logger.warning(f"Payment failed for subscription: {subscription_id}")

async def _handle_subscription_deleted(subscription):
    """Handle subscription deletion"""
    db = get_db()
    subscription_id = subscription['id']
    
    # Update subscription and user tier
    result = db.table("subscriptions").update({"status": "canceled"}).eq("stripe_subscription_id", subscription_id).execute()
    
    if result.data:
        user_id = result.data[0]["user_id"]
        db.table("users").update({"subscription_tier": "free"}).eq("id", user_id).execute()
    
    logger.info(f"Subscription deleted: {subscription_id}")

async def _handle_subscription_updated(subscription):
    """Handle subscription updates"""
    db = get_db()
    subscription_id = subscription['id']
    
    # Update subscription details
    update_data = {
        "status": subscription['status'],
        "current_period_start": datetime.fromtimestamp(subscription['current_period_start']),
        "current_period_end": datetime.fromtimestamp(subscription['current_period_end'])
    }
    
    db.table("subscriptions").update(update_data).eq("stripe_subscription_id", subscription_id).execute()
    
    logger.info(f"Subscription updated: {subscription_id}")
