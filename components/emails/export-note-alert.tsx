import * as React from "react"

interface EmailTemplateProps {
  plot: string
  noteDetail: string
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  plot,
  noteDetail,
}) => (
  <div className="flex flex-col items-center w-48">
    <h1>Notes Added to Land Area</h1>
    <h3>Plot {plot}</h3>
    <div className="p-4 border-solid border-[1px] border-slate-200">
      {noteDetail}
    </div>
    <br />
    <a href="https://www.jbpearce.app/land-areas">
      www.jbpearce.app/land-areas
    </a>
    <br />
    <p>{Date().toString()}</p>
  </div>
)
