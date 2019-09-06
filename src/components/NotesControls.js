import React, { Component } from "react";
import firebase from "../firebase.js";

class NotesControls extends Component {
  constructor(props) {
    super(props);
  };

  addNewNote = () => {
    const dbRef = firebase.database().ref();

    dbRef.push({
      title: "",
      text: "",
      createdTimestamp: Date.now()
    }).then(newNote => {
      this.props.selectNote(newNote.key);
    });

    // console.log(newNoteRef);
    // this.props.selectNote(newNoteRef.key);
  };

  deleteNote = (noteId) => {
    this.props.selectNote(null);
    
    console.log("I'm deleting...", noteId);
    const noteRef = firebase.database().ref(noteId);
    noteRef.remove();
  }

  convertToDate = (timestamp) => {
    const date = new Date(timestamp);
    return `Created: ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}, ${date.getHours()}:${date.getMinutes()}`;
  };
  
  render() {
    return (
      <header className= { this.props.fullScreen ? "collapsed" : "" }>
        <div className="wrapper">
          <div className="notesControls">
            <h1>Note App</h1>
            <button onClick={this.addNewNote}>Add New Note</button>
            <section className="notesList">
              <h2>List of Notes</h2>
              <ul>
                {this.props.notes.map(note => {
                  return (
                    <li key={note.id}>
                      <article
                        className={`note ${this.props.currentNoteId === note.id ? "selected" : ""}`}
                        onClick={() => this.props.selectNote(note.id)}
                      >
                        <h3>
                          { note.title ? note.title : "New Note" }
                        </h3>
                        <p>
                          { note.text ? note.text.substring(0, 10) + (note.text.length > 10 ? "..." : "") : "Empty Note" }
                        </p>
                        <p>{ this.convertToDate(note.createdTimestamp) }</p>
                        <p>ID: {note.id}</p>
                      </article>
                      <button onClick={() => this.deleteNote(note.id)}>Delete</button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </header>
    );
  }
};

export default NotesControls;