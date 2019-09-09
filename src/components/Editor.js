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
      saved: false,
      published: false
    };
    this.timeoutId = null;
  };

  // Any time the editor is mounted, this makes sure that a note is never selected!
  componentDidMount() {
    this.props.selectNote(null);

    this.setState({
      title: "Welcome to Public Notes",
      text: "## How it Works\n1. Create a new note.\n2. Write note using [Markdown](https://www.markdownguide.org/basic-syntax/). (Guide is in the \"?\" icon above.)\n3. If you want a note to go **public**, checkmark \"Make note public\" above.\n4. A URL will appear. You can share it with anyone!\n![Public Notes GIF](https://gph.is/1sCgsZP)"
    });
  };

  componentDidUpdate(prevProps, prevState) {
    // Conditional flow for changes in selected note
    if (this.props.currentNoteId !== prevProps.currentNoteId) {
      // IF user selects a new existing note...
      // THEN obtain the Firebase data and update state
      if (this.props.currentNoteId) {
        const noteNode = `${this.props.user.node}/${this.props.user.uid}/${this.props.currentNoteId}`;

        const noteRef = firebase.database().ref(noteNode);

        noteRef.once("value", response => {
          const data = response.val();

          this.setState({
            title: data.title,
            text: data.text,
            published: data.published,
            saved: true
          });
        });

      // OTHERWISE the selected note was cleared (updated to null)...
      // SO clear state
      } else {
        this.setState({
            title: "",
            text: "",
            published: false,
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
      published: this.state.published
    };

    // IF the note being saved is the current note selected,
    // THEN save at that note's node in Firebase
    if (this.props.currentNoteId) {
      const noteNode = `${this.props.user.node}/${this.props.user.uid}/${this.props.currentNoteId}`;
      const noteRef = firebase.database().ref(noteNode);
      noteRef.update(noteObject);

    // OTHERWISE the note is new,
    // SO save the note at a new node in Firebase
    } else {
      const userRef = firebase.database().ref(`${this.props.user.node}/${this.props.user.uid}`);

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

  handleChange = change => {
    // Auto save feature: only save note when user stops typing
    // HOW IT WORKS: Clears a timeout every time the user types. The timeout only triggers this.saveNote() after 1 second of the user not typing.
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.saveNote();
    }, 1000);

    // Stores the value of Markdown text input in state
    if (typeof change === "string") {
      this.setState({
        text: change,
        saved: false
      });
    // Stores value of title input in state
    } else if (change.target.name === "title") {
      this.setState({
        title: change.target.value,
        saved: false
      });
    // Stores value of published input in state
    } else if (change.target.name === "published") {
      this.setState({
        published: change.target.checked,
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

        <div className="publishContainer">
          <input
            className="publishInput"
            id="publishInput"
            type="checkbox"
            name="published"
            checked={ this.state.published ? "checked" : "" }
            onChange={this.handleChange}
          />
          <label htmlFor="publishInput"> Make note public</label>
        </div>

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
            promptURLs: true,
            hideIcons: ["side-by-side", "fullscreen"]
          }}
        />
      </section>
    );
  };
};

export default Editor;