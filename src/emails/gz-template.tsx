import * as React from "react";

interface EmailTemplateProps {
  job_summary: string;
  job_url: string;
}

export const GZTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  job_summary, job_url,
}) => (
    <div>
        <h1>New Upwork Job Available for GZ Legal</h1>
        <p>{job_summary}</p>
        <a href={job_url}>View Job on Upwork</a>
    </div>
);