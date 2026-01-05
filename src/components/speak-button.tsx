"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SpeakButtonProps {
    text: string;
    lang: string;
}

export function SpeakButton({ text, lang }: SpeakButtonProps) {
    const handleSpeak = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering parent click events (like label focus)

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Text-to-speech not supported in this browser.");
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1 text-muted-foreground hover:text-primary"
                        onClick={handleSpeak}
                    >
                        <Volume2 className="h-3 w-3" />
                        <span className="sr-only">Read aloud</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Read aloud</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
