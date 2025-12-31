import React from "react";
import Image from "next/image";
// internal
import founder_img from "@assets/img/blog/founder1.jpg";
import signature from "@assets/img/blog/signature/signature.png";
import { useGetAuthorsQuery } from "@/redux/features/authorApi";

const BlogDetailsAuthor = ({ authorId = null, authorName = null }) => {
  const { data: authors, isLoading, error } = useGetAuthorsQuery();
  
  // Get author by ID, name, or first available
  let author = null;
  if (authors?.length) {
    if (authorId) {
      author = authors.find(a => a._id === authorId);
    } else if (authorName) {
      author = authors.find(a => a.name.toLowerCase() === authorName.toLowerCase());
    }
    // Fallback to first author if no match found
    if (!author) {
      author = authors[0];
    }
  }

  if (isLoading) {
    return (
      <div
        className="tp-postbox-details-author text-center"
        style={{
          backgroundColor: "#F4F7F9",
          borderRadius: "12px",
          padding: "40px 30px",
          marginTop: "60px",
        }}
      >
        <div className="text-center" style={{ color: "#666", fontSize: "16px" }}>
          Loading author information...
        </div>
      </div>
    );
  }

  if (error || !author) {
    // Fallback to static content if API fails
    return (
      <div
        className="tp-postbox-details-author text-center"
        style={{
          backgroundColor: "#F4F7F9",
          borderRadius: "12px",
          padding: "40px 30px",
          marginTop: "60px",
        }}
      >
        {/* Founder Image */}
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
            src={founder_img}
            alt="Rajesh Goyal - Founder"
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

        {/* Founder Details */}
        <div className="tp-postbox-details-author-content">
          <h4
            className="tp-postbox-details-author-title"
            style={{
              fontWeight: "700",
              color: "#0D1B39",
              marginBottom: "6px",
            }}
          >
            Rajesh Goyal
          </h4>
          <p
            style={{
              fontSize: "15px",
              color: "#5A5A5A",
              marginBottom: "18px",
              lineHeight: "1.5",
            }}
          >
            Founder & Managing Director, <strong>Amrita Global Enterprises</strong>
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
            Leading <strong>Amrita Global Enterprises</strong>, Rajesh Goyal has
            built a legacy of trust and innovation in premium textile
            manufacturing. With a passion for quality fabrics and sustainable
            design, he continues to redefine modern fabric sourcing for global
            apparel brands.
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
      </div>
    );
  }
  // Dynamic content from API
  return (
    <div
      className="tp-postbox-details-author text-center"
      style={{
        backgroundColor: "#F4F7F9",
        borderRadius: "12px",
        padding: "40px 30px",
        marginTop: "60px",
      }}
    >
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
          {author.name}
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

        {/* Signature - Keep static for now */}
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
    </div>
  );
};

export default BlogDetailsAuthor;
