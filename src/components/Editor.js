import React, { Component } from "react";
import firebase from "../firebase.js";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      text: "",
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
        const noteRef = firebase.database().ref(`${this.props.userNode}/${this.props.currentNoteId}`);

        noteRef.once("value", response => {
          const data = response.val();

          this.setState({
            title: data.title,
            text: data.text,
            saved: true
          });
        });

      // OTHERWISE the selected note was cleared (updated to null)...
      // SO clear state
      } else {
        this.setState({
            title: "",
            text: "",
            saved: false
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
      text: this.state.text,
    };

    if (this.props.currentNoteId) {
      const noteRef = firebase.database().ref(`${this.props.userNode}/${this.props.currentNoteId}`);

      noteRef.update(noteObject);

    } else {
      const userRef = firebase.database().ref(this.props.userNode);

      userRef
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
      <section className="editor">
        <p className="saveStatus">{ this.state.saved && this.props.currentNoteId ? "Saved" : "Autosaves when you stop typing..." }</p>

        <label htmlFor="titleInput" className="visuallyHidden">
          Text input for title of note
        </label>
        <input
          className="titleInput"
          id="titleInput"
          type="text"
          name="title"
          placeholder="New Note"
          value={this.state.title}
          onChange={this.handleChange}
        />

        <label htmlFor="textInput" className="visuallyHidden">
          Text input for text of note
        </label>
        <TextareaAutosize
          className="textInput"
          id="textInput"
          name="text"
          placeholder="Start writing..."
          value={this.state.text}
          onChange={this.handleChange}
        />    
      </section>
    );
  };
};

export default Editor;