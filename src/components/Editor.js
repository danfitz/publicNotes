import React, { Component } from "react";
import firebase from "../firebase.js";

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      body: "",
      saved: true
    };
    this.timeoutId = null;
  };

  componentDidUpdate(prevProps, prevState) {
    // Conditional flow for changes in note change selection
    if (this.props.currentNoteId !== prevProps.currentNoteId) {
      // IF user selects a new existing note...
      // THEN obtain the Firebase data and update state
      if (this.props.currentNoteId) {
        const noteRef = firebase.database().ref(this.props.currentNoteId);

        noteRef.once("value", response => {
          const data = response.val();

          this.setState({
            title: data.title,
            body: data.body
          });
        });

      // OTHERWISE the selected note was cleared (updated to null)...
      // SO clear state
      } else {
        this.setState({
            title: "",
            body: ""
        });
      };
    };
  };

  // submitSave = event => {
  //   event.preventDefault();
  //   this.saveNote();
  // };

  saveNote = () => {
    const noteObject = {
      title: this.state.title,
      body: this.state.body,
    };

    if (this.props.currentNoteId) {
      const noteRef = firebase.database().ref(this.props.currentNoteId);

      noteRef.update(noteObject);

    } else {
      const dbRef = firebase.database().ref();

      dbRef
        .push({
          createdTimestamp: Date.now(),
          ...noteObject
        })
        .then(newNote => {
            this.props.selectNote(newNote.key);
        });
    };

    this.setState({
      saved: true
    });
  };

  handleChange = event => {
    // Auto save feature: only save note when user stops typing
    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.saveNote();
    }, 1000);

    this.setState({
      [event.target.name]: event.target.value,
      saved: false
    });
  };

  render() {
    return (
      <main className={ this.props.fullScreen ? "fullScreen" : ""}>
        <div className="wrapper">
          <section className="editor">
            <p>{ this.state.saved ? "Saved" : "Autosaves when you stop typing..." }</p>
            <label htmlFor="title" className="visuallyHidden">
              Text input for title of note
            </label>
            <input
              className="title"
              id="title"
              type="text"
              name="title"
              placeholder="Input title"
              value={this.state.title}
              onChange={this.handleChange}
            />

            <label htmlFor="body" className="visuallyHidden">
              Text input for body of note
            </label>
            <textarea
              className="body"
              id="body"
              name="body"
              placeholder="Input text"
              value={this.state.body}
              onChange={this.handleChange}
            />
          </section>
        </div>
      </main>
    );
  };
};

export default Editor;