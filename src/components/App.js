import React, { Component } from 'react';
import firebase from "../firebase.js";
import Editor from "./Editor.js";
import NotesList from "./NotesList.js";
import '../styles/App.scss';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentNoteId: null,
      notes: []
    }
  }

  componentDidMount() {
    const dbRef = firebase.database().ref();

    dbRef.on("value", (response) => {
      const data = response.val();

      const notesArray = [];

      for (let key in data) {
        notesArray.push({
          id: key,
          title: data[key].title,
          body: data[key].body,
          unixTimestamp: data[key].unixTimestamp
        });
      };

      // Sort notes by newest created note first
      notesArray.sort((a, b) => a.unixTimestamp < b.unixTimestamp);
      
      this.setState({
        notes: notesArray
      });
    });
  };

  selectNote = (noteId) => {
    // console.log("selectNote ran", noteId);
    this.setState({
      currentNoteId: noteId
    });
  };

  render() {
    return (
      <main>
        <Editor currentNoteId={this.state.currentNoteId} selectNote={this.selectNote} />
        <NotesList currentNoteId={this.state.currentNoteId} notes={this.state.notes} selectNote={this.selectNote} />
      </main>
    );
  };
};

export default App;
