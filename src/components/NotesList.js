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
      createdTimestamp: Date.now()
    }).then(newNote => {
      this.props.selectNote(newNote.key);
    });
  };

  // Method for deleting a note at the current user node
  deleteNote = (noteId) => {
    if (window.confirm("This will delete your note permanently.")) {
      this.props.selectNote(null);
      
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

  conditionalPublicRender = () => {
    if (this.props.user) {
      return (
        <div className="toggleView">
          <NavLink to={`/${this.props.user.node}/${this.props.user.uid}`}><Public /> Switch to Public View</NavLink>
        </div>
      );
    };
  };
  
  render() {
    return (
      <section className="notesList">
        <div className="notesListHeader">
          <h2>List of Notes</h2>
          <AddCircleOutlined onClick={this.addNewNote} className="addNote" aria-label="Add new note" tabIndex="0" />
          {this.conditionalPublicRender()}
        </div>
        <ul tabIndex="-1">
          {this.props.notes.map(note => {
            return (
              <li key={note.id}>
                <article
                  tabIndex="0"
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
            { note.published ? <span className="liveIcon">Live: </span> : null }
                    { note.title ? note.title : "New Note" }
                  </h3>
                  <p className="noteText">
                    { note.text ? note.text.substring(0, 20).trim() + (note.text.trim().length > 20 ? "..." : "") : "Empty Note" }
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