import React from "react";
import parse, { domToReact, Element } from "html-react-parser";

const renderAnswerWithCitations = (
  answer,
  setHoveredIndex,
  handleMouseEnter
) => {
  // Preprocess the answer, remove code block tags
  const processedAnswer = answer
    .replace(/^```html\n/, "")
    .replace(/\n```$/, "")
    .replace(/\(source \d+\)/g, "")
    .replace(/\(\d+\)/g, "");

  const options = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        switch (domNode.name) {
          case "ul":
            return (
              <ul className="list-disc pl-5 my-2 space-y-1">
                {domToReact(domNode.children, options)}
              </ul>
            );
          case "ol":
            return (
              <ol className="list-decimal pl-5 my-2 space-y-1">
                {domToReact(domNode.children, options)}
              </ol>
            );
          case "li":
            return (
              <li className="mb-1">{domToReact(domNode.children, options)}</li>
            );
          case "p":
            return (
              <p className="mb-2">{domToReact(domNode.children, options)}</p>
            );
          case "strong":
            return (
              <strong className="font-bold">
                {domToReact(domNode.children, options)}
              </strong>
            );
          case "em":
            return (
              <em className="italic">
                {domToReact(domNode.children, options)}
              </em>
            );
          case "a":
            return (
              <a
                href={domNode.attribs.href}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {domToReact(domNode.children, options)}
              </a>
            );
          case "blockquote":
            return (
              <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic">
                {domToReact(domNode.children, options)}
              </blockquote>
            );
          case "sup":
            const content = domToReact(domNode.children, options);
            const match = content.match(/\[(\d+)\]/i);
            if (match) {
              const citationNumber = match[1] || match[2];
              const citationIndex = parseInt(citationNumber, 10) - 1;
              return (
                <button
                  // key={`citation-${citationNumber}`}
                  onMouseEnter={(event) => {
                    handleMouseEnter(event);
                    setHoveredIndex(citationIndex);
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="btn btn-circle btn-xs bg-base-300 text-neutral hover:bg-secondary-color"
                >
                  {citationNumber}
                </button>
              );
            }
            return <sup>{content}</sup>;
          default:
            return undefined;
        }
      }
    },
  };
  return parse(processedAnswer, options);
};

export default renderAnswerWithCitations;
