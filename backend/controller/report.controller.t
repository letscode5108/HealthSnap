import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cloudinaryService } from '../service/cloudinaryService';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ExtractedParameter {
  name: string;
  value: string;
  unit?: string;
  normal_range?: string;
  status: 'NORMAL' | 'ABNORMAL' | 'BORDERLINE' | 'CRITICAL';
  category?: string;
  risk_level: 'LOW' | 'BORDERLINE' | 'HIGH' | 'CRITICAL';
}

interface GeminiResponse {
  parameters: ExtractedParameter[];
  report_date: string;
  lab_name?: string;
}

// Function to clean and parse JSON from Gemini response
function parseGeminiJSON(responseText: string): any {
  try {
    // First, try parsing directly
    return JSON.parse(responseText);
  } catch (error) {
    // If direct parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    
    // If no code blocks found, try to find JSON-like content
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonContent = responseText.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonContent);
    }
    
    throw new Error('Could not extract valid JSON from response');
  }
}

export const reportController = {
  // Upload and process report
  uploadReport: async (req: Request, res: Response) => {
    let cloudinaryPublicId: string | null = null;
    
    try {
      const { userId, fileBuffer, originalFileName, fileType } = req.body;

      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadFile(
        Buffer.from(fileBuffer, 'base64'),
        originalFileName,
        fileType
      );
      
      cloudinaryPublicId = uploadResult.publicId;

      // Create pending report
      const report = await prisma.report.create({
        data: {
          userId,
          reportDate: new Date(),
          originalFileName: uploadResult.originalName,
          fileType,
          fileUrl: uploadResult.url,
          cloudinaryPublicId: uploadResult.publicId,
          processingStatus: 'PROCESSING'
        }
      });

      // Get file as base64 for Gemini
      const base64Data = await cloudinaryService.getFileAsBase64(
        uploadResult.publicId,
        fileType === 'pdf' ? 'raw' : 'image'
      );

      // Process with Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Analyze this medical report and extract all parameters. Return ONLY valid JSON without any markdown formatting or code blocks:

{
  "parameters": [
    {
      "name": "parameter_name",
      "value": "numeric_value",
      "unit": "unit_if_any",
      "normal_range": "normal_range_text",
      "status": "NORMAL|ABNORMAL|BORDERLINE|CRITICAL",
      "category": "category_name",
      "risk_level": "LOW|BORDERLINE|HIGH|CRITICAL"
    }
  ],
  "report_date": "YYYY-MM-DD",
  "lab_name": "lab_name_if_available"
}

Rules:
- Extract ALL numeric parameters
- Determine status based on normal ranges
- Set risk_level: CRITICAL for dangerous values, HIGH for concerning, BORDERLINE for slightly off, LOW for normal
- Categories: lipid_profile, blood_sugar, liver_function, kidney_function, complete_blood_count, etc.
- Return only the JSON object, no explanations or formatting`;

      const result = await model.generateContent([
        { text: prompt },
        { 
          inlineData: { 
            mimeType: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg',
            data: base64Data
          }
        }
      ]);

      const responseText = result.response.text();
      console.log('Raw Gemini response:', responseText); // For debugging
      
      // Parse the response with error handling
      const extractedData: GeminiResponse = parseGeminiJSON(responseText);

      // Validate the extracted data
      if (!extractedData.parameters || !Array.isArray(extractedData.parameters)) {
        throw new Error('Invalid response format: parameters array missing');
      }

      // Save parameters
      const parameters = await Promise.all(
        extractedData.parameters.map(param =>
          prisma.parameter.create({
            data: {
              reportId: report.id,
              name: param.name,
              value: param.value,
              unit: param.unit || null,
              normalRange: param.normal_range || null,
              status: param.status,
              category: param.category || null,
              riskLevel: param.risk_level,
              flagged: param.risk_level === 'HIGH' || param.risk_level === 'CRITICAL'
            }
          })
        )
      );

      // Update report
      await prisma.report.update({
        where: { id: report.id },
        data: {
          processingStatus: 'COMPLETED',
          extractedData: JSON.parse(JSON.stringify(extractedData)),
          reportDate: extractedData.report_date ? new Date(extractedData.report_date) : new Date(),
          labName: extractedData.lab_name || null
        }
      });

      res.json({
        success: true,
        reportId: report.id,
        parametersCount: parameters.length,
        criticalCount: parameters.filter(p => p.riskLevel === 'CRITICAL').length
      });

    } catch (error) {
      console.error('Processing error:', error);
      
      // Clean up Cloudinary file if processing fails
      if (cloudinaryPublicId) {
        try {
          await cloudinaryService.deleteFile(
            cloudinaryPublicId,
            req.body.fileType === 'pdf' ? 'raw' : 'image'
          );
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        error: 'Failed to process report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get user reports
  getUserReports: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const reports = await prisma.report.findMany({
        where: { userId },
        include: {
          parameters: true
        },
        orderBy: { reportDate: 'desc' }
      });

      res.json(reports);
    } catch (error) {
      console.error('Get user reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  },

  // Get single report
  getReport: async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
      
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          parameters: true
        }
      });

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.json(report);
    } catch (error) {
      console.error('Get report error:', error);
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  },

  // Generate AI insights with improved JSON parsing
  generateInsights: async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
      
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: { parameters: true }
      });

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const parametersText = report.parameters.map(p => 
        `${p.name}: ${p.value} ${p.unit || ''} (${p.status}, ${p.riskLevel})`
      ).join('\n');

      const prompt = `Based on these medical parameters, provide concise health insights. Return ONLY valid JSON without markdown formatting:

Parameters:
${parametersText}

Return this JSON structure:
{
  "summary": "brief_summary_2_3_sentences",
  "recommendations": ["tip1", "tip2", "tip3"],
  "risk_assessment": "risk_summary",
  "critical_parameters": ["param_names"]
}

Keep response practical and non-diagnostic. Do not include any markdown formatting or code blocks.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      console.log('Raw insights response:', responseText); // For debugging
      
      const insights = parseGeminiJSON(responseText);

      res.json(insights);
      
    } catch (error) {
      console.error('Generate insights error:', error);
      res.status(500).json({ 
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get trend data
  getTrendData: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { parameter } = req.query;

      const reports = await prisma.report.findMany({
        where: { userId },
        include: {
          parameters: {
            where: parameter ? { name: parameter as string } : undefined
          }
        },
        orderBy: { reportDate: 'asc' }
      });

      const trendData = reports.map(report => ({
        date: report.reportDate.toISOString().split('T')[0],
        reportId: report.id,
        parameters: report.parameters.reduce((acc, param) => {
          acc[param.name] = {
            value: parseFloat(param.value) || 0,
            status: param.status,
            riskLevel: param.riskLevel
          };
          return acc;
        }, {} as Record<string, any>)
      }));

      res.json(trendData);
      
    } catch (error) {
      console.error('Get trend data error:', error);
      res.status(500).json({ error: 'Failed to fetch trend data' });
    }
  },

  // Delete report
  deleteReport: async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
      
      const report = await prisma.report.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      // Delete from Cloudinary
      if (report.cloudinaryPublicId) {
        try {
          await cloudinaryService.deleteFile(
            report.cloudinaryPublicId,
            report.fileType === 'pdf' ? 'raw' : 'image'
          );
        } catch (cloudinaryError) {
          console.error('Cloudinary deletion error:', cloudinaryError);
          // Continue with database deletion even if Cloudinary fails
        }
      }

      // Delete from database (cascades to parameters)
      await prisma.report.delete({
        where: { id: reportId }
      });

      res.json({ success: true });
      
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ error: 'Failed to delete report' });
    }
  }
};