"use client"

import { useState, useEffect } from "react"
import type * as fabric from "fabric"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Lock,
  Unlock,
  ChevronUp,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ToolbarProps {
  canvas: fabric.Canvas | null
  selectedObject: fabric.Object | null
}

export default function Toolbar({ canvas, selectedObject }: ToolbarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [textOptions, setTextOptions] = useState({
    fontFamily: "Arial",
    fontSize: 30,
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,
    textAlign: "left",
  })
  const [fillColor, setFillColor] = useState("#000000")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(1)
  const [opacity, setOpacity] = useState(100)
  const [isLocked, setIsLocked] = useState(false)

  // Update toolbar values when selection changes
  useEffect(() => {
    if (!selectedObject) return

    // Update fill color
    if (selectedObject.fill && typeof selectedObject.fill === "string") {
      setFillColor(selectedObject.fill)
    }

    // Update stroke color and width
    if (selectedObject.stroke && typeof selectedObject.stroke === "string") {
      setStrokeColor(selectedObject.stroke)
    }

    if (typeof selectedObject.strokeWidth === "number") {
      setStrokeWidth(selectedObject.strokeWidth)
    }

    // Update opacity
    if (typeof selectedObject.opacity === "number") {
      setOpacity(selectedObject.opacity * 100)
    }

    // Update lock status
    setIsLocked(!!selectedObject.lockMovementX && !!selectedObject.lockMovementY)

    // Update text options if it's a text object
    if (selectedObject.type === "i-text" || selectedObject.type === "text" || selectedObject.type === "textbox") {
      const textObject = selectedObject as fabric.IText

      setTextOptions({
        fontFamily: textObject.fontFamily || "Arial",
        fontSize: textObject.fontSize || 30,
        fontWeight: textObject.fontWeight || "normal",
        fontStyle: textObject.fontStyle || "normal",
        underline: textObject.underline || false,
        textAlign: textObject.textAlign || "left",
      })
    }
  }, [selectedObject])

  // Apply text formatting
  const applyTextFormatting = (property: string, value: any) => {
    if (!canvas || !selectedObject) return

    if (selectedObject.type === "i-text" || selectedObject.type === "text" || selectedObject.type === "textbox") {
      const textObject = selectedObject as fabric.IText

      switch (property) {
        case "fontFamily":
          textObject.set({ fontFamily: value })
          setTextOptions((prev) => ({ ...prev, fontFamily: value }))
          break
        case "fontSize":
          textObject.set({ fontSize: value })
          setTextOptions((prev) => ({ ...prev, fontSize: value }))
          break
        case "fontWeight":
          textObject.set({ fontWeight: value === "bold" ? "bold" : "normal" })
          setTextOptions((prev) => ({ ...prev, fontWeight: value }))
          break
        case "fontStyle":
          textObject.set({ fontStyle: value === "italic" ? "italic" : "normal" })
          setTextOptions((prev) => ({ ...prev, fontStyle: value }))
          break
        case "underline":
          textObject.set({ underline: value })
          setTextOptions((prev) => ({ ...prev, underline: value }))
          break
        case "textAlign":
          textObject.set({ textAlign: value })
          setTextOptions((prev) => ({ ...prev, textAlign: value }))
          break
      }

      canvas.renderAll()
    }
  }

  // Apply fill color
  const applyFillColor = (color: string) => {
    if (!canvas || !selectedObject) return

    selectedObject.set({ fill: color })
    setFillColor(color)
    canvas.renderAll()
  }

  // Apply stroke color
  const applyStrokeColor = (color: string) => {
    if (!canvas || !selectedObject) return

    selectedObject.set({ stroke: color })
    setStrokeColor(color)
    canvas.renderAll()
  }

  // Apply stroke width
  const applyStrokeWidth = (width: number) => {
    if (!canvas || !selectedObject) return

    selectedObject.set({ strokeWidth: width })
    setStrokeWidth(width)
    canvas.renderAll()
  }

  // Apply opacity
  const applyOpacity = (value: number) => {
    if (!canvas || !selectedObject) return

    selectedObject.set({ opacity: value / 100 })
    setOpacity(value)
    canvas.renderAll()
  }

  // Toggle lock
  const toggleLock = () => {
    if (!canvas || !selectedObject) return

    const newLockState = !isLocked
    selectedObject.set({
      lockMovementX: newLockState,
      lockMovementY: newLockState,
      lockRotation: newLockState,
      lockScalingX: newLockState,
      lockScalingY: newLockState,
    })

    setIsLocked(newLockState)
    canvas.renderAll()
  }

  // Delete selected object
  const deleteObject = () => {
    if (!canvas || !selectedObject) return

    canvas.remove(selectedObject)
    canvas.renderAll()
  }

  // Duplicate selected object
  const duplicateObject = () => {
    if (!canvas || !selectedObject) return

    selectedObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: selectedObject.left! + 20,
        top: selectedObject.top! + 20,
        evented: true,
      })

      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.renderAll()
    })
  }

  // Bring selected object to front
  const bringToFront = () => {
    if (!canvas || !selectedObject) return

    selectedObject.bringToFront()
    canvas.renderAll()
  }

  // Send selected object to back
  const sendToBack = () => {
    if (!canvas || !selectedObject) return

    selectedObject.sendToBack()
    canvas.renderAll()
  }

  if (!selectedObject) {
    return (
      <div className="h-12 border-t border-futuristic-blue/20 bg-futuristic-background-dark flex items-center justify-center text-sm text-futuristic-blue-light">
        Select an object to edit its properties
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className="h-12 border-t border-futuristic-blue/20 bg-futuristic-background-dark flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="text-futuristic-blue hover:bg-futuristic-blue/20"
        >
          <ChevronUp className="h-4 w-4 mr-1" />
          Show Toolbar
        </Button>
      </div>
    )
  }

  return (
    <div className="border-t border-futuristic-blue/20 bg-futuristic-background-dark p-2 overflow-x-auto">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-medium text-futuristic-blue-light">Object Properties</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(true)}
          className="text-futuristic-blue hover:bg-futuristic-blue/20"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Text formatting options */}
        {(selectedObject.type === "i-text" || selectedObject.type === "text" || selectedObject.type === "textbox") && (
          <div className="space-y-2 min-w-[200px]">
            <h4 className="text-xs font-medium text-futuristic-yellow">Text</h4>

            <div className="flex items-center space-x-1">
              <Select
                value={textOptions.fontFamily}
                onValueChange={(value) => applyTextFormatting("fontFamily", value)}
              >
                <SelectTrigger className="h-8 w-[120px] border-futuristic-blue/30 bg-futuristic-background-light/30">
                  <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent className="bg-futuristic-background-dark border-futuristic-blue/30">
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={textOptions.fontSize.toString()}
                onValueChange={(value) => applyTextFormatting("fontSize", Number.parseInt(value))}
              >
                <SelectTrigger className="h-8 w-[70px] border-futuristic-blue/30 bg-futuristic-background-light/30">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent className="bg-futuristic-background-dark border-futuristic-blue/30">
                  {[12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", textOptions.fontWeight === "bold" && "bg-futuristic-blue/30")}
                onClick={() => applyTextFormatting("fontWeight", textOptions.fontWeight === "bold" ? "normal" : "bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", textOptions.fontStyle === "italic" && "bg-futuristic-blue/30")}
                onClick={() =>
                  applyTextFormatting("fontStyle", textOptions.fontStyle === "italic" ? "normal" : "italic")
                }
              >
                <Italic className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", textOptions.underline && "bg-futuristic-blue/30")}
                onClick={() => applyTextFormatting("underline", !textOptions.underline)}
              >
                <Underline className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", textOptions.textAlign === "left" && "bg-futuristic-blue/30")}
                onClick={() => applyTextFormatting("textAlign", "left")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", textOptions.textAlign === "center" && "bg-futuristic-blue/30")}
                onClick={() => applyTextFormatting("textAlign", "center")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", textOptions.textAlign === "right" && "bg-futuristic-blue/30")}
                onClick={() => applyTextFormatting("textAlign", "right")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Color options */}
        <div className="space-y-2 min-w-[200px]">
          <h4 className="text-xs font-medium text-futuristic-yellow">Colors</h4>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="fill-color" className="text-xs text-futuristic-blue-light">
                Fill
              </Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 border border-futuristic-blue/30 rounded"
                  style={{ backgroundColor: fillColor }}
                />
                <Input
                  id="fill-color"
                  type="color"
                  value={fillColor}
                  onChange={(e) => applyFillColor(e.target.value)}
                  className="h-8 w-[100px] border-futuristic-blue/30 bg-futuristic-background-light/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="stroke-color" className="text-xs text-futuristic-blue-light">
                Stroke
              </Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 border border-futuristic-blue/30 rounded"
                  style={{ backgroundColor: strokeColor }}
                />
                <Input
                  id="stroke-color"
                  type="color"
                  value={strokeColor}
                  onChange={(e) => applyStrokeColor(e.target.value)}
                  className="h-8 w-[100px] border-futuristic-blue/30 bg-futuristic-background-light/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stroke width */}
        <div className="space-y-2 min-w-[150px]">
          <div className="flex items-center justify-between">
            <Label htmlFor="stroke-width" className="text-xs font-medium text-futuristic-blue-light">
              Stroke Width
            </Label>
            <span className="text-xs text-futuristic-yellow">{strokeWidth}px</span>
          </div>
          <Slider
            id="stroke-width"
            min={0}
            max={20}
            step={1}
            value={[strokeWidth]}
            onValueChange={(value) => applyStrokeWidth(value[0])}
            className="[&>span]:bg-futuristic-blue [&>span]:h-2 [&>span]:rounded-full"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-2 min-w-[150px]">
          <div className="flex items-center justify-between">
            <Label htmlFor="opacity" className="text-xs font-medium text-futuristic-blue-light">
              Opacity
            </Label>
            <span className="text-xs text-futuristic-yellow">{opacity}%</span>
          </div>
          <Slider
            id="opacity"
            min={0}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={(value) => applyOpacity(value[0])}
            className="[&>span]:bg-futuristic-yellow [&>span]:h-2 [&>span]:rounded-full"
          />
        </div>

        {/* Object actions */}
        <div className="space-y-2 min-w-[200px]">
          <h4 className="text-xs font-medium text-futuristic-yellow">Actions</h4>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-futuristic-yellow-dark hover:bg-futuristic-yellow-dark/20"
              onClick={deleteObject}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-futuristic-blue hover:bg-futuristic-blue/20"
              onClick={duplicateObject}
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 text-futuristic-yellow hover:bg-futuristic-yellow/20",
                isLocked && "bg-futuristic-yellow/30",
              )}
              onClick={toggleLock}
              title={isLocked ? "Unlock" : "Lock"}
            >
              {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-futuristic-blue-light hover:bg-futuristic-blue-light/20"
              onClick={bringToFront}
              title="Bring to Front"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="7 11 12 6 17 11" />
                <line x1="12" y1="18" x2="12" y2="6" />
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-futuristic-blue-light hover:bg-futuristic-blue-light/20"
              onClick={sendToBack}
              title="Send to Back"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="7 13 12 18 17 13" />
                <line x1="12" y1="6" x2="12" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

