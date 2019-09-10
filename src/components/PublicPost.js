import React, { Component } from "react";
import firebase from "../firebase.js";
import Markdown from "markdown-to-jsx"; // converts markdown to JSX
import "github-markdown-css/github-markdown.css"; // markdown styling

class PublicPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null
    };
  };

  // Get note upon mount
  componentDidMount() {
    this.getNote();
  };

  // Get note provided a new note was selected
  componentDidUpdate(prevProps) {
    if (prevProps.match.params.noteId !== this.props.match.params.noteId) {
      this.getNote();
    };
  };

  // Method for getting note data from Firebase (based on params)
  getNote = () => {
    const noteNode = `${this.props.match.params.node}/${this.props.match.params.uid}/${this.props.match.params.noteId}`;
    const noteRef = firebase.database().ref(noteNode);

    noteRef.once("value", response => {
      const data = response.val();

      // ONLY store note into state IF it exists and it's been published
      if (data && data.published) {
        this.props.selectNote(this.props.match.params.noteId); // NEEDS COMMENTING
        this.setState({
          post: data
        });
      };
    });
  };

  // Conditionally render post IF post data was successfully added to state
  conditionalRender() {
    if (this.state.post) {
      return (
        <article className="publicPost markdown-body" >
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

export default PublicPost;