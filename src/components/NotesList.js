import React, { Component } from "react";
import firebase from "../firebase.js";
import { AddCircleOutlined, HighlightOff } from "@material-ui/icons";

class NotesList extends Component {
  constructor(props) {
    super(props);
  };

  // Method for adding a new note at the current user node
  addNewNote = () => {
    const userRef = firebase.database().ref(this.props.userNode);

    userRef.push({
      title: "",
      text: "",
      published: true,
      createdTimestamp: Date.now()
    }).then(newNote => {
      this.props.selectNote(newNote.key);
    });
  };

  // Method for deleting a note at the current user node
  deleteNote = (noteId) => {
    if (window.confirm("This will delete your note permanently.")) {
      this.props.selectNote(null);
      
      const noteRef = firebase.database().ref(`${this.props.userNode}/${noteId}`);
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
          <AddCircleOutlined onClick={this.addNewNote} className="addNote" />
        </div>
        <ul>
          {this.props.notes.map(note => {
            return (
              <li key={note.id}>
                <article
                  className={`note ${this.props.currentNoteId === note.id ? "selected" : ""}`}
                  onClick={() => this.props.selectNote(note.id)}
                >
                  <HighlightOff
                    className="deleteNote"
                    onClick={(event) => {
                      event.stopPropagation();
                      this.deleteNote(note.id);
                    }} 
                  />
                  <h3 className="noteTitle">
                    { note.title ? note.title : "New Note" }
                  </h3>
                  <p className="noteText">
                    { note.text ? note.text.substring(0, 10).trim() + (note.text.trim().length > 10 ? "..." : "") : "Empty Note" }
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