"use client"

import { useCallback, useState } from "react"
import { useAsisTobeSelect } from "./_hooks/useAsisTobeSelect"
import { useVideoToGif } from "./_lib/useVideoToGif"

export default function Home() {
  const asisTobeSelect = useAsisTobeSelect()
  const videoToGif = useVideoToGif()
  const [outputType, setOutputType] = useState<"gif" | "mp4">("gif")

  const handleGenerateGif = useCallback(async () => {
    if (!asisTobeSelect.asis || !asisTobeSelect.tobe) {
      return
    }
    try {
      const result = await videoToGif.generateGif(
        asisTobeSelect.asis,
        asisTobeSelect.tobe,
        asisTobeSelect.startSeconds,
        outputType,
        asisTobeSelect.durations
      )
      const link = document.createElement("a")
      link.href = result
      link.download = "output." + outputType
      link.click()
    } catch (e: any) {
      alert(e.message)
    }
  }, [
    asisTobeSelect.asis,
    asisTobeSelect.durations,
    asisTobeSelect.startSeconds,
    asisTobeSelect.tobe,
    outputType,
    videoToGif,
  ])

  return (
    <main className="p-4 mx-auto max-w-[1024px]">
      <h1 className="text-3xl my-4">ASIS-TOBE Maker 2</h1>
      {asisTobeSelect.selectInput}
      <p className="mt-1 text-sm text-gray-500">
        動画の再生位置を変更すると、生成されるGIFの再生開始位置が変更されます。
      </p>

      <progress
        className="w-full mt-4"
        value={videoToGif.progress}
        max={100}
        style={{ visibility: videoToGif.isGenerating ? "visible" : "hidden" }}
      />
      <div className="mt-4">
        <label className="mr-2">出力形式</label>
        <select
          value={outputType}
          onChange={(e) => setOutputType(e.target.value as "gif" | "mp4")}
          className="border rounded"
        >
          <option value="gif">GIF</option>
          <option value="mp4">MP4</option>
        </select>
      </div>
      <button
        className="mt-4 p-2 w-full border rounded enabled:hover:bg-gray-50 disabled:bg-gray-200"
        onClick={handleGenerateGif}
        disabled={
          !asisTobeSelect.asis ||
          !asisTobeSelect.tobe ||
          videoToGif.isGenerating
        }
      >
        {videoToGif.isGenerating ? "処理中..." : "出力"}
      </button>
    </main>
  )
}
