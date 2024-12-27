import frappe
from frappe import _
from frappe.utils import getdate, add_to_date

def before_validate(self,method):
    if not self.is_new():
        self.custom_previous_status = frappe.db.get_value("Task", self.name, "status")
        
    if self.status == "Scheduled" and ((self.exp_start_date == None or self.exp_start_date == "") or (self.exp_end_date == None or self.exp_end_date == "")):
        frappe.throw("Expected Start Date and Expected End Date are required to set this task's status to Scheduled.")
    
    if self.exp_start_date:
        self.custom_allow_changing_expected_start = 0
    
    if self.exp_end_date:
        self.custom_allow_changing_expected_end = 0
        
    if self.status == "Change Pending" and (not self.custom_change_required or self.custom_change_required == "") :
        frappe.throw("Please provide the details of the date change request in the 'Change Required' field after selecting the 'Request Date Change' checkbox.")
        
    if self.status == "Scheduled" and self.custom_previous_status == "Change Pending":
        self.custom_request_date_change = 0
        self.custom_change_required = None
        
    if self.exp_start_date and self.exp_end_date and self.status in ["Unplanned", "Open"]:
        self.db_set("workflow_state","Scheduled")
        self.db_set("status","Scheduled")
        
    if not self.is_new():
        on_update(self,method)
        
def on_update(doc, method):
    """
    Selectively update task group fields when a task is saved
    
    Args:
        doc (Document): Task document being saved
        method (str): Trigger method (before_save, validate, etc.)
    """
    # Skip if this is not a task or if no parent task exists
    if doc.doctype != 'Task' or not doc.parent_task:
        return
    
    try:
        # Update only the parent tasks
        update_parent_tasks(doc.parent_task)
    except Exception as e:
        # Log detailed error for tracking
        frappe.log_error(
            title="Task Hierarchy Update Error", 
            message=f"Error updating task hierarchy for {doc.name}: {str(e)}"
        )
        # Throw a user-friendly error
        frappe.throw(_(f"Could not update task hierarchy: {str(e)}"))

def update_parent_tasks(parent_task):
    """
    Selectively update task group fields for parent tasks in the hierarchy
    
    Args:
        parent_task (str): Name of the parent task to update
    """
    task_doc = frappe.get_doc('Task', parent_task)
    
    # Get all direct child tasks of the current task
    child_tasks = frappe.get_all('Task', 
        filters={'parent_task': parent_task},
        fields=[
            'name', 
            'status', 
            'exp_start_date',
            'exp_end_date',
        ]
    )
    
    # Skip if no child tasks
    if not child_tasks:
        return
    
    # Check if any child task has empty dates
    has_empty_start_date = any(not task.exp_start_date for task in child_tasks)
    has_empty_end_date = any(not task.exp_end_date for task in child_tasks)
    
    # If any child has empty dates, parent should have empty dates and unplanned status
    if has_empty_start_date or has_empty_end_date:
        task_doc.exp_start_date = None
        task_doc.exp_end_date = None
        task_doc.status = 'Unplanned'
    else:
        # Only update dates if all child tasks have dates
        start_dates = [getdate(task.exp_start_date) for task in child_tasks]
        end_dates = [getdate(task.exp_end_date) for task in child_tasks]
        
        # Determine parent status based on child tasks
        status_priority = {
            'Unplanned': 1,
            'Planned': 2,
            'Scheduled': 3,
            'In Progress': 4,
            'Completed': 5,
            'Cancelled': 6,
        }
        
        # Sort child tasks by status priority (lower index means higher priority)
        sorted_child_tasks = sorted(
            child_tasks, 
            key=lambda x: status_priority.get(x.get('status'), 7)
        )
        
        # Update dates
        task_doc.exp_start_date = min(start_dates)
        task_doc.exp_end_date = max(end_dates)
        
        # Update status based on child tasks (use the most critical status)
        if sorted_child_tasks:
            task_doc.status = sorted_child_tasks[0]['status']
    
    # Save the task with minimal checks
    try:
        task_doc.flags.ignore_version = True
        task_doc.flags.ignore_validate = True
        task_doc.save(ignore_permissions=True)
    except Exception as save_error:
        frappe.log_error(
            title="Task Group Save Error", 
            message=f"Could not save task group {task_doc.name}: {str(save_error)}"
        )