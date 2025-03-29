import { useState, useEffect, useRef } from "react";
import { X, Send, Mic, Loader2, StopCircle } from "lucide-react";
import Groq from "groq-sdk";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import chatbotimg from "./chatbot.png";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

// Updated agent templates
const agentTemplates = {
  irrigation: `You are an expert in smart irrigation and precision farming. You assist with irrigation schedules, 
               water management, and soil moisture optimization.`,

  weather: `You are a weather-based farming advisor, helping optimize irrigation schedules and predict weather-related risks 
            to farming, such as heavy rainfall or droughts.`,

  anomaly: `You are a sensor anomaly detection expert, specializing in identifying sensor failures, water leakage, 
            or abnormal readings in an IoT-based irrigation system.`,
};

const routerPrompt = `You are a routing agent for a farming assistant. First determine if the user's query is related to farming, agriculture, irrigation, weather affecting crops, or sensor anomalies in farming systems. 
If NOT related to these topics, respond with 'other'. 
If related, classify into:
1. Irrigation - queries about irrigation schedules, water usage, soil moisture
2. Weather - weather forecasts, rain predictions, weather-based farming
3. Anomaly - sensor data issues, water leakage, malfunctions

Respond with ONLY the category name (irrigation/weather/anomaly) or 'other'.`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! How can I assist you with Smart Irrigation, Weather, or Anomaly Detection queries?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Custom components for ReactMarkdown
  const customComponents = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold my-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold my-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-medium my-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg font-medium my-2" {...props} />
    ),
    p: ({ node, ...props }) => <p className="my-2" {...props} />,
    li: ({ node, ...props }) => <li className="ml-6 list-disc" {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-900 text-white p-4 rounded overflow-auto my-2">
          <code {...props}>{children}</code>
        </pre>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic my-2"
        {...props}
      />
    ),
  };

  const classifyQuery = async (query) => {
    try {
      const routingResponse = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: routerPrompt },
          { role: "user", content: query },
        ],
      });
      return routingResponse.choices[0].message.content.toLowerCase().trim();
    } catch (error) {
      console.error("Error classifying query:", error);
      return "other"; // Default to 'other' for fallback
    }
  };

  const handleMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const category = await classifyQuery(text);

      if (category === 'other') {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I specialize in farming-related topics. Please ask about irrigation systems, weather impacts on crops, or sensor anomalies in agricultural systems.",
          },
        ]);
        setIsLoading(false);
        return;
      }

      const chatResponse = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: agentTemplates[category] || agentTemplates.irrigation,
          },
          ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
          userMessage,
        ],
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: chatResponse.choices[0].message.content },
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm here to assist you with smart farming queries. Please ask about irrigation, weather, or sensor systems.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) =>
        chunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudioInput(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const processAudioInput = async (audioBlob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", "whisper-large-v3");

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.text) {
        setInputMessage(data.text);
        await handleMessage(data.text);
      }
    } catch (error) {
      console.error("Error processing voice input:", error);
      toast.error("Error processing voice command");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-[#34c134] text-white rounded-full p-2 shadow-lg transition-all duration-200">
          <img
            src={chatbotimg}
            alt="chatbot"
            className="h-10 cursor-pointer w-10 pb-1"
          />
        </button>
      ) : (
        // Added backdrop-blur-md and bg-black/20 for glass effect
        <div className="backdrop-blur-md bg-black/20 rounded-lg shadow-xl w-[320px] sm:w-[350px] md:w-[450px] max-h-[700px] flex flex-col border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-4 bg-[#01aa3f] text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold text-lg">Krishi Dhaara Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-green-600 rounded-full p-1 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages - Added bg-white/10 for semi-transparent background */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px] bg-white/10">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-[#00cc4c] text-white rounded-br-none"
                      : "bg-white/80 dark:bg-black text-gray-800 dark:text-gray-200 rounded-bl-none backdrop-blur-sm"
                  }`}>
                  {message.role === "assistant" ? (
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={customComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 dark:bg-gray-700/90 backdrop-blur-sm p-3 rounded-lg rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input section with glass effect */}
          <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30 bg-white/5 backdrop-blur-md rounded-b-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white/20 hover:bg-white/30 backdrop-blur-md text-white"
                }`}
                disabled={isLoading}>
                {isRecording ? (
                  <>
                    <StopCircle size={20} />
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                  </>
                )}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleMessage(inputMessage)
                }
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00cc4c]
                        bg-white/70 backdrop-blur-md dark:bg-black dark:border-gray-600/50 dark:text-white"
                disabled={isRecording || isLoading}
              />

              <button
                onClick={() => handleMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim() || isRecording}
                className="bg-[#00cc4c] text-white p-3 rounded-lg hover:bg-green-600 
                        transition-colors disabled:opacity-50">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
