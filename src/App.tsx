import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ModelView from "./components/modelView";
import Drawer from "./components/drawer";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./components/ui/button";
import { Maximize } from "lucide-react";
import { PLYLoader } from "three/examples/jsm/Addons.js";
import ClipLoader from "react-spinners/ClipLoader";
import DrawLogic from "./lib/drawLogic";

async function writeImage(t: string) {
  // Make a request to the Flask backend
  const response = await fetch("http://127.0.0.1:5000/skeleton", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename: t }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch image: " + response.statusText);
  }

  // Convert response to Blob
  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);

  // Load the image and draw on canvas
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    DrawLogic.getInstance().drawImage(img);
  };
}
async function get3DModel(data: string, t: string) {
  const response = await fetch(`http://127.0.0.1:5000/${t}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ image: data }), // Send the base64 image as JSON
  });
  // Read the response as a Blob (binary data)
  return await response.blob();
}

function App() {
  const [drawerWidth, setDrawerWidth] = useState("50%");
  const [showDrawing, setShowDrawing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [modelData, setModelData] = useState<Blob | null>(null);

  return (
    <>
      <div className="relative h-screen w-screen touch-none bg-red-400 p-0 m-0 overflow-hidden flex flex-row items-center">
        {showDrawing && (
          <Drawer
            onUpload={(data) => {
              const src = 'spin'
              setIsLoading(true);
              get3DModel(data, src).then((d) => {
                setIsLoading(false);
                setModelData(d);
                writeImage(src)
              });
            }}
            isLoading={isLoading}
            canvasHeight={2000}
            canvasWidth={2000}
            onMinimize={() => setShowDrawing(false)}
          ></Drawer>
        )}
        {isLoading && (
          <div className="z-3 bg-slate-800 ml-10 w-[20%] h-[20%] rounded-4xl flex flex-col justify-center items-center">
            <span className="text-xl mb-3"> Loading </span>
            <ClipLoader size={80} color="#3498db" loading={isLoading} />
          </div>
        )}
        <ModelView data={modelData} />

        {!showDrawing && (
          <Button
            className="mt-auto mr-auto w-[60px] h-[60px] bg-slate-700 z-50 rounded-[200px]"
            onPointerDown={() => setShowDrawing(true)}
          >
            <Maximize scale={2}></Maximize>
          </Button>
        )}
      </div>
    </>
  );
}

export default App;
