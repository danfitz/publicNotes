import React, { Component } from "react";
import firebase from "../firebase.js";
import SimpleMDEReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Welcome to Public Notes!",
      text: "Public Notes is a [Markdown](https://www.markdownguide.org/basic-syntax/) notetaking app with the ability to share notes publicly.\n\n### Instructions\n\nClick **make note public**, and a live link will be generated, which you can *share with anyone*.\n\nEvery user has a unique page displaying all their public notes too. Just click **Switch to public view** in the sidebar to see yours.\n\n![Start writing!](https://media.giphy.com/media/KyGiMJokZEQvu/giphy.gif)",
      saved: false,
      published: false
    };
    this.timeoutId = null;
  };

  componentDidMount() {
    // When component first mounts, this ensures no note is ever selected!
    this.props.selectNote(null);
  };

  componentDidUpdate(prevProps) {
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
          initialValue=""
          value={this.state.title}
          onChange={this.handleChange}
        />

        <p className="saveStatus">
          { this.state.saved && this.props.currentNoteId ? <span className="saved">Saved</span> : "Unsaved" }
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