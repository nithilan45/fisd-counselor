# 📁 How to Upload FISD PDFs

## Simple Process:

1. **Start the Application:**
   ```bash
   ./start.sh
   ```

2. **Open the Web Interface:**
   - Go to http://localhost:3000

3. **Upload PDFs:**
   - **Method 1 (Recommended)**: Drop your FISD PDF files into this folder:
     ```
     /Users/nithilan/AiCounselor2.0/pdfs-to-upload/
     ```
   - **Method 2**: Use the "Process PDFs Now" button in the web interface

4. **The System Will Automatically:**
   - Detect new PDF files
   - Store them for context integration
   - Process them for AI analysis with Perplexity API
   - Move them to the processed folder
   - Make them available for Q&A with web search

## What Happens Behind the Scenes:

1. **File Detection**: The system watches the `pdfs-to-upload` folder
2. **File Storage**: PDFs are stored locally for context integration
3. **Perplexity Integration**: Files are made available for AI context with web search
4. **Processing**: Files are moved to `backend/pdfs` folder
5. **Ready**: You can now ask questions with real-time web search and PDF context

## Recommended FISD PDFs:

- Course catalogs
- Academic policies  
- Counseling handbooks
- Graduation requirements
- Student handbooks
- Academic planning guides

## Troubleshooting:

- **PDFs not processing?** Click "Process PDFs Now" in the web interface
- **Can't find the folder?** The web interface shows the exact path
- **Still having issues?** Check the backend console for error messages

## File Locations:

- **Input Folder**: `/Users/nithilan/AiCounselor2.0/pdfs-to-upload/` (drop PDFs here)
- **Processed Folder**: `/Users/nithilan/AiCounselor2.0/backend/pdfs/` (processed PDFs)
- **Web Interface**: http://localhost:3000 (view status and ask questions)
