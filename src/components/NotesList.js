import React, { Component } from "react";
import firebase from "../firebase.js";

class NotesList extends Component {
  constructor(props) {
    super(props);
  };
  
  addNewNote = () => {
    const dbRef = firebase.database().ref();

    const newNoteRef = dbRef.push({
      title: "",
      body: ""
    });

    this.props.selectNote(newNoteRef.key);
  };

  deleteNote = (noteId) => {
    this.props.selectNote(null);
    
    console.log("I'm deleting...", noteId);
    const noteRef = firebase.database().ref(noteId);
    noteRef.remove();
  }

  render() {
    return (
      <aside className="notesList">
        <h2>List of Notes</h2>
        <ul className="notes">
          {this.props.notes.map(note => {
            return (
              <li key={note.id}>
                <article
                  className="note"
                  onClick={() => this.props.selectNote(note.id)}
                >
                  <h3>
                    { note.title ? note.title : "Untitled Note" }
                  </h3>
                  <p>
                    { note.body ? note.body : "Empty Note" }
                  </p>
                </article>
                <button onClick={() => this.deleteNote(note.id)}>Delete</button>
              </li>
            );
          })}
        </ul>
        <button onClick={this.addNewNote}>Add New Note</button>
      </aside>
    );
  }
};

export default NotesList;