import React from 'react'

type SpinnerProps = {
  borderSize?: string
  color?: string
  size?: string
}

export default function Spinner({
  size = '8',
  color = 'primary',
  borderSize = '4',
}: SpinnerProps) {
  return (
    <div
      className={`inline-block h-${size} w-${size} animate-spin rounded-full border border-${borderSize} border-solid border-current border-e-transparent align-[-0.125em] text-${color} motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !p-0 !whitespace-nowrap ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  )
}
