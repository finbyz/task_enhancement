import json
import frappe
from frappe.utils import nowdate, add_days, add_months, add_years
from frappe.email.doctype.notification.notification import Notification as _Notification, get_context
from frappe.email.doctype.notification.notification import get_reference_doctype
from frappe.email.doctype.notification.notification import get_reference_name
from frappe.desk.doctype.notification_log.notification_log import enqueue_create_notification
from frappe import _
class Notification(_Notification):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.email.doctype.notification_recipient.notification_recipient import NotificationRecipient
        from frappe.types import DF

        attach_print: DF.Check
        channel: DF.Literal["Email", "Slack", "System Notification", "SMS", "Escalate Task"]
        condition: DF.Code | None
        date_changed: DF.Literal[None]
        days_in_advance: DF.Int
        document_type: DF.Link
        enabled: DF.Check
        event: DF.Literal[
            "",
            "New",
            "Save",
            "Submit",
            "Cancel",
            "Days After",
            "Days Before",
            "Value Change",
            "Method",
            "Custom",
        ]
        is_standard: DF.Check
        message: DF.Code | None
        message_type: DF.Literal["Markdown", "HTML", "Plain Text"]
        method: DF.Data | None
        module: DF.Link | None
        print_format: DF.Link | None
        property_value: DF.Data | None
        recipients: DF.Table[NotificationRecipient]
        send_system_notification: DF.Check
        send_to_all_assignees: DF.Check
        sender: DF.Link | None
        sender_email: DF.Data | None
        set_property_after_alert: DF.Literal[None]
        slack_webhook_url: DF.Link | None
        subject: DF.Data | None
        value_changed: DF.Literal[None]
    # end: auto-generated types

    def send(self, doc):
        """Build recipients and send Notification"""

        context = {"doc": doc, "alert": self, "comments": None}
        if doc.get("_comments"):
            context["comments"] = json.loads(doc.get("_comments"))

        if self.is_standard:
            self.load_standard_properties(context)

        try:
            if self.channel == "Email":
                self.send_an_email(doc, context)

            if self.channel == "Slack":
                self.send_a_slack_msg(doc, context)

            if self.channel == "SMS":
                self.send_sms(doc, context)

            if self.channel == "System Notification" or self.send_system_notification:
                self.create_system_notification(doc, context)
            # Added two more condition checks for escalation management
            if self.channel == "Escalate Task" and self.document_type != "Task":
                frappe.throw("Escalate task is only applicable for Task DocType")
            if self.channel == "Escalate Task":
                self.escalate_task(doc,context)
        except Exception as e:
            self.log_error(f"Failed to send Notification: {str(e)}")
            
        if self.set_property_after_alert:
            allow_update = True
            if (
                doc.docstatus.is_submitted()
                and not doc.meta.get_field(self.set_property_after_alert).allow_on_submit
            ):
                allow_update = False
            try:
                if allow_update and not doc.flags.in_notification_update:
                    fieldname = self.set_property_after_alert
                    value = self.property_value
                    if doc.meta.get_field(fieldname).fieldtype in frappe.model.numeric_fieldtypes:
                        value = frappe.utils.cint(value)

                    doc.reload()
                    doc.set(fieldname, value)
                    doc.flags.updater_reference = {
                        "doctype": self.doctype,
                        "docname": self.name,
                        "label": _("via Notification"),
                    }
                    doc.flags.in_notification_update = True
                    doc.save(ignore_permissions=True)
                    doc.flags.in_notification_update = False
            except Exception:
                self.log_error("Document update failed")
     
    def escalate_task(self, doc, context):
        if self.send_system_notification:
                self.create_system_notification(doc, context)
        try:
            # Get users to assign based on recipients configuration
            users_to_assign = []
            for recipient in self.recipients:
                if recipient.receiver_by_role:
                    role_users = frappe.get_all(
                        "Has Role",
                        filters={
                            "role": recipient.receiver_by_role,
                            "parenttype": "User"
                        },
                        fields=["parent"]
                    )
                    # Get the first active user with the role
                    for user in role_users:
                        if frappe.db.get_value("User", user.parent, "enabled"):
                            users_to_assign.append(user.parent)
                            break
                        
            # Create new assignments
            for user in users_to_assign:
                if not frappe.db.exists("ToDo", {
                    "reference_type": doc.doctype,
                    "reference_name": doc.name,
                    "allocated_to": user,
                    "status": "Open"
                }):
                    todo = frappe.new_doc("ToDo")
                    todo.update({
                        "status": "Open",
                        "priority": "High",
                        "date": frappe.utils.nowdate(),
                        "allocated_to": user,
                        "reference_type": doc.doctype,
                        "reference_name": doc.name,
                        "description": f"Task Escalated: {doc.name} - {doc.subject if hasattr(doc, 'subject') else ''}",
                        "assigned_by": frappe.session.user
                    })
                    todo.insert(ignore_permissions=True)
                    
            # Notify users about assignment
            assignment_message = f"Task {doc.name} has been escalated and assigned to you"
            for user in users_to_assign:
                frappe.publish_realtime(
                    event="eval_js",
                    message=f'frappe.show_alert("{assignment_message}", 5);',
                    user=user
                )

        except Exception as e:
            error_message = f"Failed to process Task Escalation: {str(e)}\n{frappe.get_traceback()}"
            self.log_error(error_message)
            frappe.log_error(error_message, _("Task Escalation Error"))
            
    def create_system_notification(self, doc, context):
        if self.channel == "Escalate Task":
            subject = f"Task {doc.name} is escalated to you"
        else: 
            subject = self.subject
        if "{" in subject:
            subject = frappe.render_template(self.subject, context)

        attachments = self.get_attachment(doc)

        recipients, cc, bcc = self.get_list_of_recipients(doc, context)

        users = recipients + cc + bcc

        if not users:
            return

        notification_doc = {
            "type": "Alert",
            "document_type": get_reference_doctype(doc),
            "document_name": get_reference_name(doc),
            "subject": subject,
            "from_user": doc.modified_by or doc.owner,
            "email_content": frappe.render_template(self.message, context),
            "attached_file": attachments and json.dumps(attachments[0]),
        }
        enqueue_create_notification(users, notification_doc)
