import React, { Component } from "react";
import firebase from "../firebase.js";
import Markdown from "markdown-to-jsx";
import "github-markdown-css/github-markdown.css";

class Blog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publishedNotes: []
    };
  };

  componentDidMount() {
    const userRef = firebase.database().ref(`users/${this.props.match.params.userId}`);
  
    userRef.on("value", (response) => {
      const data = response.val();
  
      const notesArray = [];
    
      for (let key in data) {
        if (data[key].published) {
          notesArray.push({
            id: key,
            title: data[key].title,
            text: data[key].text,
            createdTimestamp: data[key].createdTimestamp
          });
        };
      };
  
      // Sort notes by newest created note first
      notesArray.sort((a, b) => a.createdTimestamp < b.createdTimestamp);
      
      this.setState({
        publishedNotes: notesArray
      });
    });
  };

  render() {
    return (
      <section className="blogPosts">
        {this.state.publishedNotes.map(post => {
          return (
            <article className="blogPost markdown-body" key={post.id}>
              <h2 className="postTitle">{post.title}</h2>
              <Markdown>{post.text}</Markdown>
            </article>
          );
        })}
      </section>
    );
  };
};

export default Blog;