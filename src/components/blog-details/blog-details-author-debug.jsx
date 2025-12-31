import React from "react";
import Image from "next/image";
// internal
import founder_img from "@assets/img/blog/founder1.jpg";
import signature from "@assets/img/blog/signature/signature.png";
import { useGetAuthorsQuery } from "@/redux/features/authorApi";

const BlogDetailsAuthorDebug = ({ authorId = null, authorName = null }) => {
  const { data: authors, isLoading, error } = useGetAuthorsQuery();
  
  // Debug logging
  console.log("🔍 BlogDetailsAuthor Debug:");
  console.log("  - isLoading:", isLoading);
  console.log("  - error:", error);
  console.log("  - authors:", authors);
  console.log("  - authorId prop:", authorId);
  console.log("  - authorName prop:", authorName);
  
  // Get author by ID, name, or first available
  let author = null;
  if (authors?.length) {
    if (authorId) {
      author = authors.find(a => a._id === authorId);
      console.log("  - Found by ID:", author);
    } else if (authorName) {
      author = authors.find(a => a.name.toLowerCase() === authorName.toLowerCase());
      console.log("  - Found by name:", author);
    }
    // Fallback to first author if no match found
    if (!author) {
      author = authors[0];
      console.log("  - Using first author:", author);
    }
  }

  // Always show debug info at the top
  return (
    <div>
      {/* Debug Info */}
      <div style={{ 
        backgroundColor: "#ffeb3b", 
        padding: "10px", 
        margin: "10px 0", 
        borderRadius: "5px",
        fontSize: "12px",
        fontFamily: "monospace"
      }}>
        <strong>🔍 Author API Debug:</strong><br/>
        Loading: {isLoading ? "YES" : "NO"}<br/>
        Error: {error ? "YES" : "NO"}<br/>
        Authors Count: {authors?.length || 0}<br/>
        Selected Author: {author?.name || "NONE"}<br/>
        Props: authorId={authorId}, authorName={authorName}
      </div>

      {/* Original Component Logic */}
      <div
        className="tp-postbox-details-author text-center"
        style={{
          backgroundColor: "#F4F7F9",
          borderRadius: "12px",
          padding: "40px 30px",
          marginTop: "60px",
        }}
      >
        {isLoading && (
          <div className="text-center" style={{ color: "#666", fontSize: "16px" }}>
            Loading author information...
          </div>
        )}

        {error && (
          <div className="text-center" style={{ color: "#f44336", fontSize: "16px" }}>
            Error loading author: {error.message || "Unknown error"}
          </div>
        )}

        {!isLoading && !error && !author && (
          <div className="text-center" style={{ color: "#ff9800", fontSize: "16px" }}>
            No author data available
          </div>
        )}

        {!isLoading && !error && author && (
          <>
            {/* Author Image */}
            <div
              className="tp-postbox-details-author-thumb mb-25"
              style={{
                width: "120px",
                height: "120px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <Image
                src={author.authorimage || founder_img}
                alt={`${author.name} - ${author.designation}`}
                width={120}
                height={120}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* Author Details */}
            <div className="tp-postbox-details-author-content">
              <h4
                className="tp-postbox-details-author-title"
                style={{
                  fontWeight: "700",
                  color: "#0D1B39",
                  marginBottom: "6px",
                }}
              >
                {author.name} (DYNAMIC)
              </h4>
              <p
                style={{
                  fontSize: "15px",
                  color: "#5A5A5A",
                  marginBottom: "18px",
                  lineHeight: "1.5",
                }}
              >
                {author.designation}
              </p>

              <p
                style={{
                  fontSize: "15px",
                  color: "#444",
                  maxWidth: "600px",
                  margin: "0 auto 25px",
                  lineHeight: "1.7",
                }}
              >
                {author.description}
              </p>

              {/* Signature */}
              <div
                className="tp-postbox-details-author-signature"
                style={{
                  marginTop: "20px",
                }}
              >
                <Image
                  src={signature}
                  alt="Signature"
                  width={130}
                  height={40}
                  style={{
                    width: "auto",
                    height: "auto",
                    opacity: 0.9,
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogDetailsAuthorDebug;