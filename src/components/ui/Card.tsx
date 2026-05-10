import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
}

function Card({ highlighted, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        "bg-surface rounded-card shadow-card",
        highlighted ? "border border-green-alpine/40" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["p-4", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

export { Card, CardBody };
