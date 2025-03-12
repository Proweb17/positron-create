"use client"

import { useState, useRef, useEffect } from "react"
import * as fabric from "fabric"
import Toolbar from "@/components/toolbar"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Download, Undo, Redo, Save, Zap, FileJson } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Editor() {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
        imageSmoothingEnabled: true,
      })

      fabricCanvas.on("object:modified", () => {
        saveToHistory(fabricCanvas)
      })

      fabricCanvas.on("object:added", () => {
        saveToHistory(fabricCanvas)
      })

      fabricCanvas.on("selection:created", (e) => {
        setSelectedObject(fabricCanvas.getActiveObject())
      })

      fabricCanvas.on("selection:updated", (e) => {
        setSelectedObject(fabricCanvas.getActiveObject())
      })

      fabricCanvas.on("selection:cleared", () => {
        setSelectedObject(null)
      })

      // Add a custom event listener for background changes
      const originalRenderAll = fabricCanvas.renderAll.bind(fabricCanvas)
      fabricCanvas.renderAll = () => {
        const result = originalRenderAll()
        saveToHistory(fabricCanvas)
        return result
      }

      setCanvas(fabricCanvas)
      saveToHistory(fabricCanvas)
    }

    return () => {
      canvas?.dispose()
    }
  }, [])

  // Resize canvas on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvas && canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth
        const containerHeight = canvasContainerRef.current.clientHeight

        // Maintain aspect ratio
        const ratio = 4 / 3
        let newWidth = containerWidth - 40
        let newHeight = newWidth / ratio

        if (newHeight > containerHeight - 40) {
          newHeight = containerHeight - 40
          newWidth = newHeight * ratio
        }

        canvas.setDimensions({
          width: newWidth,
          height: newHeight,
        })
        canvas.renderAll()
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [canvas])

  // Save canvas state to history
  const saveToHistory = (canvas: fabric.Canvas) => {
    const json = JSON.stringify(canvas.toJSON())

    // If we're not at the end of the history, remove everything after current index
    if (historyIndex < history.length - 1) {
      setHistory((prev) => prev.slice(0, historyIndex + 1))
    }

    setHistory((prev) => [...prev, json])
    setHistoryIndex((prev) => prev + 1)
  }

  // Undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      const json = JSON.parse(history[historyIndex - 1])
      canvas?.loadFromJSON(json, canvas.renderAll.bind(canvas))
    }
  }

  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      const json = JSON.parse(history[historyIndex + 1])
      canvas?.loadFromJSON(json, canvas.renderAll.bind(canvas))
    }
  }

  // Export canvas as PNG
  const handleExport = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
      })

      const link = document.createElement("a")
      link.download = "design.png"
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Design exported",
        description: "Your design has been exported as PNG",
      })
    }
  }

  // Save design
  const handleSave = () => {
    if (canvas) {
      const json = JSON.stringify(canvas.toJSON())
      localStorage.setItem("canva_clone_design", json)

      toast({
        title: "Design saved",
        description: "Your design has been saved to local storage",
      })
    }
  }

  // Export canvas as JSON
  const handleExportJSON = () => {
    if (canvas) {
      const json = JSON.stringify(canvas.toJSON())
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19)
      link.download = `positron-design-${timestamp}.json`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL
      URL.revokeObjectURL(url)

      toast({
        title: "Design exported as JSON",
        description: "Your design has been exported as a JSON file",
      })
    }
  }

  return (
    <div className="flex flex-col h-screen bg-futuristic-background-dark">
      {/* Floating Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-auto min-w-[320px] max-w-[90%]">
        <header className="rounded-full border border-futuristic-blue/30 bg-futuristic-background-dark/80 backdrop-blur-md shadow-[0_0_20px_rgba(76,201,240,0.2)] px-4 py-2">
          <div className="flex items-center space-x-2">
            <a href="/" className="flex items-center mr-4">
              <Zap className="h-6 w-6 text-futuristic-yellow animate-glow-pulse" />
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="border-futuristic-blue/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200"
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="border-futuristic-blue/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200"
            >
              <Redo className="h-4 w-4 mr-1" />
              Redo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="border-futuristic-blue/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="border-futuristic-yellow/30 hover:bg-futuristic-yellow/20 hover:border-futuristic-yellow/60 transition-all duration-200"
            >
              <FileJson className="h-4 w-4 mr-1" />
              Save JSON
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExport}
              className="bg-gradient-to-r from-futuristic-blue to-futuristic-yellow-dark hover:opacity-90 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </header>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar canvas={canvas} />

        {/* Canvas area */}
        <div
          className="flex-1 overflow-auto bg-gradient-to-br from-futuristic-background-dark to-futuristic-background p-4 flex items-center justify-center"
          ref={canvasContainerRef}
        >
          <div className="canvas-container shadow-[0_0_30px_rgba(76,201,240,0.2)]">
            <canvas ref={canvasRef} id="canvas" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar canvas={canvas} selectedObject={selectedObject} />
    </div>
  )
}

