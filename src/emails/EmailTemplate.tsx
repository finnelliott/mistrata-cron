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
    case "Maybe":
      return Maybe;
    case "Unsuitable":
      return Unsuitable;
    default:
      return undefined;
  }
};

export const EmailTemplate: React.FC<Readonly<GeneratedProposal & { name: string }>> = ({
  suitability,
  unsuitability_reasoning,
  proposal,
  job_summary, 
  job_url,
  name,
}) => (
  <div>
    <>
      <h1>New Upwork Job Available for {name}</h1>
      <p style={{
        paddingTop: `8px`, 
        paddingBottom: `8px`,
        paddingLeft: `16px`,
        paddingRight: `16px`,
        borderRadius: `50px`,
        fontSize: `0.75rem`,
        backgroundColor: suitable(suitability, {
          Suitable: `#f0fdf4`,
          Maybe: `#fffbeb`,
          Unsuitable: `#fef2f2`,
        }),
        color: suitable(suitability, {
          Suitable: `#34d399`,
          Maybe: `#fbbf24`,
          Unsuitable: `#ef4444`,
        }),
        borderColor: suitable(suitability, {
          Suitable: `#34d399`,
          Maybe: `#fbbf24`,
          Unsuitable: `#ef4444`,
        }),
        borderStyle: `solid`,
        borderWidth: `1px`,
      }}>{suitability}</p>
      {unsuitability_reasoning && <p>{unsuitability_reasoning}</p>}
      <h2>Job Summary</h2>
      <p>{job_summary}</p>
      <h2>Proposal</h2>
      <p>{proposal}</p>
      <a 
        href={job_url}
        style={{
          paddingTop: `8px`,
          paddingBottom: `8px`,
          paddingLeft: `16px`,
          paddingRight: `16px`,
          borderRadius: `4px`,
          fontSize: `1.125rem`,
          backgroundColor: `#000`,
          color: `#ffffff`,
          borderColor: `#000`,
          borderStyle: `solid`,
          borderWidth: `1px`,
          textDecoration: `none`,
        }}
      ><button>View job</button></a>
    </>
  </div>
);