
function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
frappe.query_reports["Task Analysis"] = {
    "filters": [
        {
            fieldname: "project",
            label: __("Project"),
            fieldtype: "Link",
            options: "Project"
        },
        {
            fieldname: "task",
            label: __("Task"),
            fieldtype: "Link",
            options: "Task"
        },
        {
            fieldname: "custom_marked_for_week_of_select_1st_day_of_the_week",
            label: __("Marked for week of"),
            fieldtype: "Date",
            description: "Select first day of week"
        },
        {
            fieldname: "task_owner",
            label: __("Task Owner"),
            fieldtype: "Link",
            options: "User",
        },
        {
            fieldname: "show_completed_tasks",
            label: __("Show Completed Tasks"),
            fieldtype: "Check",
        }
    ],

    
    onload: function(report) {
        // Add refresh button
        report.page.add_inner_button(__('Refresh'), () => {
            report.refresh();
        });

        // Ensure event handlers are added after page is fully loaded
        $(document).ready(function() {
            // Remove existing event handlers
            $(document)
                .off('click', '.edit-task-btn')
                .off('click', '.copy-task-btn')
                .off('click', '.delete-task-btn')
                .off('click', '.add-subtask-btn')
                .off('click', '.goto-task-btn');

            // Add new event handlers using document-level delegation
            $(document).on('click', '.edit-task-btn', function(e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let taskDataEncoded = $(this).attr('data-task');
                    if (!taskDataEncoded) {
                        console.error('No task data found');
                        return;
                    }
                    let taskData = JSON.parse(decodeURIComponent(taskDataEncoded));
                    
                    showEditDialog(taskData, report);
                } catch (error) {
                    console.error('Error in edit task handler:', error);
                }
            });

            $(document).on('click', '.copy-task-btn', function(e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let taskDataEncoded = $(this).attr('data-task');
                    if (!taskDataEncoded) {
                        console.error('No task data found');
                        return;
                    }
                    
                    let taskData = JSON.parse(decodeURIComponent(taskDataEncoded));
                    
                    showCopyDialog(taskData, report);
                } catch (error) {
                    console.error('Error in copy task handler:', error);
                }
            });

            $(document).on('click', '.delete-task-btn', function(e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let taskDataEncoded = $(this).attr('data-task');
                    if (!taskDataEncoded) {
                        console.error('No task data found');
                        return;
                    }
                    
                    let taskData = JSON.parse(decodeURIComponent(taskDataEncoded));
                    
                    showDeleteDialog(taskData, report);
                } catch (error) {
                    console.error('Error in delete task handler:', error);
                }
            });

            $(document).on('click', '.add-subtask-btn', function(e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let taskDataEncoded = $(this).attr('data-task');
                    if (!taskDataEncoded) {
                        console.error('No task data found');
                        return;
                    }
                    
                    let taskData = JSON.parse(decodeURIComponent(taskDataEncoded));
                    showTaskDialog(taskData, report);
                } catch (error) {
                    console.error('Error in add subtask handler:', error);
                }
            });

            $(document).on('click', '.goto-task-btn', function(e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let taskId = $(this).attr('data-task-id');
                    if (taskId) {
                        window.open(`/app/task/${taskId}`, '_blank');
                    } else {
                        console.error('No task ID found');
                    }
                } catch (error) {
                    console.error('Error in go to task handler:', error);
                }
            });
        });
        $(document).on('click', '.copy-project-btn', function(e) {
            try {
                e.preventDefault();
                e.stopPropagation();
                
                let projectDataEncoded = $(this).attr('data-project')  // Changed from 'task' to 'data-project'
                if (!projectDataEncoded) {
                    return;
                }
                
                let projectData = JSON.parse(decodeURIComponent(projectDataEncoded));
                
                showCopyProjectDialog(projectData, report);
            } catch (error) {
                console.error('Error in copy project handler:', error);
            }
        });
    },

    "formatter": function(value, row, column, data, default_formatter) {
        if (column.fieldname === "edit_task" && !data.is_project) {
            // Create a copy of data and remove progress field
            const dataWithoutProgress = {...data};
            delete dataWithoutProgress.progress;
            delete dataWithoutProgress.status_show;

            // Safely handle potential undefined or null values
            const safeTaskData = JSON.stringify({
                task_id: dataWithoutProgress.task_id || '',
                task: dataWithoutProgress.task ? dataWithoutProgress.task.toString().trim().split(' - <span')[0].trim() : '',
                description: dataWithoutProgress.description ? dataWithoutProgress.description.toString().trim() : '',
                // Add other relevant fields as needed
                ...dataWithoutProgress
            });

            return `
                <div class="btn-group">
                    <button class="btn btn-xs btn-primary goto-task-btn" 
                        data-task-id='${dataWithoutProgress.task_id || ''}'>
                        <i class="fa fa-external-link"></i>
                    </button>
                    <button class="btn btn-xs btn-warning edit-task-btn" 
                        data-task='${htmlEscape(encodeURIComponent(safeTaskData))}'>
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="btn btn-xs btn-info copy-task-btn" 
                        data-task='${htmlEscape(encodeURIComponent(safeTaskData))}'>
                        <i class="fa fa-copy"></i>
                    </button>
                    <button class="btn btn-xs btn-danger delete-task-btn" 
                        data-task='${htmlEscape(encodeURIComponent(safeTaskData))}'>
                        <i class="fa fa-trash"></i>
                    </button>
                    <button class="btn btn-xs btn-success add-subtask-btn" 
                        data-task='${htmlEscape(encodeURIComponent(safeTaskData))}'>
                        <i class="fa fa-plus"></i>
                    </button>
                </div>`;
        }
        if (column.fieldname === "edit_task" && data && data.is_project && !data.task_id) {
            // Safely handle potential undefined or null values
            const safeProjectData = JSON.stringify({
                project: data.project_id || '',
            });
            return `
                <div class="btn-group">
                    <button class="btn btn-xs btn-info copy-project-btn" 
                        data-project='${htmlEscape(encodeURIComponent(safeProjectData))}'>
                        <i class="fa fa-copy"></i> Copy All Tasks
                    </button>
                </div>`;
        }
        return default_formatter(value, row, column, data);
    }
}

