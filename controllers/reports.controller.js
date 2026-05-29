const Report = require('../models/reports.model');
const { sendNotification } = require('../service/notifications.service');
const reportSchema = require('../validations/report.validation');

// create report
exports.createReport = async (req, res)=>{
    try {

        // const { error } = reportSchema.validate(req.body);
        
        // if (error) {
        //     return res.status(400).json({
        //         error: error.details[0].message
        //     });
        // }
        

        const { reported_user_id, project_id, reason } = req.body;

        if (req.user.id === reported_user_id) {
            return res.status(400).json({ error: "You cannot report yourself" });
        }

        const report = {
            reporter_id: req.user.id,
            reported_user_id,
            project_id,
            reason
        };
        const newReport = await Report.createReport(report);
        
        // Notify admins of new report
        const supabase = require('../config/supabase');
        const { data: admins } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin');

        if (admins && admins.length > 0) {
            for (const admin of admins) {
                await sendNotification(admin.id, {
                    title: 'New Report Submitted',
                    message: `A new report has been submitted against user ${reported_user_id}`,
                    type: 'admin_report',
                    project_id: project_id || null,
                    event_key: `report_created:${newReport.id}:admin:${admin.id}`
                });
            }
        }

        res.json({
            success: true,
            data: newReport
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating report', error: error.message });
    }
}
// get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.getAllReports();

    res.json({
        success: true,
        data: reports
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// get report by id
exports.getReportById = async (req, res)=>{
    try {
        const id = req.params.id;
        const report = await Report.getReportById(id);
        if (report) {
           res.json({
                success: true,
                data: reports
            });  
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching report', error: error.message });
    }
}
// update report
exports.updateReport = async (req, res)=>{
    try {
        const id = req.params.id;
        const report = req.body;
        const updatedReport = await Report.updateReport(id, report);        
        if (updatedReport) {
            res.json({
                success: true,
                data: updatedReport
            });  
        }else{
            res.status(404).json({ message: 'Report not found' });
        }
    }catch (error) {
        res.status(500).json({ message: 'Error updating report', error: error.message });
    }
}
// delete report
exports.deleteReport = async (req, res)=>{
    try {
        const id = req.params.id;
        const deletedReport = await Report.deleteReport(id);
        if (deletedReport) {
            res.json({
                success: true,
                data: deletedReport
            });  
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting report', error: error.message });
    }
}
