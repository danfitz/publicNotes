import React, { Component } from "react";
import firebase from "../firebase.js";
// Markdown editor component
import SimpleMDEReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Starting instructions on mount!
      title: "Welcome to Public Notes!",
      text: `Public Notes is a [Markdown](https://www.markdownguide.org/basic-syntax/) notetaking app with the ability to share notes publicly.\n\n*Pro tip: Click the __eye__ icon 👁️ above for a full preview.*\n\n### Instructions\n\nClick **Make Note Public** 🚀 above, and a live link will be generated, which you can *share with anyone* 👪.\n\nEvery user has a [unique page](${window.location.origin}/${this.props.user.node}/${this.props.user.uid}) displaying all their public notes too. Just click 🌎 **View My Public Feed** in the sidebar to see yours.\n\n![Start writing!](https://media.giphy.com/media/KyGiMJokZEQvu/giphy.gif)`,
      saved: false,
      published: false
    };
    // Stores timeoutId of setTimeout used below...
    this.timeoutId = null;
  };

  componentDidMount() {
    // When component first mounts, this ensures no note is ever selected!
    this.props.selectNote(null);
  };

  // This lifecycle method handles the conditional flow when notes are selected or deleted
  componentDidUpdate(prevProps) {
    // Assuming that there was a new note selected...
    if (this.props.currentNoteId !== prevProps.currentNoteId) {
      // IF user selects a new EXISTING note...
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
      // SO clear editor
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

  // Method for conditionally updating note in Firebase
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
          createdTimestamp: Date.now(), // timestamp!
          ...noteObject
        })
        .then(newNote => {
            this.props.selectNote(newNote.key); // selects new note!
        });
    };

    // Update state to reflect the fact that the note is saved in Firebase
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
          placeholder="Note Title"
          value={this.state.title}
          onChange={this.handleChange}
        />

        <p className="saveStatus">
          {/* Conditional render save status */}
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
          <label htmlFor="publishInput"> Make Note Public </label>

          {/* Conditional render of published link */}
          {this.state.published && this.state.saved ?
            <a className="publishLink" href={`${window.location.origin}/${this.props.user.node}/${this.props.user.uid}/${this.props.currentNoteId}`} target="_blank" rel="noopener noreferrer">Live Link</a> :
            null
          }
        </div>

        {/* Currently, the label below doesn't link to the SimpleMDEReact component */}
        {/* I'll have to revisit this later */}
        <label htmlFor="textInput" className="visuallyHidden">Text input for note</label>
        
        <SimpleMDEReact
          // "key" forces a re-mount when new note selected, fixing a bug with SimpleMDEReact
          // where moving between notes doesn't update the text on screen
          key={this.props.currentNoteId} 
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