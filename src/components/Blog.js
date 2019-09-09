import React from "react";
import Markdown from "markdown-to-jsx";
import "github-markdown-css/github-markdown.css";

function Blog(props) {
  const publishedNotes = props.notes.filter(post => post.published);
  
  return (
    <section className="blogPosts">
      {publishedNotes.length ? publishedNotes.map(post => {
        return (
          <article className="blogPost markdown-body" key={post.id}>
            <h2 className="postTitle">{post.title}</h2>
            <Markdown>{post.text}</Markdown>
          </article>
        );
      }) : <p>No Notes Found</p> }
    </section>
  );
};

export default Blog;