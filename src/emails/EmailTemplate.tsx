import * as React from "react";

interface EmailTemplateProps {
  reasoning: string | undefined,
  proposal: string | undefined,
  job_summary: string,
  job_url: string
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  reasoning,
  proposal,
  job_summary,
  job_url
}) => (
  <div>
    {
      reasoning ? (
        <>
          <h1>Unsuitable Upwork Job</h1>
          <h2>Job</h2>
          <p>{job_summary}</p>
          <h2>Reasoning</h2>
          <p>{reasoning}</p>
          <a href={job_url}><button>View job</button></a>
        </>
      ) : (
        <>
        <h1>New Upwork Job Available</h1>
        <h2>Job Summary</h2>
        <p>{job_summary}</p>
        <h2>Proposal</h2>
        <p>{proposal}</p>
        <a href={job_url}><button>Apply</button></a>
        </>
      )
    }
  </div>
);