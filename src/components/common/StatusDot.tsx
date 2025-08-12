import React from "react";

type Props = { status: "active" | "error" | "idle"; };

const StatusDot: React.FC<Props> = ({ status }) => {
  const cls = status === "active" ? "bg-state-green" : status === "error" ? "bg-state-red" : "bg-state-gray";
  return <span aria-label={status} className={`inline-block h-2 w-2 rounded-full ${cls}`} />;
};

export default StatusDot;
