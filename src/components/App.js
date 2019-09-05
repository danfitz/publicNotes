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
          body: data[key].body
        });
      };
      
      this.setState({
        notes: notesArray
      });
    });
  };

  onNoteClick = (noteId) => {
    this.setState({
      currentNoteId: noteId
    });
  };

  render() {
    return (
      <main>
        <Editor currentNoteId={this.state.currentNoteId} />
        <NotesList notes={this.state.notes} onNoteClick={this.onNoteClick} />
      </main>
    );
  };
};

export default App;