// Function to show edit dialog
function showEditDialog(taskData, report) {
    // Create a copy of taskData and remove progress field
    const taskDataWithoutProgress = {...taskData};
    delete taskDataWithoutProgress.progress;
    delete taskDataWithoutProgress.status_show;


    let d = new frappe.ui.Dialog({
        title: __('Edit Task'),
        fields: [
            {
                label: __('Task Name'),
                fieldname: 'task',
                fieldtype: 'Data',
                read_only: 1,
                default: taskDataWithoutProgress.task.trim()
            },
            {
                label: __('Task Owner'),
                fieldname: 'task_owner',
                fieldtype: 'Link',
                options: 'User',
                default: taskDataWithoutProgress.task_owner
            },
            {
                label: __('Status'),
                fieldname: 'status',
                fieldtype: 'Select',
                read_only:1,
                options: 'Open\nPlanned\nScheduled\nCompleted\nCancelled\nIn-Progress\nWorking\nPending Review\nUnplanned\nRequest For Cancel\nUnplanned',
                default: taskDataWithoutProgress.status || "Unplanned"
            },
            {
                label: __('Priority'),
                fieldname: 'priority',
                fieldtype: 'Select',
                options: 'Low\nMedium\nHigh',
                default: taskDataWithoutProgress.priority
            },
            {
                label: __('Expected Start Date'),
                fieldname: 'exp_start_date',
                fieldtype: 'Date',
                read_only: !!taskDataWithoutProgress.exp_start_date,
                default: taskDataWithoutProgress.exp_start_date
            },
            {
                label: __('Expected End Date'),
                fieldname: 'exp_end_date',
                fieldtype: 'Date',
                read_only: !!taskDataWithoutProgress.exp_end_date,
                default: taskDataWithoutProgress.exp_end_date
            },
            {
                label: __('Marked For Week'),
                fieldname: 'custom_marked_for_week_of_select_1st_day_of_the_week',
                fieldtype: 'Date',
                read_only: !!taskDataWithoutProgress.custom_marked_for_week_of_select_1st_day_of_the_week,
                default: taskDataWithoutProgress.custom_marked_for_week_of_select_1st_day_of_the_week
            },
            {
                label: __('Description'),
                fieldname: 'description',
                fieldtype: 'Text Editor',
                default: taskDataWithoutProgress.description
            }
        ],
        primary_action_label: __('Update Task'),
        secondary_action_label: taskDataWithoutProgress.is_group ? __('Update All Child Tasks') : null,
        
        primary_action: function() {
            updateTask(d, taskDataWithoutProgress, report, 'single');
        }
    });

    // Add secondary action for parent tasks
    if (taskDataWithoutProgress.is_group) {
        d.set_secondary_action(() => {
            updateTask(d, taskDataWithoutProgress, report, 'all');
        });
    }

    d.show();
}

