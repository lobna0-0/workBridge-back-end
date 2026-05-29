const express = require('express'); 
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const {allowRoles} = require('../middleWare/role.middleware');
const {authMW} = require('../middleWare/auth.middleware');

// create report
router.post('/',authMW,allowRoles('client', 'freelancer'), reportsController.createReport);
// get all reports
router.get('/',authMW,allowRoles('admin'), reportsController.getAllReports);
// get report by id
router.get('/:id',authMW,allowRoles('admin'), reportsController.getReportById);
// update report
router.put('/:id',authMW,allowRoles('admin'), reportsController.updateReport);
// delete report
router.delete('/:id',authMW,allowRoles('admin'), reportsController.deleteReport);

module.exports = router;