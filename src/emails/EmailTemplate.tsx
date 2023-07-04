import GeneratedProposal from "@/types/generatedProposal";
import * as React from "react";

function suitable(suitability: GeneratedProposal["suitability"], { Suitable, Maybe, Unsuitable }: {
  Suitable: string;
  Maybe: string;
  Unsuitable: string;
}) {
  switch (suitability) {
    case "Suitable":
      return Suitable;
    case "Maybe Suitable":
      return Maybe;
    case "Unsuitable":
      return Unsuitable;
    default:
      return undefined;
  }
};

export const EmailTemplate: React.FC<Readonly<GeneratedProposal & { client: string }>> = ({
  suitability,
  unsuitability_reasoning,
  proposal,
  job_summary, 
  job_url,
  client,
  title
}) => (
  <div>
    <>
      <h1>New Upwork Job Available for {client}</h1>
      <div style={{
          paddingTop: `4px`, 
          paddingBottom: `4px`,
          paddingLeft: `8px`,
          paddingRight: `8px`,
          borderRadius: `50px`,
          fontWeight: `bold`,
          fontSize: `0.75rem`,
          backgroundColor: suitable(suitability, {
            Suitable: `#f0fdf4`,
            Maybe: `#fffbeb`,
            Unsuitable: `#fef2f2`,
          }),
          width: `min-content`,
          color: suitable(suitability, {
            Suitable: `#34d399`,
            Maybe: `#b45309`,
            Unsuitable: `#ef4444`,
          }),
          borderColor: suitable(suitability, {
            Suitable: `#34d399`,
            Maybe: `#b45309`,
            Unsuitable: `#ef4444`,
          }),
          borderStyle: `solid`,
          borderWidth: `1px`,
        }}>
        <div style={{width: "auto", whiteSpace: "nowrap"}}>{suitability}</div>
      </div>
      {unsuitability_reasoning && <p>{unsuitability_reasoning}</p>}
      <br/>
      <h2>Job Summary</h2>
      <p>{job_summary}</p>
      <br/>
      <h2>Proposal</h2>
      <p>{proposal}</p>
      <br/>
      <a 
        href={job_url}
        style={{
          paddingTop: `8px`,
          paddingBottom: `8px`,
          paddingLeft: `16px`,
          paddingRight: `16px`,
          borderRadius: `4px 4px 4px 4px`,
          overflow: `hidden`,
          fontSize: `1.125rem`,
          backgroundColor: `#000`,
          color: `#ffffff`,
          borderColor: `#000`,
          borderStyle: `solid`,
          borderWidth: `1px`,
          textDecoration: `none`,
          marginTop: `16px`,
        }}
      >View job</a>
      <br/>
    </>
  </div>
);