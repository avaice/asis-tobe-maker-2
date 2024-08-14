"use client"

import { useCallback, useMemo, useRef, useState } from "react"

export const useAsisTobeSelect = () => {
  const [asis, setAsis] = useState<File | null>(null)
  const [tobe, setTobe] = useState<File | null>(null)
  const [asisIsDragging, setAsisIsDragging] = useState(false)
  const [tobeIsDragging, setTobeIsDragging] = useState(false)
  const [asisStartSecond, setAsisStartSecond] = useState(0)
  const [tobeStartSecond, setTobeStartSecond] = useState(0)

  const asisInputRef = useRef<HTMLInputElement>(null)
  const tobeInputRef = useRef<HTMLInputElement>(null)

  const handleAsisFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setAsis(e.target.files[0])
      }
    },
    []
  )

  const handleTobeFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setTobe(e.target.files[0])
      }
    },
    []
  )

  const asisDom = useMemo(
    () => (
      <div className="w-[calc(50%_-_8px)] shrink-0">
        <h2 className="text-xl pb-1">
          ASIS
          {asis && (
            <button
              onClick={() => setAsis(null)}
              className="text-sm ml-2 text-blue-500 hover:underline"
            >
              削除
            </button>
          )}
        </h2>
        {asis ? (
          <>
            <video
              src={URL.createObjectURL(asis)}
              controls
              className="w-full aspect-[4/3] border rounded"
              onSeekedCapture={(e) => {
                setAsisStartSecond(e.currentTarget.currentTime)
              }}
            />
          </>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setAsisIsDragging(true)
            }}
            onDragLeave={() => setAsisIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setAsisIsDragging(false)
              setAsis(e.dataTransfer.files[0])
            }}
            className={`flex flex-col items-center justify-center w-full aspect-[4/3] rounded border dropzone ${
              asisIsDragging ? "bg-gray-50" : ""
            }`}
          >
            <span>ここにドロップ</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              ref={asisInputRef}
              onChange={handleAsisFileChange}
            />
            <button
              onClick={() => asisInputRef.current?.click()}
              className="mt-2 text-blue-500 hover:underline"
            >
              またはファイル選択
            </button>
          </div>
        )}
      </div>
    ),
    [asis, asisIsDragging, handleAsisFileChange]
  )

  const tobeDom = useMemo(
    () => (
      <div className="w-[calc(50%_-_8px)]  shrink-0">
        <h2 className="text-xl pb-1">
          TOBE
          {tobe && (
            <button
              onClick={() => setTobe(null)}
              className="text-sm ml-2 text-blue-500 hover:underline"
            >
              削除
            </button>
          )}
        </h2>
        {tobe ? (
          <>
            <video
              className="w-full aspect-[4/3] border rounded"
              src={URL.createObjectURL(tobe)}
              controls
              onSeekedCapture={(e) => {
                setTobeStartSecond(e.currentTarget.currentTime)
              }}
            />
          </>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setTobeIsDragging(true)
            }}
            onDragLeave={() => setTobeIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setTobeIsDragging(false)
              setTobe(e.dataTransfer.files[0])
            }}
            className={`flex flex-col items-center justify-center w-full aspect-[4/3] rounded border dropzone ${
              tobeIsDragging ? "bg-gray-50" : ""
            }`}
          >
            <span>ここにドロップ</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleTobeFileChange}
              ref={tobeInputRef}
            />
            <button
              onClick={() => tobeInputRef.current?.click()}
              className="mt-2 text-blue-500 hover:underline"
            >
              またはファイル選択
            </button>
          </div>
        )}
      </div>
    ),
    [handleTobeFileChange, tobe, tobeIsDragging]
  )

  const selectInput = useMemo(() => {
    return (
      <div className="flex gap-4">
        {asisDom}
        {tobeDom}
      </div>
    )
  }, [asisDom, tobeDom])

  return {
    asis,
    tobe,
    selectInput,
    startSeconds: {
      asis: asisStartSecond,
      tobe: tobeStartSecond,
    },
  }
}
