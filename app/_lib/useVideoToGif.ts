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
    outputType: "gif" | "mp4",
    durations: {
      asis: number
      tobe: number
    }
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
      outputType: "gif" | "mp4",
      durations: {
        asis: number
        tobe: number
      }
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
          "-ss",
          `${(startSeconds.asis - 0.04).toString()}`,
          "-i",
          "asis.mp4",
          "-ss",
          `${(startSeconds.tobe - 0.04).toString()}`,
          "-i",
          "tobe.mp4",
          "-filter_complex",
          `[0:v][1:v]hstack=inputs=2[v];[v]fps=${
            outputType === "gif" ? "10" : "30"
          },scale=1280:-1,pad=1280:ih+100:0:100:black,drawtext=fontfile=noto_sans_jp.ttf:text='ASIS':x=10:y=10:fontsize=48:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2,drawtext=fontfile=noto_sans_jp.ttf:text='TOBE':x=(w-tw)/2+70:y=10:fontsize=48:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2`,
          "-movflags",
          "+faststart",
          `output.${outputType}`
        )

        // 生成されたGIFを読み込んでBlob URLとして返す
        const data = ffmpeg.FS("readFile", "output." + outputType)
        // もし容量が0Bだったらエラーを返す
        if (data.byteLength === 0) {
          throw new Error(
            "出力に失敗しました。2つの動画は解像度が異なる可能性があります。"
          )
        }
        const url = URL.createObjectURL(
          new Blob([data.buffer], {
            type: outputType === "gif" ? "image/gif" : "video/mp4",
          })
        )

        setIsGenerating(false)
        setProgress(100)

        console.log(durations)

        return url
      } catch (error) {
        console.error("エラーが発生しました:", error)
        setError(
          "出力に失敗しました。非対応の動画ファイルまたは動画の解像度が異なる可能性があります。"
        )
        setIsGenerating(false)
        throw new Error(
          "出力に失敗しました。非対応の動画ファイルまたは動画の解像度が異なる可能性があります。"
        )
      }
    },
    []
  )

  return { generateGif, progress, isGenerating, error }
}
