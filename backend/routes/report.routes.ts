import { Router } from 'express';
import {
  uploadReport,
  getUserReports,
  getReport,
  generateInsights,
  getTrendData,
  deleteReport
} from '../controller/report.controller';

const router = Router();

// Upload and process report
router.post('/upload', uploadReport);//

// Get trend data (more specific route first)
router.get('/user/:userId/trends', getTrendData);//

// Get user reports (less specific route second)
router.get('/user/:userId', getUserReports);//

// Generate AI insights
router.get('/:reportId/insights', generateInsights);//

// Get single report
router.get('/:reportId', getReport);//

// Delete report
router.delete('/:reportId', deleteReport);

export default router;