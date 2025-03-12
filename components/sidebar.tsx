"use client"

import type React from "react"

import { useState, useRef } from "react"
import * as fabric from "fabric"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Square, Circle, Type, ImageIcon, Shapes, Grid3X3, PanelLeft, Upload, Loader2, FileJson } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"

interface SidebarProps {
  canvas: fabric.Canvas | null
}

export default function Sidebar({ canvas }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useMobile()
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)
  const [backgroundScale, setBackgroundScale] = useState(100)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgFileInputRef = useRef<HTMLInputElement>(null)

  // Simulate upload progress
  const simulateProgress = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 50)

    return () => clearInterval(interval)
  }

  // Handle background image upload
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return

    setUploadingImage(true)
    const cleanup = simulateProgress()

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target) return

      fabric.Image.fromURL(event.target.result as string, (img) => {
        // Set image as background
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width! / img.width!,
          scaleY: canvas.height! / img.height!,
          opacity: 1,
        })

        setBackgroundOpacity(100)
        setBackgroundScale(100)
        canvas.renderAll()
        setUploadingImage(false)
        setUploadProgress(100)

        // Reset the file input
        if (bgFileInputRef.current) {
          bgFileInputRef.current.value = ""
        }

        setTimeout(() => {
          setUploadProgress(0)
        }, 1000)

        cleanup()
      })
    }

    reader.readAsDataURL(file)
  }

  // Handle drag and drop for background
  const handleBgDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleBgDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!canvas || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return

    setUploadingImage(true)
    const cleanup = simulateProgress()

    const file = e.dataTransfer.files[0]
    if (!file.type.startsWith("image/")) {
      setUploadingImage(false)
      cleanup()
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target) return

      fabric.Image.fromURL(event.target.result as string, (img) => {
        // Set image as background
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width! / img.width!,
          scaleY: canvas.height! / img.height!,
          opacity: 1,
        })

        setBackgroundOpacity(100)
        setBackgroundScale(100)
        canvas.renderAll()
        setUploadingImage(false)
        setUploadProgress(100)

        setTimeout(() => {
          setUploadProgress(0)
        }, 1000)

        cleanup()
      })
    }

    reader.readAsDataURL(file)
  }

  // Apply gradient background
  const applyGradientBackground = (type: string) => {
    if (!canvas) return

    // Remove any existing background image
    canvas.backgroundImage = null

    // Set background color based on type
    switch (type) {
      case "blue":
        canvas.backgroundColor = new fabric.Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2: canvas.width!, y2: canvas.height! },
          colorStops: [
            { offset: 0, color: "#0A2472" },
            { offset: 1, color: "#4CC9F0" },
          ],
        })
        break
      case "yellow":
        canvas.backgroundColor = new fabric.Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2: canvas.width!, y2: canvas.height! },
          colorStops: [
            { offset: 0, color: "#FFBE0B" },
            { offset: 1, color: "#FB5607" },
          ],
        })
        break
      case "blue-yellow":
        canvas.backgroundColor = new fabric.Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2: canvas.width!, y2: canvas.height! },
          colorStops: [
            { offset: 0, color: "#3A86FF" },
            { offset: 1, color: "#FFBE0B" },
          ],
        })
        break
      case "dark":
        canvas.backgroundColor = "#0F172A"
        break
      default:
        canvas.backgroundColor = "#ffffff"
    }

    canvas.renderAll()
  }

  // Adjust background opacity
  const adjustBackgroundOpacity = (opacity: number) => {
    if (!canvas || !canvas.backgroundImage) return

    setBackgroundOpacity(opacity)
    canvas.backgroundImage.set({ opacity: opacity / 100 })
    canvas.renderAll()
  }

  // Adjust background scale
  const adjustBackgroundScale = (scale: number) => {
    if (!canvas || !canvas.backgroundImage) return

    setBackgroundScale(scale)

    const bgImage = canvas.backgroundImage
    const originalScaleX = canvas.width! / bgImage.width!
    const originalScaleY = canvas.height! / bgImage.height!

    bgImage.set({
      scaleX: originalScaleX * (scale / 100),
      scaleY: originalScaleY * (scale / 100),
    })

    canvas.renderAll()
  }

  // Remove background
  const removeBackground = () => {
    if (!canvas) return

    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas))
    canvas.backgroundColor = "#ffffff"
    canvas.renderAll()
  }

  // Add text to canvas
  const addText = () => {
    if (!canvas) return

    const text = new fabric.IText("Edit this text", {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fill: "#FFFFFF", // Changed to white
      fontSize: 30,
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  // Add rectangle to canvas
  const addRectangle = () => {
    if (!canvas) return

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: "#4CC9F0",
      stroke: "#3A86FF",
      strokeWidth: 1,
    })

    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
  }

  // Add circle to canvas
  const addCircle = () => {
    if (!canvas) return

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: "#FFBE0B",
      stroke: "#FB5607",
      strokeWidth: 1,
    })

    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
  }

  // Add triangle to canvas
  const addTriangle = () => {
    if (!canvas) return

    const triangle = new fabric.Triangle({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: "#FB5607",
      stroke: "#FFBE0B",
      strokeWidth: 1,
    })

    canvas.add(triangle)
    canvas.setActiveObject(triangle)
    canvas.renderAll()
  }

  // Add line to canvas
  const addLine = () => {
    if (!canvas) return

    const line = new fabric.Line([50, 50, 200, 50], {
      stroke: "#4CC9F0",
      strokeWidth: 5,
    })

    canvas.add(line)
    canvas.setActiveObject(line)
    canvas.renderAll()
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return

    setUploadingImage(true)
    setImagePreview(null)
    const cleanup = simulateProgress()

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target) return

      // Set preview
      setImagePreview(event.target.result as string)

      fabric.Image.fromURL(event.target.result as string, (img) => {
        // Scale image to fit canvas
        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()

        if (img.width && img.height) {
          if (img.width > canvasWidth * 0.8) {
            const scale = (canvasWidth * 0.8) / img.width
            img.scale(scale)
          }

          if (img.height && img.height > canvasHeight * 0.8) {
            const scale = (canvasHeight * 0.8) / img.height
            img.scale(scale)
          }
        }

        img.set({
          left: 100,
          top: 100,
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        setUploadingImage(false)
        setUploadProgress(100)

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        setTimeout(() => {
          setUploadProgress(0)
        }, 1000)

        cleanup()
      })
    }

    reader.readAsDataURL(file)
  }

  // Handle drag and drop for images
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!canvas || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return

    setUploadingImage(true)
    setImagePreview(null)
    const cleanup = simulateProgress()

    const file = e.dataTransfer.files[0]
    if (!file.type.startsWith("image/")) {
      setUploadingImage(false)
      cleanup()
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target) return

      // Set preview
      setImagePreview(event.target.result as string)

      fabric.Image.fromURL(event.target.result as string, (img) => {
        // Scale image to fit canvas
        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()

        if (img.width && img.height) {
          if (img.width > canvasWidth * 0.8) {
            const scale = (canvasWidth * 0.8) / img.width
            img.scale(scale)
          }

          if (img.height && img.height > canvasHeight * 0.8) {
            const scale = (canvasHeight * 0.8) / img.height
            img.scale(scale)
          }
        }

        img.set({
          left: 100,
          top: 100,
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        setUploadingImage(false)
        setUploadProgress(100)

        setTimeout(() => {
          setUploadProgress(0)
        }, 1000)

        cleanup()
      })
    }

    reader.readAsDataURL(file)
  }

  // Add placeholder image
  const addPlaceholderImage = () => {
    if (!canvas) return

    fabric.Image.fromURL("/placeholder.svg?height=300&width=300", (img) => {
      img.set({
        left: 100,
        top: 100,
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    })
  }

  // Add template
  const addTemplate = (templateType: string) => {
    if (!canvas) return

    // Clear canvas
    canvas.clear()

    if (templateType === "social") {
      // Social media post template (1080x1080)
      canvas.setDimensions({ width: 800, height: 800 })
      canvas.backgroundColor = "#1E293B"

      // Add elements
      const title = new fabric.IText("YOUR HEADLINE HERE", {
        left: 400,
        top: 300,
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 40,
        fill: "#FFFFFF", // Changed to white
        textAlign: "center",
        originX: "center",
        originY: "center",
      })

      const subtitle = new fabric.IText("Subtitle text goes here", {
        left: 400,
        top: 360,
        fontFamily: "Arial",
        fontSize: 24,
        fill: "#FFFFFF",
        textAlign: "center",
        originX: "center",
        originY: "center",
      })

      const rect = new fabric.Rect({
        left: 400,
        top: 450,
        width: 200,
        height: 60,
        fill: "#FFBE0B",
        rx: 10,
        ry: 10,
        originX: "center",
        originY: "center",
      })

      const buttonText = new fabric.IText("LEARN MORE", {
        left: 400,
        top: 450,
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 20,
        fill: "#0F172A",
        textAlign: "center",
        originX: "center",
        originY: "center",
      })

      canvas.add(title, subtitle, rect, buttonText)
    } else if (templateType === "presentation") {
      // Presentation slide template (16:9)
      canvas.setDimensions({ width: 800, height: 450 })
      canvas.backgroundColor = "#0F172A"

      // Add elements
      const title = new fabric.IText("PRESENTATION TITLE", {
        left: 400,
        top: 80,
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 36,
        fill: "#FFFFFF", // Changed to white
        textAlign: "center",
        originX: "center",
      })

      const divider = new fabric.Rect({
        left: 400,
        top: 130,
        width: 100,
        height: 4,
        fill: "#FFBE0B",
        originX: "center",
      })

      const bullet1 = new fabric.IText("• First point goes here", {
        left: 100,
        top: 180,
        fontFamily: "Arial",
        fontSize: 24,
        fill: "#FFFFFF",
      })

      const bullet2 = new fabric.IText("• Second point goes here", {
        left: 100,
        top: 230,
        fontFamily: "Arial",
        fontSize: 24,
        fill: "#FFFFFF",
      })

      const bullet3 = new fabric.IText("• Third point goes here", {
        left: 100,
        top: 280,
        fontFamily: "Arial",
        fontSize: 24,
        fill: "#FFFFFF",
      })

      canvas.add(title, divider, bullet1, bullet2, bullet3)
    } else if (templateType === "flyer") {
      // Flyer template (A4 portrait)
      canvas.setDimensions({ width: 595, height: 842 })
      canvas.backgroundColor = "#1E293B"

      // Add elements
      const header = new fabric.Rect({
        left: 0,
        top: 0,
        width: 595,
        height: 150,
        fill: "#3A86FF",
      })

      const title = new fabric.IText("EVENT TITLE", {
        left: 297.5,
        top: 75,
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 48,
        fill: "#FFFFFF",
        textAlign: "center",
        originX: "center",
        originY: "center",
      })

      const subtitle = new fabric.IText("Date • Time • Location", {
        left: 297.5,
        top: 200,
        fontFamily: "Arial",
        fontSize: 24,
        fill: "#FFBE0B",
        textAlign: "center",
        originX: "center",
      })

      const description = new fabric.Textbox(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        {
          left: 100,
          top: 300,
          width: 400,
          fontFamily: "Arial",
          fontSize: 18,
          fill: "#FFFFFF",
          textAlign: "center",
        },
      )

      const footer = new fabric.Rect({
        left: 0,
        top: 742,
        width: 595,
        height: 100,
        fill: "#3A86FF",
      })

      const contact = new fabric.IText("Contact: info@example.com | www.example.com", {
        left: 297.5,
        top: 792,
        fontFamily: "Arial",
        fontSize: 18,
        fill: "#FFFFFF",
        textAlign: "center",
        originX: "center",
        originY: "center",
      })

      canvas.add(header, title, subtitle, description, footer, contact)
    }

    canvas.renderAll()
  }

  // Load design from JSON file
  const loadFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    setUploadingImage(true)
    const cleanup = simulateProgress()

    reader.onload = (event) => {
      if (!event.target) return

      try {
        const jsonData = JSON.parse(event.target.result as string)
        canvas.loadFromJSON(jsonData, () => {
          canvas.renderAll()
          setUploadingImage(false)
          setUploadProgress(100)

          setTimeout(() => {
            setUploadProgress(0)
          }, 1000)

          cleanup()
        })
      } catch (error) {
        console.error("Error loading JSON:", error)
        setUploadingImage(false)
        cleanup()
      }
    }

    reader.readAsText(file)
  }

  if (isMobile && collapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-20 z-10 text-futuristic-blue border border-futuristic-blue/30 bg-futuristic-background-dark/80 backdrop-blur-sm hover:bg-futuristic-blue/20"
        onClick={() => setCollapsed(false)}
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "border-r border-futuristic-blue/20 bg-futuristic-background-dark/90 backdrop-blur-sm transition-all duration-300 z-10",
        collapsed ? "w-0 overflow-hidden" : isMobile ? "absolute left-0 top-16 bottom-0 w-64" : "w-64",
      )}
    >
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-futuristic-blue hover:bg-futuristic-blue/20"
          onClick={() => setCollapsed(true)}
        >
          <PanelLeft className="h-5 w-5 rotate-180" />
        </Button>
      )}

      <Tabs defaultValue="elements" className="h-full flex flex-col">
        <TabsList className="grid grid-cols-5 mx-2 mt-2 bg-futuristic-background-light/50">
          <TabsTrigger
            value="elements"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-futuristic-blue data-[state=active]:to-futuristic-blue-light data-[state=active]:text-black"
          >
            <Shapes className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="text"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-futuristic-blue data-[state=active]:to-futuristic-blue-light data-[state=active]:text-black"
          >
            <Type className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-futuristic-blue data-[state=active]:to-futuristic-blue-light data-[state=active]:text-black"
          >
            <ImageIcon className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-futuristic-blue data-[state=active]:to-futuristic-blue-light data-[state=active]:text-black"
          >
            <Grid3X3 className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="backgrounds"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-futuristic-blue data-[state=active]:to-futuristic-blue-light data-[state=active]:text-black"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="elements" className="mt-0 space-y-4">
            <h3 className="text-sm font-medium text-futuristic-blue-light">Shapes</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-futuristic-blue/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200 glow-effect"
                onClick={addRectangle}
              >
                <Square className="h-8 w-8 text-futuristic-blue" />
                <span>Rectangle</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-futuristic-yellow/30 bg-futuristic-background-light/30 hover:bg-futuristic-yellow/20 hover:border-futuristic-yellow/60 transition-all duration-200 glow-effect"
                onClick={addCircle}
              >
                <Circle className="h-8 w-8 text-futuristic-yellow" />
                <span>Circle</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-futuristic-yellow-dark/30 bg-futuristic-background-light/30 hover:bg-futuristic-yellow-dark/20 hover:border-futuristic-yellow-dark/60 transition-all duration-200 glow-effect"
                onClick={addTriangle}
              >
                <svg
                  className="h-8 w-8 text-futuristic-yellow-dark"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 22 22 2 22" />
                </svg>
                <span>Triangle</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-futuristic-blue-light/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue-light/20 hover:border-futuristic-blue-light/60 transition-all duration-200 glow-effect"
                onClick={addLine}
              >
                <svg
                  className="h-8 w-8 text-futuristic-blue-light"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Line</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-0 space-y-4">
            <h3 className="text-sm font-medium text-futuristic-blue-light">Text</h3>
            <Button
              variant="outline"
              className="w-full h-12 border-futuristic-blue/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200 glow-effect"
              onClick={addText}
            >
              Add Text
            </Button>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-futuristic-yellow">Text Presets</h4>
              <Button
                variant="outline"
                className="w-full justify-start h-12 font-bold text-xl border-futuristic-blue/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200"
                onClick={() => {
                  if (!canvas) return
                  const text = new fabric.IText("Heading", {
                    left: 100,
                    top: 100,
                    fontFamily: "Arial",
                    fontWeight: "bold",
                    fill: "#FFFFFF", // Changed to white
                    fontSize: 36,
                  })
                  canvas.add(text)
                  canvas.setActiveObject(text)
                  canvas.renderAll()
                }}
              >
                Heading
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-12 font-semibold text-base border-futuristic-yellow/30 bg-futuristic-background-light/30 hover:bg-futuristic-yellow/20 hover:border-futuristic-yellow/60 transition-all duration-200"
                onClick={() => {
                  if (!canvas) return
                  const text = new fabric.IText("Subheading", {
                    left: 100,
                    top: 100,
                    fontFamily: "Arial",
                    fontWeight: "600",
                    fill: "#FFFFFF", // Changed to white
                    fontSize: 24,
                  })
                  canvas.add(text)
                  canvas.setActiveObject(text)
                  canvas.renderAll()
                }}
              >
                Subheading
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-12 text-sm border-futuristic-blue-light/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue-light/20 hover:border-futuristic-blue-light/60 transition-all duration-200"
                onClick={() => {
                  if (!canvas) return
                  const text = new fabric.IText("Body text goes here", {
                    left: 100,
                    top: 100,
                    fontFamily: "Arial",
                    fill: "#FFFFFF", // Changed to white
                    fontSize: 16,
                  })
                  canvas.add(text)
                  canvas.setActiveObject(text)
                  canvas.renderAll()
                }}
              >
                Body Text
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-0 space-y-4">
            <h3 className="text-sm font-medium text-futuristic-blue-light">Images</h3>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-futuristic-blue/30 rounded-lg p-4 text-center hover:border-futuristic-blue/60 transition-all duration-200"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-futuristic-blue-light" />
                  <h4 className="text-sm font-medium text-futuristic-yellow">Upload Image</h4>
                  <p className="text-xs text-futuristic-blue-light">Drag & drop or click to browse</p>

                  <Input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full border-futuristic-blue/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Select File"
                    )}
                  </Button>

                  {uploadProgress > 0 && (
                    <div className="w-full space-y-1">
                      <Progress value={uploadProgress} className="h-1 bg-futuristic-background-light" />
                      <p className="text-xs text-right text-futuristic-blue-light">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              {imagePreview && (
                <div className="mt-2 border border-futuristic-blue/30 rounded-lg p-2">
                  <h4 className="text-xs font-medium text-futuristic-yellow mb-1">Preview</h4>
                  <div className="relative w-full h-32 bg-futuristic-background-light/20 rounded overflow-hidden">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-futuristic-yellow">Placeholder</h4>
                <Button
                  variant="outline"
                  className="w-full border-futuristic-blue/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200 glow-effect"
                  onClick={addPlaceholderImage}
                >
                  Add Placeholder Image
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-0 space-y-4">
            <h3 className="text-sm font-medium text-futuristic-blue-light">Templates</h3>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 border-futuristic-blue/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200 glow-effect"
                onClick={() => addTemplate("social")}
              >
                <div className="w-12 h-12 bg-futuristic-blue/20 rounded-md flex items-center justify-center">
                  <Square className="h-6 w-6 text-futuristic-blue" />
                </div>
                <span>Social Media Post</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 border-futuristic-yellow/30 bg-futuristic-background-light/30 hover:bg-futuristic-yellow/20 hover:border-futuristic-yellow/60 transition-all duration-200 glow-effect"
                onClick={() => addTemplate("presentation")}
              >
                <div className="w-12 h-12 bg-futuristic-yellow/20 rounded-md flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-futuristic-yellow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="8" y1="2" x2="8" y2="4" />
                    <line x1="16" y1="2" x2="16" y2="4" />
                  </svg>
                </div>
                <span>Presentation Slide</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 border-futuristic-blue-light/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue-light/20 hover:border-futuristic-blue-light/60 transition-all duration-200 glow-effect"
                onClick={() => addTemplate("flyer")}
              >
                <div className="w-12 h-12 bg-futuristic-blue-light/20 rounded-md flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-futuristic-blue-light"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="8" y1="10" x2="16" y2="10" />
                    <line x1="8" y1="14" x2="12" y2="14" />
                  </svg>
                </div>
                <span>Flyer/Poster</span>
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-futuristic-yellow">Load Design</h4>
              <div className="border-2 border-dashed border-futuristic-blue/30 rounded-lg p-4 text-center hover:border-futuristic-blue/60 transition-all duration-200">
                <div className="space-y-2">
                  <FileJson className="h-8 w-8 mx-auto text-futuristic-blue-light" />
                  <h4 className="text-sm font-medium text-futuristic-yellow">Load from JSON</h4>
                  <p className="text-xs text-futuristic-blue-light">Import a previously saved design</p>

                  <Input
                    id="json-upload"
                    type="file"
                    accept=".json"
                    onChange={loadFromJSON}
                    disabled={uploadingImage}
                    className="border-futuristic-blue/30 bg-futuristic-background-light/30 focus:border-futuristic-blue focus:ring-futuristic-blue"
                  />

                  {uploadProgress > 0 && (
                    <div className="w-full space-y-1">
                      <Progress value={uploadProgress} className="h-1 bg-futuristic-background-light" />
                      <p className="text-xs text-right text-futuristic-blue-light">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="backgrounds" className="mt-0 space-y-4">
            <h3 className="text-sm font-medium text-futuristic-blue-light">Background</h3>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-futuristic-blue/30 rounded-lg p-4 text-center hover:border-futuristic-blue/60 transition-all duration-200"
                onDragOver={handleBgDragOver}
                onDrop={handleBgDrop}
              >
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-futuristic-blue-light" />
                  <h4 className="text-sm font-medium text-futuristic-yellow">Upload Background Image</h4>
                  <p className="text-xs text-futuristic-blue-light">Drag & drop or click to browse</p>

                  <Input
                    ref={bgFileInputRef}
                    id="bg-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bgFileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full border-futuristic-blue/30 bg-futuristic-background-light/30 hover:bg-futuristic-blue/20 hover:border-futuristic-blue/60 transition-all duration-200"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Select File"
                    )}
                  </Button>

                  {uploadProgress > 0 && (
                    <div className="w-full space-y-1">
                      <Progress value={uploadProgress} className="h-1 bg-futuristic-background-light" />
                      <p className="text-xs text-right text-futuristic-blue-light">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-futuristic-yellow">Preset Backgrounds</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-16 border-futuristic-blue/30 bg-gradient-to-r from-futuristic-blue-dark to-futuristic-blue hover:opacity-80"
                    onClick={() => applyGradientBackground("blue")}
                  >
                    Blue Gradient
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 border-futuristic-yellow/30 bg-gradient-to-r from-futuristic-yellow to-futuristic-yellow-dark hover:opacity-80"
                    onClick={() => applyGradientBackground("yellow")}
                  >
                    Yellow Gradient
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 border-futuristic-blue/30 bg-gradient-to-br from-futuristic-blue to-futuristic-yellow hover:opacity-80"
                    onClick={() => applyGradientBackground("blue-yellow")}
                  >
                    Blue-Yellow
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 border-futuristic-blue/30 bg-futuristic-background-dark hover:bg-futuristic-background-light/50"
                    onClick={() => applyGradientBackground("dark")}
                  >
                    Dark
                  </Button>
                </div>
              </div>

              {canvas && canvas.backgroundImage && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-futuristic-yellow">Background Properties</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bg-opacity" className="text-xs text-futuristic-blue-light">
                        Opacity
                      </Label>
                      <span className="text-xs text-futuristic-yellow">{backgroundOpacity}%</span>
                    </div>
                    <Slider
                      id="bg-opacity"
                      min={0}
                      max={100}
                      step={1}
                      value={[backgroundOpacity]}
                      onValueChange={(value) => adjustBackgroundOpacity(value[0])}
                      className="[&>span]:bg-futuristic-blue [&>span]:h-2 [&>span]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bg-scale" className="text-xs text-futuristic-blue-light">
                        Scale
                      </Label>
                      <span className="text-xs text-futuristic-yellow">{backgroundScale}%</span>
                    </div>
                    <Slider
                      id="bg-scale"
                      min={50}
                      max={150}
                      step={1}
                      value={[backgroundScale]}
                      onValueChange={(value) => adjustBackgroundScale(value[0])}
                      className="[&>span]:bg-futuristic-blue [&>span]:h-2 [&>span]:rounded-full"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-futuristic-yellow-dark/30 bg-futuristic-background-light/30 hover:bg-futuristic-yellow-dark/20 hover:border-futuristic-yellow-dark/60 text-futuristic-yellow-dark"
                    onClick={removeBackground}
                  >
                    Remove Background
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

