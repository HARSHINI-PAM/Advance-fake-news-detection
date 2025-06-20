# NEWS-FILTER

> **Advanced Fake News Detection & Verification System**

A modern, multi-modal AI platform for detecting fake news, verifying sources, and analyzing media in real time. **NEWS-FILTER** leverages advanced NLP, deep learning, and fact-checking APIs to help users identify misinformation and manipulated content.

---

## 🚀 Features

- **Text Analysis**: Detects fake news using transformer models, sentiment analysis, and fact-checking.
- **Media Analysis**: Identifies manipulated images, deepfakes, and altered multimedia content.
- **Source Verification**: Evaluates the credibility of news sources and cross-references with trusted databases.
- **Real-Time Monitoring**: Continuously scans trending content and provides instant misinformation alerts.
- **Modern UI**: Built with React, Tailwind CSS, and shadcn-ui for a fast, beautiful user experience.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui  
- **Backend**: Node.js, Express, TypeScript, @tensorflow/tfjs, Universal Sentence Encoder, Natural, Sharp  
- **AI/ML**: Transformer models, Universal Sentence Encoder, custom rule-based logic  
- **APIs**: Google Fact Check Tools API  

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Maruthi0302/News-Filter.git
cd News-Filter

2. Install Dependencies
bash
Copy
Edit
npm install
cd backend && npm install
3. Environment Setup (Backend)
Get a Google Fact Check API key: Google Fact Check API Guide

Create a .env file in the backend directory:

env
Copy
Edit
FACT_CHECK_API_KEY="YOUR_API_KEY_HERE"
4. Run the Application
Start Backend
bash
Copy
Edit
cd backend
npm run build
npm start
Start Frontend
bash
Copy
Edit
cd ..
npm run dev
Frontend: http://localhost:5173

Backend API: http://localhost:3000

🧠 API Endpoints
Text Analysis
http
Copy
Edit
POST /api/analyze/text
Body:

json
Copy
Edit
{
  "text": "string",
  "title": "string (optional)",
  "source": "string (optional)"
}
Response:
AI prediction, confidence, reasoning, suspicious indicators, fact-check results

Media Analysis
http
Copy
Edit
POST /api/media/analyze/image
Content-Type: multipart/form-data

Field: image

http
Copy
Edit
POST /api/media/analyze/video
Content-Type: multipart/form-data

Field: video

Health Check
http
Copy
Edit
GET /health
🖥️ Project Structure
csharp
Copy
Edit
News-Filter/
├── backend/         # Express + AI/ML backend
├── src/             # Frontend (React, Vite)
├── public/          # Static assets
└── README.md        # Project documentation
🤝 Contributing
Fork the repo

Create your feature branch: git checkout -b feature/your-feature

Commit your changes: git commit -am 'Add new feature'

Push to the branch: git push origin feature/your-feature

Open a Pull Request

📄 License
This project is licensed under the MIT License.

🙏 Acknowledgements
Google Fact Check Tools API

TensorFlow.js

Universal Sentence Encoder

shadcn/ui

Tailwind CSS

