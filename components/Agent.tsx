"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import Vapi from "@vapi-ai/web";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import type { Message } from "@/types/vapi";
import { MessageTypeEnum, TranscriptMessageTypeEnum } from "@/types/vapi";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [vapi, setVapi] = useState<Vapi | null>(null);

  // Initialize VAPI instance on client side only
  useEffect(() => {
    if (typeof window === "undefined") return; // Skip on server

    const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    if (!vapiToken) {
      console.warn("VAPI token not found");
      return;
    }
    try {
      const vapiInstance = new Vapi(vapiToken);
      setVapi(vapiInstance);
    } catch (error) {
      console.error("Failed to initialize VAPI:", error);
    }
  }, []);

  useEffect(() => {
    if (!vapi) {
      console.warn("VAPI not initialized, skipping event listener setup");
      return;
    }

    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (
        message.type === MessageTypeEnum.TRANSCRIPT &&
        message.transcriptType === TranscriptMessageTypeEnum.FINAL
      ) {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("VAPI error event:", error);
      setCallStatus(CallStatus.INACTIVE);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [vapi]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    if (!vapi) {
      console.error("VAPI is not initialized. Please check your VAPI token.");
      alert("VAPI is not initialized. Please check your environment variables.");
      return;
    }

    try {
      setCallStatus(CallStatus.CONNECTING);

      if (type === "generate") {
        // Validate userId exists before starting call
        if (!userId) {
          console.error("Error: userId is required but was not provided");
          setCallStatus(CallStatus.INACTIVE);
          return;
        }

        // Validate VAPI workflow ID
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        if (!workflowId) {
          console.error("Error: NEXT_PUBLIC_VAPI_WORKFLOW_ID is not set");
          setCallStatus(CallStatus.INACTIVE);
          alert("VAPI Workflow ID is missing. Please check your environment variables.");
          return;
        }

        console.log("Starting VAPI call with:", { workflowId, username: userName, userid: userId });

        // VAPI SDK v2.3.0 - try the correct format based on documentation
        // The workflow ID should be passed directly, and variables should be in variableValues
        const result = await vapi.start(workflowId, {
          variableValues: {
            username: userName || "User",
            userid: userId,
          },
        });

        console.log("VAPI call started successfully:", result);
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        console.log("Starting interview with questions");

        const result = await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });

        console.log("Interview call started successfully:", result);
      }
    } catch (error: unknown) {
      console.error("Error starting VAPI call:");
      
      // Handle different error types
      let errorMessage = "Failed to start call. Please try again.";
      
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Try to extract VAPI error details - check multiple possible structures
        const errorObj = error as any;
        
        // Check for Response object with error property
        if (errorObj.error) {
          console.error("VAPI error object:", errorObj.error);
          if (typeof errorObj.error === "object") {
            errorMessage = errorObj.error.message || errorObj.error.code || JSON.stringify(errorObj.error);
            console.error("VAPI error message:", errorObj.error.message);
            console.error("VAPI error code:", errorObj.error.code);
            console.error("Full VAPI error:", errorObj.error);
          } else {
            errorMessage = String(errorObj.error);
          }
        }
        
        // Try to extract any useful information from the error object
        try {
          console.error("Full error object:", error);
          console.error("Error details (JSON):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
          
          // Try to access common error properties
          if (errorObj.data) console.error("Error data:", errorObj.data);
          if (errorObj.status) console.error("Error status:", errorObj.status);
          if (errorObj.statusText) console.error("Error statusText:", errorObj.statusText);
        } catch (e) {
          console.error("Error object (non-serializable):", error);
        }
      } else {
        console.error("Unknown error type:", error);
      }
      
      setCallStatus(CallStatus.INACTIVE);
      alert(`Failed to start call: ${errorMessage}\n\nCheck console for details.`);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