// Function to show copy dialog
function showCopyDialog(taskData, report) {
    // Create a copy of taskData and remove progress field
    const taskDataWithoutProgress = {...taskData};
    delete taskDataWithoutProgress.progress;
    delete taskDataWithoutProgress.status_show;

    let d = new frappe.ui.Dialog({
        title: __('Copy Task Hierarchy'),
        fields: [
            {
                label: __('Original Task'),
                fieldname: 'task',
                fieldtype: 'Data',
                read_only: 1,
                default: taskDataWithoutProgress.task.trim()
            },
            {
                label: __('New Project'),
                fieldname: 'new_project',
                fieldtype: 'Link',
                options: 'Project',
                description: __('Leave empty to copy without project assignment')
            },
            {
                label: __('New Task Owner'),
                fieldname: 'new_task_owner',
                fieldtype: 'Link',
                options: 'User',
                description: __('Leave empty to keep original task owners')
            },
            {
                fieldname: 'copy_info',
                fieldtype: 'HTML',
                options: `
                    <div class="alert alert-info">
                        <p><strong>${__('Note')}:</strong></p>
                        <ul>
                            <li>${__('This will copy the entire task hierarchy including:')}</li>
                            <li>${__('- All child tasks')}</li>
                            <li>${__('- Descriptions')}</li>
                            <li>${__('- Attachments')}</li>
                            ${!taskDataWithoutProgress.is_project ? 
                                `<li>${__('If no project is selected, the project name will be included in the task subject')}</li>` 
                                : ''}
                        </ul>
                    </div>`
            }
        ],
        primary_action_label: __('Copy'),
        primary_action: function() {
            copyTaskHierarchy(d, taskDataWithoutProgress, report);
        }
    });

    d.show();
}

function showCopyProjectDialog(projectData, report) {
    let d = new frappe.ui.Dialog({
        title: __('Copy Project Tasks'),
        fields: [
            {
                label: __('Original Project'),
                fieldname: 'original_project',
                fieldtype: 'Data',
                read_only: 1,
                default: projectData.project
            },
            {
                label: __('New Project Name'),
                fieldname: 'new_project_name',
                fieldtype: 'Link',
                options: 'Project',
                reqd: 1,
                description: __('Name of the new project to copy tasks to')
            },
            {
                label: __('New Task Owner'),
                fieldname: 'new_task_owner',
                fieldtype: 'Link',
                options: 'User',
                description: __('Leave empty to keep original task owners')
            },
            {
                fieldname: 'copy_info',
                fieldtype: 'HTML',
                options: `
                    <div class="alert alert-info">
                        <p><strong>${__('Note')}:</strong></p>
                        <ul>
                            <li>${__('This will copy all tasks from the current project')}</li>
                            <li>${__('- All task details will be copied')}</li>
                            <li>${__('- Attachments and descriptions will be preserved')}</li>
                            <li>${__('- Task owners can be optionally changed')}</li>
                        </ul>
                    </div>`
            }
        ],
        primary_action_label: __('Copy Project Tasks'),
        primary_action: function() {
            copyProjectTasks(d, projectData, report);
        }
    });

    d.show();
}

// Function to handle project tasks copying
function copyProjectTasks(dialog, projectData, report) {
    let values = dialog.get_values();
    if (!values.new_project_name) {
        frappe.throw(__('Please provide a name for the new project'));
        return;
    }

    frappe.call({
        method: 'task_enhancement.task_enhancement.report.task_analysis.task_analysis.copy_project_tasks',
        args: {
            original_project: values.original_project,
            new_project_name: values.new_project_name,
            new_task_owner: values.new_task_owner
        },
        freeze: true,
        freeze_message: __('Copying Project Tasks...'),
        callback: function(r) {
            if (!r.exc) {
                frappe.show_alert({
                    message: __('Project tasks copied successfully'),
                    indicator: 'green'
                });
                dialog.hide();
                report.refresh();
            } else {
                frappe.msgprint({
                    title: __('Error'),
                    indicator: 'red',
                    message: r.exc
                });
            }
        }
    });
}

