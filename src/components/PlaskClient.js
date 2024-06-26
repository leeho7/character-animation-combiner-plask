"use client";

import { Client } from "@plask-ai/client";
import React from "react";
import { useEffect, useState, useContext } from "react";
import { Context as ModalContext } from "../context/ModelContext";
import createAnimationClip from "./AnimationConverter";

export default function ClientButton() {
  const [client, setClient] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const {
    addAnimations,
  } = useContext(ModalContext);

  useEffect(() => {
    async function initializeClient() {
      try {
        const client = new Client();
        await client.signIn("example@email.com", "passward"); // TODO: change to your own email and password -> motion.plask.ai
        client.onMessageReceived((message) => {
            if (message.includes("Done")) {
                const beforeFilter = JSON.parse(message);
                console.log(beforeFilter);
                let animationClip;
                if (Array.isArray(beforeFilter.output.data)) {
                  const afterFilter = client.applyFilter(beforeFilter);
                  animationClip = createAnimationClip(afterFilter)
                } else {
                  animationClip = createAnimationClip(beforeFilter)
                }
                addAnimations(animationClip);
            } else {
                console.log(message);
            }
        });

        setClient(client);
      } catch (error) {
        console.error("Error initializing client:", error);
      }
    }

    initializeClient();

    return () => {
      if (client) {
        client.closeConnection();
      }
    }

  }, []);

  const onClick = async () => {
    if (client && videoUrl) {
      const request = {
        jobId: "test",
        task: "pose_estimation",
        input: {
          fileUrl: videoUrl,
          startTime: Number(startTime),
          endTime: Number(endTime),
        },
        destination: { type: "client" },
      };

      client.sendMessage(request);
    }
  };

  return (
    <div>
        <input
          type="text"
          placeholder="Enter video URL here"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="video-input"
        />
        <input
          type="text"
          placeholder="Enter start time here"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)} 
          className="startTime-input"
        />
        <input
          type="text"
          placeholder="Enter end time here"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)} 
        />
        <button
            onClick={onClick}
            className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex bg-slate-700 text-white rounded-lg p-4"
        >
            Click Me
      </button>
    </div>
  );
}
