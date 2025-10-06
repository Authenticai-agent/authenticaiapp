"""
Supabase Admin Management Endpoints
For user management, payment handling, and database operations
"""

from fastapi import FastAPI, Query, HTTPException
from typing import Dict, Any, List, Optional
import os
from datetime import datetime, timedelta
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role key for admin operations
supabase: Optional[Client] = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None
    logger.warning("Supabase credentials not configured")

def create_admin_endpoints(app: FastAPI):
    """Add admin endpoints to the main FastAPI app"""
    
    @app.get("/api/v1/admin/users")
    async def list_all_users(limit: int = Query(100, description="Number of users to return")):
        """List all users from custom users table with subscription status"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Try custom users table first, fallback to auth.users
            try:
                users_response = supabase.table('users').select("*").limit(limit).execute()
                users = users_response.data
                table_type = "custom_users_table"
            except:
                # Fallback to auth.users if custom table doesn't exist
                users_response = supabase.table('auth.users').select("*").limit(limit).execute()
                users = users_response.data
                table_type = "auth_users_table"
            
            # Standardize user data format
            users_with_emails = []
            for user in users:
                user_data = {
                    "id": user.get("id") or user.get("uid"),
                    "email": user.get("email"),
                    "username": user.get("username"),
                    "full_name": user.get("full_name") or user.get("name"),
                    "created_at": user.get("created_at"),
                    "email_confirmed_at": user.get("email_confirmed_at"),
                    'last_sign_in_at': user.get("last_sign_in_at"),
                    "is_active": user.get("active", True),
                    "verified": user.get("verified", False),
                    "subscription_status": user.get("subscription_status", "inactive"),
                    "role": user.get("role", "user")
                }
                users_with_emails.append(user_data)
            
            return {
                "users": users_with_emails,
                "total_count": len(users_with_emails),
                "table_type": table_type,
                "context": "custom_user_management",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to fetch users: {e}")
            return {"error": f"Failed to fetch users: {str(e)}"}

    @app.post("/api/v1/admin/users/{user_id}/reset-password")
    async def reset_user_password(user_id: str):
        """Reset password for a specific user"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Get user email
            user_response = supabase.auth.admin.get_user(user_id)
            user_email = user_response.user.email
            
            # Send password reset email
            password_reset_response = supabase.auth.reset_password_email(user_email)
            
            return {
                "success": True,
                "message": f"Password reset email sent to {user_email}",
                "user_id": user_id,
                "action_required": "user_check_email",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Password reset failed for user {user_id}: {e}")
            return {"error": f"Password reset failed: {str(e)}"}

    @app.post("/api/v1/admin/users/reset-password-by-email")
    async def reset_password_by_email(email: str):
        """Reset password using email address"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Send password reset email
            password_reset_response = supabase.auth.reset_password_email(email)
            
            return {
                "success": True,
                "message": f"Password reset email sent to {email}",
                "action_required": "user_check_email",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Password reset failed for email {email}: {e}")
            return {"error": f"Password reset failed: {str(e)}"}

    @app.get("/api/v1/admin/users/{user_id}")
    async def get_user_details(user_id: str):
        """Get detailed information about a specific user"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Get user details
            user_response = supabase.auth.admin.get_user(user_id)
            user = user_response.user
            
            # Get user's payments (if payments table exists)
            try:
                payments_response = supabase.table('payments').select("*").eq("user_id", user_id).execute()
                payments = payments_response.data
            except:
                payments = []
            
            user_details = {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at,
                "email_confirmed_at": user.email_confirmed_at,
                "last_sign_in_at": user.last_sign_in_at,
                "is_active": user.email_confirmed_at is not None,
                "metadata": user.user_metadata,
                "app_metadata": user.app_metadata,
                "payments": payments,
                "payment_count": len(payments),
                "total_spent": sum(p.get("amount", 0) for p in payments if p.get("status") == "completed")
            }
            
            return {
                "user": user_details,
                "context": "user_details",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get user details for {user_id}: {e}")
            return {"error": f"Failed to get user details: {str(e)}"}

    @app.delete("/api/v1/admin/users/{user_id}")
    async def delete_custom_user(user_id: str):
        """Delete a user from custom users table"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Try to delete from custom users table first
            try:
                delete_response = supabase.table('users').delete().eq('id', user_id).execute()
                table_type = "custom_users_table"
                action = "Hard deleted from custom users table"
            except:
                # Fallback to soft delete (mark as inactive)
                delete_response = supabase.table('users').update({
                    'active': False,
                    'deleted_at': datetime.utcnow().isoformat()
                }).eq('id', user_id).execute()
                table_type = "custom_users_table"
                action = "Soft deleted (marked inactive)"
            
            return {
                "success": True,
                "message": f"User {user_id} has been {action.lower()}",
                "action": action,
                "table_type": table_type,
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to delete user {user_id}: {e}")
            return {"error": f"Failed to delete user: {str(e)}"}

    @app.delete("/api/v1/admin/users/delete-by-email")
    async def delete_user_by_email(email: str = Query(..., description="User email to delete")):
        """Delete user by email from custom users table"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Delete by email from custom users table
            delete_response = supabase.table('users').delete().eq('email', email).execute()
            
            if delete_response.data:
                return {
                    "success": True,
                    "message": f"User with email {email} has been deleted",
                    "deleted_users": len(delete_response.data),
                    "action": "Hard deleted from custom users table",
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "success": False,
                    "message": f"No user found with email {email}",
                    "timestamp": datetime.utcnow().isoformat()
                }
            
        except Exception as e:
            logger.error(f"Failed to delete user by email {email}: {e}")
            return {"error": f"Failed to delete user by email: {str(e)}"}

    @app.post("/api/v1/admin/users/bulk-delete")
    async def bulk_delete_users(user_ids: List[str]):
        """Delete multiple users from custom users table"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Bulk delete from custom users table
            delete_response = supabase.table('users').delete().in_('id', user_ids).execute()
            
            return {
                "success": True,
                "message": f"Deleted {len(delete_response.data)} users",
                "deleted_user_ids": user_ids,
                "actual_deleted_count": len(delete_response.data),
                "action": "Bulk deleted from custom users table",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to bulk delete users: {e}")
            return {"error": f"Failed to bulk delete users: {str(e)}"}

    @app.get("/api/v1/admin/payments")
    async def list_all_payments(limit: int = Query(50, description="Number of payments to return")):
        """List all payments with user information"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Get payments
            payments_response = supabase.table('payments').select("*, users(email)").limit(limit).order('created_at', desc=True).execute()
            payments = payments_response.data
            
            return {
                "payments": payments,
                "total_count": len(payments),
                "context": "payment_management",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to fetch payments: {e}")
            return {"error": f"Failed to fetch payments: {str(e)}"}

    @app.post("/api/v1/admin/payments/{payment_id}/approve")
    async def manual_payment_approval(payment_id: str):
        """Manually approve a payment"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Update payment status
            update_response = supabase.table('payments').update({
                'status': 'completed',
                'paid_at': datetime.utcnow().isoformat(),
                'manually_approved': True
            }).eq('id', payment_id).execute()
            
            return {
                "success": True,
                "message": f"Payment {payment_id} manually approved",
                "payment_id": payment_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[id to approve payment {payment_id}: {e}")
            return {"error": f"Failed to approve payment: {str(e)}"}

    @app.get("/api/v1/admin/analytics")
    async def get_admin_analytics():
        """Get comprehensive admin analytics"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Get analytics data
            users_response = supabase.table('auth.users').select("*").execute()
            users = users_response.data
            
            try:
                payments_response = supabase.table('payments').select("*").execute()
                payments = payments_response.data
            except:
                payments = []
            
            # Calculate metrics
            active_users = len([u for u in users if u.get('email_confirmed_at')])
            new_users_month = len([u for u in users if datetime.fromisoformat(u['created_at'].replace('Z', '')) > datetime.now() - timedelta(days=30)])
            
            total_revenue = sum(p.get('amount', 0) for p in payments if p.get('status') == 'completed')
            monthly_revenue = sum(p.get('amount', 0) for p in payments if p.get('status') == 'completed' and 
                                datetime.fromisoformat(p['paid_at'].replace('Z', '')) > datetime.now() - timedelta(days=30))
            
            analytics = {
                "overview": {
                    "total_users": len(users),
                    "active_users": active_users,
                    "new_users_this_month": new_users_month,
                    "verification_rate": (active_users / len(users) * 100) if users else 0
                },
                "revenue": {
                    "total_revenue": total_revenue,
                    "monthly_revenue": monthly_revenue,
                    "total_payments": len(payments),
                    "success_rate": len([p for p in payments if p.get('status') == 'completed']) / len(payments) if payments else 0
                },
                "user_growth": {
                    "new_users_today": len([u for u in users if datetime.fromisoformat(u['created_at'].replace('Z', '')) > datetime.now() - timedelta(days=1)]),
                    "new_users_week": len([u for u in users if datetime.fromisoformat(u['created_at'].replace('Z', '')) > datetime.now() - timedelta(days=7)]),
                    "new_users_month": new_users_month
                }
            }
            
            return {
                "analytics": analytics,
                "context": "admin_analytics",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get analytics: {e}")
            return {"error": f"Failed to get analytics: {str(e)}"}

    @app.get("/api/v1/admin/database/health")
    async def check_database_health():
        """Check database connectivity and health"""
        try:
            if not supabase:
                return {"error": "Supabase not configured"}
            
            # Test database connection
            test_response = supabase.table('auth.users').select("*").limit(1).execute()
            
            return {
                "status": "healthy",
                "message": "Database connection successful",
                "user_count": test_response.count if hasattr(test_response, 'count') else 'unknown',
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy", 
                "error": f"Database connection failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }

    logger.info("Admin endpoints registered successfully")
