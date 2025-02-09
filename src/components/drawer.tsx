import { cva } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";
import DrawLogic from "../lib/drawLogic";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  AppWindow,
  Maximize,
  Minimize,
  Minus,
  Plus,
  Redo,
  Undo,
} from "lucide-react";
import { Slider } from "./ui/slider";
import LeftPanel from "./leftPanel";
import { motion, AnimatePresence } from "framer-motion";

export interface DrawerProps {
  canvasWidth: number;
  canvasHeight: number;
  isLoading: boolean;
  onMinimize: () => void;
  onUpload: (data: string) => void;
}

function Drawer(props: DrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !isInit) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Redraw something on the canvas

      DrawLogic.initialize(canvas, props.canvasWidth, props.canvasHeight);
      setIsInit(true);
      DrawLogic.getInstance().clear();
      DrawLogic.getInstance().removeEvents();
      DrawLogic.getInstance().setupEvents();
    }
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      const context = DrawLogic.getInstance().getContext();
      const canvas = canvasRef.current!;

      // Set up FileReader to read image file
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          // Clear the canvas before drawing the new image
          DrawLogic.getInstance().clear()

          // Scale the image to fit the canvas width while maintaining aspect ratio
          const widthScale = canvas.width / img.width;
          const heightScale = canvas.height / img.height;
          const scaleFactor = Math.min(widthScale, heightScale);

          const newWidth = img.width * scaleFactor;
          const newHeight = img.height * scaleFactor;

          // Draw the image onto the canvas
          context.drawImage(img, 0, 0, newWidth, newHeight);
        };

        img.src = e.target.result;
      };

      // Read the image as a data URL (base64)
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="relative w-[40%] h-[90%] p-4">
      <div className="absolute border-r-8 border-t-8 border-b-8 border-neutral-800 z-30 w-full h-full rounded-[90px] pointer-events-none" />
      {DrawLogic.isInitialized() ? (
        <LeftPanel onFileUpload={handleFileSelect } {...props}></LeftPanel>
      ) : (
        <></>
      )}
      <canvas
        ref={canvasRef}
        className="z-9 absolute h-full w-full touch-none select-none rounded-[100px]" style={{boxShadow: '6px 0px 26px -1px rgba(101,108,128,0.73)'}}
      ></canvas>
    </div>
  );
}

export default Drawer;
