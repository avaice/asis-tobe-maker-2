"use client"

import { useCallback, useState } from "react"
import { useAsisTobeSelect } from "./_hooks/useAsisTobeSelect"
import { useVideoToGif } from "./_lib/useVideoToGif"

export default function Home() {
  const asisTobeSelect = useAsisTobeSelect()
  const videoToGif = useVideoToGif()

  const handleGenerateGif = useCallback(async () => {
    if (!asisTobeSelect.asis || !asisTobeSelect.tobe) {
      return
    }
    try {
      const result = await videoToGif.generateGif(
        asisTobeSelect.asis,
        asisTobeSelect.tobe,
        asisTobeSelect.startSeconds
      )
      const link = document.createElement("a")
      link.href = result
      link.download = "output.gif"
      link.click()
    } catch {
      alert("GIFの生成に失敗しました")
    }
  }, [
    asisTobeSelect.asis,
    asisTobeSelect.startSeconds,
    asisTobeSelect.tobe,
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
      <button
        className="mt-4 p-2 w-full border rounded enabled:hover:bg-gray-50 disabled:bg-gray-200"
        onClick={handleGenerateGif}
        disabled={
          !asisTobeSelect.asis ||
          !asisTobeSelect.tobe ||
          videoToGif.isGenerating
        }
      >
        {videoToGif.isGenerating ? "処理中..." : "GIFを生成"}
      </button>
    </main>
  )
}
