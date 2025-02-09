"use client";
import {
  AppWindow,
  Brush,
  Eraser,
  Image,
  Maximize,
  Minimize,
  Proportions,
  Redo,
  Undo,
  Upload,
  X,
} from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import DrawLogic from "../lib/drawLogic";
import { Slider } from "./ui/slider";
import React, { useEffect, useRef, useState } from "react";
import { IESLoader } from "three/examples/jsm/Addons.js";

export interface LeftPanelProps {
  onMinimize: () => void;
  onUpload: (data: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  isLoading: boolean;
}

function LeftPanel({ onMinimize, onUpload, onFileUpload, isLoading }: LeftPanelProps) {
  const [_, reRenderer] = useState<boolean>(false);
  const [isBrush, setIsBrush] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    DrawLogic.getInstance().setStrokeFinishedCallback(reRender);
  }, []);

  function reRender() {
    reRenderer((v) => !v);
  }

  return (
    <div className="absolute rounded-l-[100px] z-10 ml-auto flex h-full w-[5rem] flex-col items-center space-y-5 bg-neutral-800 pl-1 pr-1">
      {/* <div className="mt-5 flex items-center justify-between">
        <span className="text-white">size</span>

        <Slider />
      </div> */}

      <Button
        className="mt-25"
        onPointerDown={() => {
          DrawLogic.getInstance().enableBrush();
          setIsBrush(true);
        }}
        style={isBrush ? { filter: "brightness(50%)" } : {}}
      >
        <Brush></Brush>
      </Button>

      <Button
        className="mt-3"
        onPointerDown={() => {
          DrawLogic.getInstance().enableEraser();
          setIsBrush(false);
        }}
        style={!isBrush ? { filter: "brightness(50%)" } : {}}
      >
        <Eraser></Eraser>
      </Button>

      <Button
        className="mt-3"
        onPointerDown={() => {
          DrawLogic.getInstance().undo();
          reRender();
        }}
        style={
          DrawLogic.getInstance().canUndo() ? {} : { filter: "brightness(50%)" }
        }
      >
        <Undo></Undo>
      </Button>
      <Button
        className="mt-3"
        onPointerDown={() => {
          DrawLogic.getInstance().redo();
          reRender();
        }}
        style={
          DrawLogic.getInstance().canRedo() ? {} : { filter: "brightness(50%)" }
        }
      >
        <Redo></Redo>
      </Button>

      <Button className="mt-3" onPointerDown={() => {
        fileInput.current!.click()
      }}>
        <Image></Image>
      </Button>

      <Button
        className="mt-3"
        onPointerDown={() => {
          DrawLogic.getInstance().clear();
        }}
      >
        <X></X>
      </Button>

      <Button
        className="mt-3"
        onPointerDown={() => {
          onUpload(DrawLogic.getInstance().saveToImage());
        }}
        style={isLoading ? { filter: "brightness(50%)" } : {}}
        disabled={isLoading}
      >
        <Upload></Upload>
      </Button>

      <Button className="mt-3" onPointerDown={onMinimize}>
        <Minimize></Minimize>
      </Button>

      <input ref ={fileInput} onChange={onFileUpload} type="file" id="fileInput" accept="image/*" className="hidden" />
    </div>
  );
}

export default LeftPanel;