// Function to show delete dialog
function showDeleteDialog(taskData, report) {
    // Create a copy of taskData and remove progress field
    const taskDataWithoutProgress = {...taskData};
    delete taskDataWithoutProgress.progress;
    delete taskDataWithoutProgress.status_show;

    let d = new frappe.ui.Dialog({
        title: __('Delete Task'),
        fields: [
            {
                label: __('Task Name'),
                fieldname: 'task',
                fieldtype: 'Data',
                read_only: 1,
                default: taskDataWithoutProgress.task.trim()
            },
            {
                label: __('Delete Mode'),
                fieldname: 'delete_mode',
                fieldtype: 'Select',
                options: [
                    {label: __('Delete Single Task'), value: 'single'},
                    {label: __('Delete Task with Children'), value: 'all'}
                ],
                default: 'single',
                depends_on: `eval:${taskDataWithoutProgress.is_group}`,
                mandatory: 1
            },
            {
                fieldname: 'warning',
                fieldtype: 'HTML',
                options: `
                    <div class="alert alert-warning">
                        <p><strong>${__('Warning')}:</strong> ${__('This action cannot be undone.')}</p>
                        ${taskDataWithoutProgress.is_group ? 
                            `<p>${__('This task has child tasks. Selecting "Delete Task with Children" will delete all child tasks as well.')}</p>` 
                            : ''}
                    </div>`
            },
            {
                label: __('Confirmation'),
                fieldname: 'confirmation',
                fieldtype: 'Check',
                label: __('I understand this action cannot be undone'),
                reqd: 1
            }
        ],
        primary_action_label: __('Delete Task'),
        primary_action: function() {
            deleteTask(d, taskDataWithoutProgress, report);
        }
    });

    d.show();
}


// Function to handle task update
function updateTask(dialog, taskData, report, update_mode) {
    let values = dialog.get_values();
    if (!values) return;

    // Validate dates
    if (values.exp_start_date && values.exp_end_date && 
        frappe.datetime.str_to_obj(values.exp_start_date) > frappe.datetime.str_to_obj(values.exp_end_date)) {
        frappe.throw(__("Expected End Date cannot be before Expected Start Date"));
        return;
    }

    frappe.call({
        method: 'task_enhancement.task_enhancement.report.task_analysis.task_analysis.update_task',
        args: {
            task_id: taskData.task_id,
            task_data: values,
            update_mode: update_mode
        },
        freeze: true,
        freeze_message: update_mode === 'single' ? 
            __('Updating Task...') : 
            __('Updating Task and Child Tasks...'),
        callback: function(r) {
            if (!r.exc) {
                frappe.show_alert({
                    message: update_mode === 'single' ? 
                        __('Task updated successfully') : 
                        __('Task and child tasks updated successfully'),
                    indicator: 'green'
                });
                dialog.hide();
                report.refresh();
            } else {
                frappe.msgprint({
                    title: __('Error'),
                    indicator: 'red',
                    message: r.exc
                });
            }
        }
    });
}

// Function to handle task deletion
function deleteTask(dialog, taskData, report) {
    let values = dialog.get_values();
    
    if (!values.confirmation) {
        frappe.throw(__('Please confirm deletion'));
        return;
    }

    frappe.call({
        method: 'task_enhancement.task_enhancement.report.task_analysis.task_analysis.delete_task',
        args: {
            task_data: values,
            delete_mode: values.delete_mode || 'single'
        },
        freeze: true,
        freeze_message: values.delete_mode === 'single' ? 
            __('Deleting Task...') : 
            __('Deleting Task and Child Tasks...'),
        callback: function(r) {
            if (!r.exc) {
                frappe.show_alert({
                    message: values.delete_mode === 'single' ? 
                        __('Task deleted successfully') : 
                        __('Task and child tasks deleted successfully'),
                    indicator: 'green'
                });
                dialog.hide();
                report.refresh();
            } else {
                frappe.msgprint({
                    title: __('Error'),
                    indicator: 'red',
                    message: r.exc
                });
            }
        }
    });
}

