"use client"

import { useCallback, useState } from "react"
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg"

// ffmpegの初期化
const ffmpeg: FFmpeg = createFFmpeg({ log: true })
type UseVideoToGifResult = {
  generateGif: (
    asis: File,
    tobe: File,
    startSeconds: {
      asis: number
      tobe: number
    },
    outputType: "gif" | "mp4"
  ) => Promise<string>
  progress: number
  isGenerating: boolean
  error: string | null
}

export const useVideoToGif = (): UseVideoToGifResult => {
  const [progress, setProgress] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * ASISとTOBEの動画を横に並べてGIFに変換する関数
   * @param asis - ASIS側の動画ファイル
   * @param tobe - TOBE側の動画ファイル
   * @returns 生成されたGIFのBlob URL
   */
  const generateGif = useCallback(
    async (
      asis: File,
      tobe: File,
      startSeconds: {
        asis: number
        tobe: number
      },
      outputType: "gif" | "mp4"
    ): Promise<string> => {
      setIsGenerating(true)
      setError(null)
      setProgress(0)

      // ffmpegのロード
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load()
      }

      try {
        // ffmpegの進行状況をトラックするハンドラ
        ffmpeg.setProgress(({ ratio }) => {
          setProgress(Math.round(ratio * 100))
        })

        // フォントを読み込む
        ffmpeg.FS(
          "writeFile",
          "noto_sans_jp.ttf",
          await fetchFile("/noto_sans_jp.ttf")
        )

        // ASISとTOBEの動画を仮想ファイルシステムに書き込む
        ffmpeg.FS("writeFile", "asis.mp4", await fetchFile(asis))
        ffmpeg.FS("writeFile", "tobe.mp4", await fetchFile(tobe))

        await ffmpeg.run(
          "-i",
          "asis.mp4",
          "-ss",
          `${startSeconds.asis.toString()}`,
          "-i",
          "tobe.mp4",
          "-ss",
          `${startSeconds.tobe.toString()}`,
          "-filter_complex",
          "[0:v][1:v]hstack=inputs=2[v];[v]fps=10,scale=1280:-1,pad=1280:ih+100:0:100:black,drawtext=fontfile=noto_sans_jp.ttf:text='ASIS':x=10:y=10:fontsize=48:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2,drawtext=fontfile=noto_sans_jp.ttf:text='TOBE':x=(w-tw)/2+70:y=10:fontsize=48:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2",
          "-c:a",
          "copy",
          "-movflags",
          "+faststart",
          `output.${outputType}`
        )

        // 生成されたGIFを読み込んでBlob URLとして返す
        const data = ffmpeg.FS("readFile", "output." + outputType)
        const url = URL.createObjectURL(
          new Blob([data.buffer], {
            type: outputType === "gif" ? "image/gif" : "video/mp4",
          })
        )

        setIsGenerating(false)
        setProgress(100)

        return url
      } catch (error) {
        console.error("エラーが発生しました:", error)
        setError("出力に失敗しました")
        setIsGenerating(false)
        throw new Error("出力に失敗しました")
      }
    },
    []
  )

  return { generateGif, progress, isGenerating, error }
}
