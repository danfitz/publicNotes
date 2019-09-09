import React, { Component } from "react";
import firebase from "../firebase.js";
import Markdown from "markdown-to-jsx";
import "github-markdown-css/github-markdown.css";

class BlogPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null
    };
  };

  // Any time the user enters public view, this makes sure that a note is never selected!
  // componentDidMount() {
  //   this.props.selectNote(null);
  // };

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.noteId !== this.props.match.params.noteId) {
      const noteNode = `${this.props.match.params.node}/${this.props.match.params.uid}/${this.props.match.params.noteId}`;
      const noteRef = firebase.database().ref(noteNode);
  
      noteRef.once("value", response => {
        const data = response.val();
  
        this.setState({
          post: data
        });
      });
    };
  };

  conditionalRender() {
    if (this.state.post) {
      return (
        <article className="blogPost markdown-body" >
          <h2 className="postTitle">{this.state.post.title}</h2>
          <Markdown>{this.state.post.text}</Markdown>
        </article>
      );
    } else {
      return <p>Note not found</p>;
    };
  };

  render = () => this.conditionalRender();
};

export default BlogPost;