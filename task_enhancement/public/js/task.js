frappe.ui.form.on('Task', {
    refresh: function(frm) {
        // Handle Week Marking field
        if (frm.doc.custom_marked_for_week_of_select_1st_day_of_the_week) {
            if (frm.doc.custom_allow_changing_mark_of_week === 0) {
                frm.set_df_property('custom_marked_for_week_of_select_1st_day_of_the_week', 'read_only', 1);
            }
        } else {
            frm.set_df_property('custom_marked_for_week_of_select_1st_day_of_the_week', 'read_only', 0);
            frm.doc.custom_allow_changing_mark_of_week = 1;
        }

        // Handle Expected Start Date field
        if (frm.doc.exp_start_date) {
            if (frm.doc.custom_allow_changing_expected_start === 0) {
                frm.set_df_property('exp_start_date', 'read_only', 1);
            }
        } else {
            frm.set_df_property('exp_start_date', 'read_only', 0);
            frm.doc.custom_allow_changing_expected_start = 1;
        }

        // Handle Expected End Date field
        if (frm.doc.exp_end_date) {
            if (frm.doc.custom_allow_changing_expected_end === 0) {
                frm.set_df_property('exp_end_date', 'read_only', 1);
            }
        } else {
            frm.set_df_property('exp_end_date', 'read_only', 0);
            frm.doc.custom_allow_changing_expected_end = 1;
        }
    },
    custom_allow_changing_mark_of_week: function(frm) {
        if (frm.doc.custom_allow_changing_mark_of_week === 0) {
            frm.set_df_property('custom_marked_for_week_of_select_1st_day_of_the_week', 'read_only', 1);
        } else if (frm.doc.custom_allow_changing_mark_of_week === 1) {
            frm.set_df_property('custom_marked_for_week_of_select_1st_day_of_the_week', 'read_only', 0);
            frm.doc.custom_marked_for_week_of_select_1st_day_of_the_week = null;
            frm.refresh_field('custom_marked_for_week_of_select_1st_day_of_the_week');
        }
    },

    custom_allow_changing_expected_start: function(frm) {
        if (frm.doc.custom_allow_changing_expected_start === 0) {
            frm.set_df_property('exp_start_date', 'read_only', 1);
        } else if (frm.doc.custom_allow_changing_expected_start === 1) {
            frm.set_df_property('exp_start_date', 'read_only', 0);
            frm.doc.exp_start_date = null;
            frm.refresh_field('exp_start_date');
        }
    },

    custom_allow_changing_expected_end: function(frm) {
        if (frm.doc.custom_allow_changing_expected_end === 0) {
            frm.set_df_property('exp_end_date', 'read_only', 1);
        } else if (frm.doc.custom_allow_changing_expected_end === 1) {
            frm.set_df_property('exp_end_date', 'read_only', 0);
            frm.doc.exp_end_date = null;
            frm.refresh_field('exp_end_date');
        }
    }
});
