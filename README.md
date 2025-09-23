# 🎓 FISD Counselor Web App

An intelligent AI-powered counselor assistant for Frisco Independent School District (FISD) students, powered by Perplexity AI with real-time web search and PDF document context.

## ✨ Features

- **🤖 AI-Powered Counseling**: Get instant answers to FISD-related questions
- **🌐 Real-Time Web Search**: Access current FISD policies and information via Perplexity AI
- **📄 PDF Document Context**: Upload FISD PDFs for local document analysis
- **💬 Conversational Interface**: Clean, modern chat UI with conversation memory
- **🔗 Smart Follow-ups**: AI-generated suggestion buttons for related questions
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express
- **AI**: Perplexity API (sonar-pro model)
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Perplexity API key

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nithilan45/fisd-counselor.git
cd fisd-counselor
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

**Quick Setup** (Recommended):
```bash
# Run the setup script
chmod +x setup.sh
./setup.sh
```

**Manual Setup**:
```bash
# Create .env file from template
cp env.example .env

# Copy to backend directory (required for dotenv)
cp .env backend/.env

# Edit .env with your API key
nano .env  # or use your preferred editor
```

Edit `.env` and add your Perplexity API key:

```env
# Get your API key from: https://www.perplexity.ai/settings/api
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PORT=8000
NODE_ENV=development
VITE_API_URL=http://localhost:8000
```

**⚠️ Security Note**: Never commit your `.env` file to version control. The `.env` file is already included in `.gitignore` for your protection.

### 4. Add FISD PDFs

Place your FISD PDF documents in the `backend/pdfs/` directory. The system will automatically process them for context.

### 5. Start the Application

```bash
# Start both backend and frontend (recommended)
./start.sh

# Or start them separately:

# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Usage

1. **Open the app**: Navigate to `http://localhost:3000`
2. **Ask questions**: Type any FISD-related question in the chat interface
3. **Use follow-ups**: Click the suggested follow-up buttons that appear after each response
4. **Upload PDFs**: Place FISD PDFs in the `backend/pdfs/` directory for enhanced context

### Example Questions

- "What are the FISD graduation requirements?"
- "How do I choose an endorsement pathway?"
- "What is OCPE and how do I apply?"
- "What AP courses are available at my school?"
- "How do I calculate my GPA?"

## 📁 Project Structure

```
fisd-counselor/
├── backend/
│   ├── routes/
│   │   ├── ask.js          # AI question handling
│   │   └── upload.js       # PDF management
│   ├── shared/
│   │   └── vectorStore.js  # PDF context management
│   ├── pdfs/               # Place FISD PDFs here
│   ├── server.js           # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
├── start.sh                # Start script
├── .gitignore
├── env.example
└── README.md
```

## 🔧 API Endpoints

### Backend API

- `GET /api/health` - Health check
- `GET /api/upload/vector-store` - Check PDF status
- `POST /api/ask` - Ask AI questions

### Request Format

```javascript
POST /api/ask
{
  "question": "What are FISD graduation requirements?",
  "history": [
    {
      "role": "user",
      "type": "user", 
      "content": "Previous question..."
    }
  ]
}
```

## 🎨 Customization

### Adding New Features

1. **Backend**: Add new routes in `backend/routes/`
2. **Frontend**: Add new components in `frontend/src/components/`
3. **Styling**: Modify Tailwind classes or add custom CSS

### Environment Variables

- `PERPLEXITY_API_KEY`: Your Perplexity API key
- `PORT`: Backend server port (default: 8000)
- `NODE_ENV`: Environment (development/production)

## 🚀 Deployment

### Vercel (Recommended)

1. **Deploy Backend**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy backend
   cd backend
   vercel --prod
   ```

2. **Deploy Frontend**:
   ```bash
   # Deploy frontend
   cd frontend
   vercel --prod
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `PERPLEXITY_API_KEY` with your API key
   - Add `NODE_ENV=production`

### Render

1. **Connect Repository**: Connect your GitHub repo to Render
2. **Set Environment Variables**:
   - `PERPLEXITY_API_KEY`: Your Perplexity API key
   - `NODE_ENV`: production
3. **Deploy**: Render will automatically deploy using `render.yaml`

### Using PM2 (VPS/Server)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start start.sh --name fisd-counselor

# Save PM2 configuration
pm2 save
pm2 startup
```

### Manual Deployment

1. Set `NODE_ENV=production` in your environment
2. Build the frontend: `cd frontend && npm run build`
3. Serve the built files with a web server
4. Run the backend with a process manager

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

## 🙏 Acknowledgments

- [Perplexity AI](https://perplexity.ai/) for the AI capabilities
- [Frisco Independent School District](https://www.friscoisd.org/) for the educational context
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [React](https://reactjs.org/) for the frontend framework

---

**Made with ❤️ for FISD students and counselors**
