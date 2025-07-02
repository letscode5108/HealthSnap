# ReportFlow 🏥

AI-Powered Medical Report Analysis Platform

Transform your medical reports into actionable insights with cutting-edge AI technology. Upload PDFs or images and get instant parameter extraction, trend analysis, and personalized health recommendations.

![ReportFlow Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=ReportFlow+Dashboard)

## ✨ Features

### Core Functionality
- 📄 **Universal Upload**: Support for both PDF and image formats
- 🤖 **AI-Powered Extraction**: Google Gemini AI for intelligent parameter recognition
- 📊 **Interactive Tables**: Clean, sortable data display with status indicators
- 📈 **Trend Analysis**: Visual charts showing parameter progression over time
- 🔒 **Secure Storage**: Cloudinary integration for safe file management


## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive data visualization

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe server development
- **Prisma ORM** - Database toolkit
- **JWT** - Authentication tokens

### Database & Services
- **Neon PostgreSQL** - Serverless database
- **Google Gemini AI** - Advanced AI processing
- **Cloudinary** - Cloud storage and optimization

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/reportflow.git
cd reportflow

# Install backend dependencies
cd backend
npm install

# Environment variables
cp .env.example .env
```


```bash
# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# Start backend server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend
npm install

# Environment variables
cp .env.example .env.local
```

Configure your `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
# Start frontend development server
npm run dev
```

## 🏗️ Project Structure

```
reportflow/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── report.controller.ts
│   │   ├── routes/
│   │   ├── services/
│   │   │   └── cloudinaryService.ts
│   │   ├── middleware/
│   │   └── prisma/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   └── package.json
└── README.md
```



## 🎯 Key Features Explained

### AI-Powered Parameter Extraction
The system uses Google Gemini AI to intelligently extract medical parameters from reports:
- Recognizes parameter names, values, and units
- Determines normal ranges and status
- Categorizes parameters (lipid profile, blood sugar, etc.)
- Assesses risk levels (LOW, BORDERLINE, HIGH, CRITICAL)

### Optimized File Processing
- Supports both PDF and image formats
- Secure upload to Cloudinary with automatic optimization
- Error handling with automatic cleanup on failure
- Base64 encoding for AI processing

### Trend Analysis
- Historical data visualization with interactive charts
- Parameter-specific trend tracking
- Date-based filtering and comparison
- Mock data support for demonstration

### Security & Performance
- JWT-based authentication
- Secure file handling and storage
- Input validation and sanitization
- Optimized database queries with Prisma

## 🔐 Security Features

- **Authentication**: JWT tokens with secure secret
- **File Upload**: Cloudinary secure upload with validation
- **Database**: Parameterized queries via Prisma ORM
- **Environment**: Sensitive data in environment variables
- **CORS**: Configured for frontend domain only

## 🚦 Getting Started

1. **Sign Up**: Create your account with email/password
2. **Upload Report**: Drag and drop your PDF or image medical report
3. **View Results**: See extracted parameters in an organized table
4. **Analyze Trends**: Compare parameters across multiple reports
5. **Get Insights**: Click "AI Insights" for personalized recommendations




## 🙏 Acknowledgments

- Google Gemini AI for intelligent text processing
- Cloudinary for secure file storage
- Neon for serverless PostgreSQL
- The open-source community for amazing tools
