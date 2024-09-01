import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";

// Initialize the model
const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [];

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
