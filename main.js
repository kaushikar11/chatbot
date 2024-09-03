import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";

// Initialize the model
const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [{
    role: "user",
    parts: [
      {text: "I ll upload a pdf/text/docx/excel/latex you have to extract the data from the file and understand the contained data . I need a summary of the file in understandable format and be able to chat about the file. Give answers about the file based on my prompts."},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "I understand! I can definitely help you with that. \n\nPlease upload your file, and I will:\n\n1. **Extract the data:** I'll analyze the file format and extract the relevant information. \n2. **Understand the data:** I'll identify the key elements, relationships, and patterns within the data.\n3. **Summarize the file:** I'll provide a concise and understandable summary of the file's contents.\n4. **Answer your prompts:** I'll be able to answer your questions about the file based on the information I extracted.\n\n**To ensure the best results, please provide me with any context you have about the file, such as:**\n\n* **The purpose of the file:** What is it about?\n* **The intended audience:** Who is this file for?\n* **Specific questions you have about the file:** What are you looking to find out?\n\nI'm ready to analyze your file and provide you with insightful information! \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "if i upload finance doc i needs to get summary of it and insights about the data and feature to chat with it to extract information in proper format"},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "Okay, I'm ready to analyze your finance document. Here's what I can do:\n\n**Data Extraction and Analysis**\n\n* **Identify key financial metrics:** I can extract key financial metrics like revenue, expenses, profit margin, return on investment (ROI), cash flow, debt-to-equity ratio, etc. \n* **Analyze trends:** I can look for trends in the data over time, like growth or decline in revenue, changes in expenses, and shifts in profitability.\n* **Identify outliers:** I can help you identify unusual data points or anomalies that may warrant further investigation.\n* **Generate charts and graphs:** I can create visualizations of the data to help you understand the information more easily.\n\n**Summary and Insights**\n\n* **Provide a concise summary of the document:** I'll highlight the most important findings and insights from the financial data. \n* **Identify key takeaways:** I'll help you understand the implications of the data, such as the company's financial health, performance, and potential risks.\n* **Offer suggestions:** Based on the analysis, I can offer suggestions for improvement or areas where further investigation might be helpful.\n\n**Chat Interface**\n\n* **Natural language questions and answers:** You can ask me questions about the document in plain language, and I'll provide relevant answers based on the extracted data. \n* **Specific data requests:** I can help you extract specific data points, like revenue for a specific period or expenses for a particular department.\n* **Comparative analysis:**  You can compare financial data across different periods, departments, or companies. \n\n**To get the most out of our interaction, please tell me:**\n\n* **The type of finance document:** Is it a balance sheet, income statement, cash flow statement, budget, financial report, or something else?\n* **The company or organization:** Who does this document pertain to? \n* **Your specific goals:** What are you hoping to find out from the document?\n\nI'm excited to analyze your finance document and help you gain valuable insights! \n"},
    ],
  },];

// Function to handle file uploads
async function handleFileUpload(file) {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
        reader.onload = (event) => {
            // Read file content
            const fileContent = event.target.result;
            resolve(fileContent);
        };
        reader.onerror = (error) => reject(error);

        reader.readAsText(file); // Assuming the file is text-based. Adjust as needed.
    });
}

// Function to get AI response
async function getResponse(prompt) {
    const chat = await model.startChat({ history: history });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(text);
    return text;
}

// User chat div
export const userDiv = (data) => {
    return `
    <!-- User Chat -->
            <div class="flex items-center gap-2 justify-start m-2">
                <img src="face.svg" alt="user icon" class="w-10 h-10 rounded-full"/>
                <div class="bg-gemDeep text-white p-1 rounded-md shadow-md mx-2">${data}</div>
            </div>
    `;
};

// AI Chat div
export const aiDiv = (data) => {
    return `
    <!-- AI Chat -->
            <div class="flex gap-2 justify-end m-2">
                <div class="bg-gemDeep text-white p-1 rounded-md shadow-md mx-2">${data}</div>
                <img src="legaldad.png" alt="bot icon" class="w-10 h-10 rounded-full"/>
            </div>
    `;
};

async function handleSubmit(event) {
    event.preventDefault();

    const userMessage = document.getElementById("prompt");
    const fileInput = document.getElementById("file-input");
    const chatArea = document.getElementById("chat-container");

    let prompt = userMessage.value.trim();
    if (prompt === "" && fileInput.files.length === 0) {
        return;
    }

    let chatContent = "";

    if (prompt !== "") {
        chatContent += userDiv(md().render(prompt));
    }

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        try {
            const fileContent = await handleFileUpload(file);
            console.log(fileContent);
            chatContent += userDiv(md().render(`File: ${file.name}\n\n${fileContent}`));
        } catch (error) {
            console.error("Error reading file:", error);
        }
    }

    chatArea.innerHTML += chatContent;
    userMessage.value = "";
    fileInput.value = ""; // Clear file input

    const aiResponse = await getResponse(prompt);
    let md_text = md().render(aiResponse);
    chatArea.innerHTML += aiDiv(md_text);

    let newUserRole = {
        role: "user",
        parts: prompt,
    };
    let newAIRole = {
        role: "model",
        parts: aiResponse,
    };

    history.push(newUserRole);
    history.push(newAIRole);

    console.log(history);
}

const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", handleSubmit);

chatForm.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) handleSubmit(event);
});

// Get the elements
const chatbotPopup = document.getElementById('chatbot-popup');
const openChatbotButton = document.getElementById('open-chatbot');

// Event to open the chatbot
openChatbotButton.addEventListener('click', () => {
    chatbotPopup.style.display = 'block';
});

const closeChatbotButton = document.getElementById('close-chatbot');

// Event to close the chatbot
closeChatbotButton.addEventListener('click', () => {
    chatbotPopup.style.display = 'none';
});
