import React, { Component } from "react";
import firebase from "../firebase.js";
import { NavLink } from "react-router-dom";
import { AddCircleOutlined, HighlightOff, Public } from "@material-ui/icons";

class NotesList extends Component {
  constructor(props) {
    super(props);
  };

  // Method for adding a new note at the current user node
  addNewNote = () => {
    const userRef = firebase.database().ref(`${this.props.user.node}/${this.props.user.uid}`);

    userRef.push({
      title: "",
      text: "",
      published: false,
      createdTimestamp: Date.now() // timestamp!
    }).then(newNote => {
      this.props.selectNote(newNote.key); // selecting new note!
    });
  };

  // Method for deleting a note at the current user node
  deleteNote = (noteId) => {
    if (window.confirm("This will delete your note permanently.")) {
      this.props.selectNote(null); // deselects note
      
      const noteNode = `${this.props.user.node}/${this.props.user.uid}/${noteId}`;
      const noteRef = firebase.database().ref(noteNode);
      noteRef.remove();
    };
  };

  // Method for converting timestamp to YYYY/M/D H:M datetime format
  convertToDate = (timestamp) => {
    const date = new Date(timestamp);
    return `Created: ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}, ${date.getHours()}:${date.getMinutes()}`;
  };

        
  
  render() {
    return (
      <section className="notesList">
        <div className="notesListHeader">
          <h2>List of Notes</h2>
          <AddCircleOutlined onClick={this.addNewNote} className="addNote" aria-label="Add new note" tabIndex="0" />
          <div className="toggleView">
            <NavLink to={`/${this.props.user.node}/${this.props.user.uid}`}><Public /> View My Public Feed</NavLink>
          </div>
        </div>
        
        <ul tabIndex="-1">
          {this.props.notes.map(note => {
            return (
              <li key={note.id}>
                <article
                  tabIndex="0"
                  // Conditional rendering of selected class IF note is currently selected
                  className={`note ${this.props.currentNoteId === note.id ? "selected" : ""}`}
                  onClick={() => this.props.selectNote(note.id)}
                >
                  <HighlightOff
                    aria-label="Delete note"
                    tabIndex="0"
                    className="deleteNote"
                    onClick={(event) => {
                      event.stopPropagation();
                      this.deleteNote(note.id);
                    }}
                  />
                  <h3 className="noteTitle">
                    {/* Renders live tag conditionally */}
                    { note.published ? <span className="liveIcon">Live: </span> : null }
                    {/* Renders "New Note" title if title empty */}
                    { note.title ? note.title : "Untitled Note" }
                  </h3>
                  <p className="noteText">
                    {/* Note text is only first 20 characters if text not empty */}
                    { note.text ? note.text.trim().substring(0, 30) + (note.text.trim().length > 30 ? "..." : "") : "Empty Text" }
                  </p>
                  <p className="noteCreateDate">{ this.convertToDate(note.createdTimestamp) }</p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
};

export default NotesList;