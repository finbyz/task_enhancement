app_name = "task_enhancement"
app_title = "Task Enhancement"
app_publisher = "Accurate Systems"
app_description = "Making Task Enhancement easier"
app_email = "info@accuratesystems.com.sa"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "task_enhancement",
# 		"logo": "/assets/task_enhancement/logo.png",
# 		"title": "Task Enhancement",
# 		"route": "/task_enhancement",
# 		"has_permission": "task_enhancement.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------
# Override Notification Doctype for task escalation functionality
override_doctype_class = {
	"Notification": "task_enhancement.task_enhancement.override_doctype_class.notification.Notification",
}
# include js, css files in header of desk.html
# app_include_css = "/assets/task_enhancement/css/task_enhancement.css"

# include js, css files in header of web template
# web_include_css = "/assets/task_enhancement/css/task_enhancement.css"
# web_include_js = "/assets/task_enhancement/js/task_enhancement.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "task_enhancement/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {"Task" : "public/js/task.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "task_enhancement/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "task_enhancement.utils.jinja_methods",
# 	"filters": "task_enhancement.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "task_enhancement.install.before_install"
# after_install = "task_enhancement.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "task_enhancement.uninstall.before_uninstall"
# after_uninstall = "task_enhancement.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "task_enhancement.utils.before_app_install"
# after_app_install = "task_enhancement.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "task_enhancement.utils.before_app_uninstall"
# after_app_uninstall = "task_enhancement.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "task_enhancement.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"Task": {
		"before_validate": "task_enhancement.task_enhancement.doc_events.task.before_validate",
	}
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"task_enhancement.tasks.all"
# 	],
# 	"daily": [
# 		"task_enhancement.tasks.daily"
# 	],
# 	"hourly": [
# 		"task_enhancement.tasks.hourly"
# 	],
# 	"weekly": [
# 		"task_enhancement.tasks.weekly"
# 	],
# 	"monthly": [
# 		"task_enhancement.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "task_enhancement.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "task_enhancement.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "task_enhancement.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["task_enhancement.utils.before_request"]
# after_request = ["task_enhancement.utils.after_request"]

# Job Events
# ----------
# before_job = ["task_enhancement.utils.before_job"]
# after_job = ["task_enhancement.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"task_enhancement.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

fixtures = [
    {"dt": "Custom Field", "filters": [["module", "in", "Task Enhancement"]]},
    {"dt": "Property Setter", "filters": [["module", "in", ["Task Enhancement"]]]},
]
