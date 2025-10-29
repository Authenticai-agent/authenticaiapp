"""
Contact/Feedback Router
Handles user feedback and messages
Sends email to jura@authenticai.ai and stores in database
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import os
import logging
from services.supabase_client import get_supabase_client
import resend

logger = logging.getLogger(__name__)
router = APIRouter()
supabase = get_supabase_client()

# Initialize Resend for email
resend.api_key = os.getenv("RESEND_API_KEY")

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str
    user_id: Optional[str] = None


@router.post("/submit")
async def submit_contact_message(contact: ContactMessage):
    """
    Submit feedback or contact message
    - Saves to database
    - Sends email to jura@authenticai.ai
    """
    try:
        # Save to database
        feedback_data = {
            "user_id": contact.user_id,
            "name": contact.name,
            "email": contact.email,
            "message": contact.message,
            "status": "new",
            "created_at": datetime.now().isoformat()
        }
        
        result = supabase.table("feedback").insert(feedback_data).execute()
        logger.info(f"✅ Feedback saved from {contact.email}")
        
        # Send email notification
        try:
            email_html = f"""
            <h2>New Feedback from Authenticai</h2>
            <p><strong>From:</strong> {contact.name} ({contact.email})</p>
            <p><strong>Date:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
            <hr>
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">{contact.message}</p>
            <hr>
            <p><small>User ID: {contact.user_id or 'Not logged in'}</small></p>
            """
            
            resend.Emails.send({
                "from": "Authenticai <noreply@authenticai.ai>",
                "to": ["jura@authenticai.ai"],
                "subject": f"New Feedback from {contact.name}",
                "html": email_html
            })
            logger.info(f"📧 Email sent to jura@authenticai.ai")
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            # Don't fail the request if email fails
        
        return {
            "status": "success",
            "message": "Thank you for your feedback! We'll get back to you soon.",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")


@router.get("/messages")
async def get_all_messages(status: Optional[str] = None):
    """
    Get all feedback messages (admin only in production)
    Optional filter by status: new, read, responded, archived
    """
    try:
        query = supabase.table("feedback").select("*").order("created_at", desc=True)
        
        if status:
            query = query.eq("status", status)
        
        result = query.execute()
        
        return {
            "status": "success",
            "messages": result.data,
            "total": len(result.data) if result.data else 0
        }
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")


@router.patch("/messages/{message_id}/status")
async def update_message_status(message_id: str, new_status: str):
    """
    Update message status (admin only in production)
    Status options: new, read, responded, archived
    """
    try:
        if new_status not in ['new', 'read', 'responded', 'archived']:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        result = supabase.table("feedback")\
            .update({"status": new_status})\
            .eq("id", message_id)\
            .execute()
        
        return {
            "status": "success",
            "message": "Status updated successfully"
        }
    except Exception as e:
        logger.error(f"Error updating message status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")
