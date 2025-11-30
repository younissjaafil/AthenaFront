"use client";

import { useEffect, useRef } from "react";

interface JitsiMeetProps {
  roomName: string;
  displayName?: string;
  email?: string;
  onClose?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function JitsiMeet({
  roomName,
  displayName = "Participant",
  email,
  onClose,
  onJoin,
  onLeave,
}: JitsiMeetProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Jitsi API"));
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current || apiRef.current) return;

        const domain = "meet.jit.si";
        const options = {
          roomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName,
            email,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "chat",
              "recording",
              "settings",
              "raisehand",
              "videoquality",
              "tileview",
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: "",
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: "#1a1a2e",
            DEFAULT_LOCAL_DISPLAY_NAME: displayName,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
          },
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Event listeners
        apiRef.current.addListener("videoConferenceJoined", () => {
          onJoin?.();
        });

        apiRef.current.addListener("videoConferenceLeft", () => {
          onLeave?.();
        });

        apiRef.current.addListener("readyToClose", () => {
          onClose?.();
        });
      } catch (error) {
        console.error("Failed to initialize Jitsi:", error);
      }
    };

    initJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, email, onClose, onJoin, onLeave]);

  return (
    <div
      ref={jitsiContainerRef}
      className="w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-gray-900"
    />
  );
}

// Simple wrapper to open Jitsi in a new tab (simpler approach)
export function openJitsiRoom(roomUrl: string) {
  window.open(roomUrl, "_blank", "noopener,noreferrer");
}