// Function to handle task hierarchy copying
function copyTaskHierarchy(dialog, taskData, report) {
    let values = dialog.get_values();
    
    frappe.call({
        method: 'task_enhancement.task_enhancement.report.task_analysis.task_analysis.copy_task_hierarchy',
        args: {
            task_data: taskData,
            new_project: values.new_project,
            new_task_owner: values.new_task_owner
        },
        freeze: true,
        freeze_message: __('Copying Task Hierarchy...'),
        callback: function(r) {
            if (!r.exc) {
                frappe.show_alert({
                    message: __('Task hierarchy copied successfully'),
                    indicator: 'green'
                });
                dialog.hide();
                report.refresh();
                
                // Open the new task in a new tab
                // if (r.message && r.message.new_task_id) {
                //     frappe.set_route('Form', 'Task', r.message.new_task_id);
                // }
            } else {
                frappe.msgprint({
                    title: __('Error'),
                    indicator: 'red',
                    message: r.exc
                });
            }
        }
    });
}

function showTaskDialog(taskData, report) {
    // Initial dialog for selecting task type
    const initialDialog = new frappe.ui.Dialog({
        title: __('Select Task Type'),
        fields: [
            {
                label: __('Task Type'),
                fieldname: 'task_type',
                fieldtype: 'Select',
                options: 'Single\nMultiple',
                default: 'Single'
            }
        ],
        primary_action_label: __('Continue'),
        primary_action(values) {
            initialDialog.hide();
            if (values.task_type === 'Single') {
                showSingleTaskDialog();
            } else {
                showMultipleTaskDialog();
            }
        }
    });

    // Dialog for single task
    function showSingleTaskDialog() {
        const singleTaskDialog = new frappe.ui.Dialog({
            title: __('Add Single Task'),
            fields: [
                {
                    label: __('Parent Task'),
                    fieldname: 'parent_task',
                    fieldtype: 'Data',
                    read_only: 1,
                    default: taskData.task_id
                },
                {
                    label: __('Project'),
                    fieldname: 'project',
                    fieldtype: 'Data',
                    read_only: 1,
                    default: taskData.project
                },
                {
                    label: __('Task Subject'),
                    fieldname: 'subject',
                    fieldtype: 'Data',
                    reqd: 1
                },
                {
                    label: __('Task Owner'),
                    fieldname: 'custom_task_owner',
                    fieldtype: 'Link',
                    options: 'User',
                    default: taskData.task_owner
                },
                {
                    label: __('Priority'),
                    fieldname: 'priority',
                    fieldtype: 'Select',
                    options: 'Low\nMedium\nHigh',
                    default: taskData.priority || 'Medium'
                },
                {
                    label: __('Expected Start Date'),
                    fieldname: 'exp_start_date',
                    fieldtype: 'Date',
                },
                {
                    label: __('Expected End Date'),
                    fieldname: 'exp_end_date',
                    fieldtype: 'Date',
                },
                {
                    label: __('Marked For Week'),
                    fieldname: 'custom_marked_for_week_of_select_1st_day_of_the_week',
                    fieldtype: 'Date',
                },
                {
                    label: __('Description'),
                    fieldname: 'description',
                    fieldtype: 'Text Editor'
                }
            ],
            primary_action_label: __('Create Task'),
            primary_action(values) {
                if (validateDates(values)) {
                    createSingleTask(values);
                    singleTaskDialog.hide();
                }
            },
            secondary_action_label: __('Back'),
            secondary_action() {
                singleTaskDialog.hide();
                initialDialog.show();
            }
        });
        singleTaskDialog.show();
    }

    // Dialog for multiple tasks
    function showMultipleTaskDialog() {
        const multipleTaskDialog = new frappe.ui.Dialog({
            title: __('Add Multiple Tasks'),
            fields: [
                {
                    label: __('Parent Task'),
                    fieldname: 'parent_task',
                    fieldtype: 'Data',
                    read_only: 1,
                    default: taskData.task_id
                },
                {
                    label: __('Project'),
                    fieldname: 'project',
                    fieldtype: 'Data',
                    read_only: 1,
                    default: taskData.project
                },
                {
                    fieldname: 'tasks_section',
                    fieldtype: 'Section Break',
                    label: __('Tasks')
                },
                {
                    fieldname: 'tasks',
                    fieldtype: 'Table',
                    label: __('Tasks'),
                    reqd: 1,
                    fields: [
                        {
                            label: __('Subject'),
                            fieldname: 'subject',
                            fieldtype: 'Data',
                            in_list_view: 1,
                            reqd: 1
                        },
                        {
                            label: __('Task Owner'),
                            fieldname: 'custom_task_owner',
                            fieldtype: 'Link',
                            options: 'User',
                            in_list_view: 1,
                            default: taskData.task_owner
                        },
                        {
                            label: __('Priority'),
                            fieldname: 'priority',
                            fieldtype: 'Select',
                            options: 'Low\nMedium\nHigh',
                            in_list_view: 1,
                            default: taskData.priority || 'Medium'
                        },
                        {
                            label: __('Start Date'),
                            fieldname: 'exp_start_date',
                            fieldtype: 'Date',
                            in_list_view: 1
                        },
                        {
                            label: __('End Date'),
                            fieldname: 'exp_end_date',
                            fieldtype: 'Date',
                            in_list_view: 1
                        },
                        {
                            label: __('Marked For Week'),
                            fieldname: 'custom_marked_for_week_of_select_1st_day_of_the_week',
                            fieldtype: 'Date'
                        },
                        {
                            label: __('Description'),
                            fieldname: 'description',
                            fieldtype: 'Small Text'
                        }
                    ]
                }
            ],
            primary_action_label: __('Create Tasks'),
            primary_action(values) {
                if (validateMultipleTasks(values)) {
                    createMultipleTasks(values);
                    multipleTaskDialog.hide();
                }
            },
            secondary_action_label: __('Back'),
            secondary_action() {
                multipleTaskDialog.hide();
                initialDialog.show();
            }
        });
        multipleTaskDialog.show();
    }

    // Validation functions remain the same
    function validateDates(values) {
        if (values.exp_start_date && values.exp_end_date) {
            if (frappe.datetime.str_to_obj(values.exp_start_date) > 
                frappe.datetime.str_to_obj(values.exp_end_date)) {
                frappe.throw(__('End Date cannot be before Start Date'));
                return false;
            }
        }
        return true;
    }

    function validateMultipleTasks(values) {
        if (!values.tasks || !values.tasks.length) {
            frappe.throw(__('Please add at least one task'));
            return false;
        }

        for (let task of values.tasks) {
            if (!task.subject) {
                frappe.throw(__('Subject is required for all tasks'));
                return false;
            }
            if (task.exp_start_date && task.exp_end_date) {
                if (frappe.datetime.str_to_obj(task.exp_start_date) > 
                    frappe.datetime.str_to_obj(task.exp_end_date)) {
                    frappe.throw(__(`End Date cannot be before Start Date for task "${task.subject}"`));
                    return false;
                }
            }
        }
        return true;
    }

    // Task creation functions
    function createSingleTask(values) {
        frappe.call({
            method: 'frappe.client.insert',
            args: {
                doc: {
                    doctype: 'Task',
                    subject: values.subject,
                    parent_task: values.parent_task,
                    project: values.project,
                    custom_task_owner: values.custom_task_owner,
                    priority: values.priority,
                    exp_start_date: values.exp_start_date,
                    exp_end_date: values.exp_end_date,
                    custom_marked_for_week_of_select_1st_day_of_the_week: values.custom_marked_for_week_of_select_1st_day_of_the_week,
                    description: values.description
                }
            },
            callback: function(r) {
                if (!r.exc) {
                    frappe.show_alert({
                        message: __('Task created successfully'),
                        indicator: 'green'
                    });
                    report.refresh();
                }
            }
        });
    }

    function createMultipleTasks(values) {
        let completed = 0;
        const total = values.tasks.length;

        frappe.show_progress(__('Creating Tasks'), completed, total);

        function createNextTask(index) {
            if (index >= values.tasks.length) {
                frappe.hide_progress();
                frappe.show_alert({
                    message: __('All tasks created successfully'),
                    indicator: 'green'
                });
                report.refresh();
                return;
            }

            const task = values.tasks[index];
            frappe.call({
                method: 'frappe.client.insert',
                args: {
                    doc: {
                        doctype: 'Task',
                        subject: task.subject,
                        parent_task: values.parent_task,
                        project: values.project,
                        task: values.task,
                        custom_task_owner: task.custom_task_owner,
                        priority: task.priority,
                        exp_start_date: task.exp_start_date,
                        exp_end_date: task.exp_end_date,
                        custom_marked_for_week_of_select_1st_day_of_the_week: task.custom_marked_for_week_of_select_1st_day_of_the_week,
                        description: task.description
                    }
                },
                callback: function(r) {
                    if (!r.exc) {
                        completed++;
                        frappe.show_progress(__('Creating Tasks'), completed, total);
                        createNextTask(index + 1);
                    }
                }
            });
        }

        createNextTask(0);
    }

    // Show initial dialog
    initialDialog.show();
}