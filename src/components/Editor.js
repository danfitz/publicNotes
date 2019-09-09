import React, { Component } from "react";
import firebase from "../firebase.js";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

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

  // Method for conditionally updating notes in Firebase
  saveNote = () => {
    const noteObject = {
      title: this.state.title,
      text: this.state.text,
    };


    // IF the note being saved is the current note selected,
    // THEN save at that note's node in Firebase
    if (this.props.currentNoteId) {
      const noteRef = firebase.database().ref(`${this.props.userNode}/${this.props.currentNoteId}`);
      noteRef.update(noteObject);

    // OTHERWISE the note is new,
    // SO save the note at a new node in Firebase
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

    // Update state to reflect the fact that the note is saved
    this.setState({
      saved: true
    });
  };

  handleChange = event => {
    // Auto save feature: only save note when user stops typing
    // HOW IT WORKS: Clears a timeout every time the user types. The timeout only triggers this.saveNote() after 1 second of the user not typing.
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.saveNote();
    }, 1000);

    // Stores value of title input in state
    if (event.target) {
      this.setState({
        [event.target.name]: event.target.value,
        saved: false
      });
    // Stores the value of Markdown text input in state
    } else {
      this.setState({
        text: event,
        saved: false
      });
    };
  };

  render() {
    return (
      <section className="editor">
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

        <p className="saveStatus">
          { this.state.saved && this.props.currentNoteId ? <span className="saved">Saved</span> : "Auto-saves when you stop writing" }
        </p>

        <label htmlFor="textInput" className="visuallyHidden">
          Text input for text of note
        </label>
        <SimpleMDE
          className="textInput"
          id="textInput"
          onChange={this.handleChange}
          value={this.state.text}
          options={{
            placeholder: "Start writing...",
            promptURLs: true
          }}
        />
      </section>
    );
  };
};

export default Editor;