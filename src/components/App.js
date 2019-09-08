import React, { Component } from 'react';
import firebase from "../firebase.js";
import Editor from "./Editor.js";
import NotesControls from "./NotesControls.js";
import '../styles/App.scss';
import { Fullscreen, FullscreenExit } from "@material-ui/icons";
import { Button } from "@material-ui/core";

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      userNode: null,
      currentNoteId: null,
      notes: [],
      fullScreen: false
    }
  }

  componentDidMount() {
    // EVENT LISTENER:
    // If user is anonymous, delete their unique record when they leave the site or refresh
    window.addEventListener('beforeunload', (event) => {
      if (this.state.user === "anonymous") {
        const anonymousRef = firebase.database().ref(this.state.userNode);
        anonymousRef.remove();
      };

      //beforeunload needs to return something, so delete the return to work in chrome
      delete event['returnValue'];
    });

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("I'm changing to real user!");

        this.syncNotes(`users/${user.uid}`);

        this.setState({
          user,
          userNode: `users/${user.uid}` 
        });
      } else {
        console.log("I'm changing to anonymous user!");
        const anonymousUser = await firebase.database().ref("anonymous").push("");

        this.syncNotes(`anonymous/${anonymousUser.key}`);

        this.setState({
          user: "anonymous",
          userNode: `anonymous/${anonymousUser.key}`
        });
      };
    });
  };

  syncNotes = (newUserNode) => {
    console.log("I'm syncing to...", newUserNode);
    console.log("and turning off...", this.state.userNode);
    // Turn off previous event listener IF there was one before
    if (this.state.userNode) {
      firebase.database().ref(this.state.userNode).off("value");
    };

    // Start new event listener
    const userRef = firebase.database().ref(newUserNode);
    
    userRef.on("value", (response) => {
      const data = response.val();
  
      const notesArray = [];
  
      for (let key in data) {
        notesArray.push({
          id: key,
          title: data[key].title,
          text: data[key].text,
          createdTimestamp: data[key].createdTimestamp
        });
      };
  
      // Sort notes by newest created note first
      notesArray.sort((a, b) => a.createdTimestamp < b.createdTimestamp);
      
      this.setState({
        notes: notesArray
      });
    });
  };

  selectNote = (noteId) => {
    this.setState({
      currentNoteId: noteId
    });
  };

  toggleFullScreen = () => {
    this.setState({
      fullScreen: !this.state.fullScreen
    });
  };

  login = () => {
    auth.signInWithPopup(provider)
      .then((result) => {
        const anonymousRef = firebase.database().ref(this.state.userNode);
        anonymousRef.remove();

        const user = result.user;
        this.setState({
          user
        });
      });
  };

  logout = () => {
    auth.signOut()
      .then(() => {
        this.setState({
          user: "anonymous"
        });
      });
  };

  render() {
    return (
      <div className="app">
        <header className={this.state.fullScreen ? "collapsed" : ""}>
          <div className="wrapper">
            <h1>Public Notes</h1>
            {this.state.user !== "anonymous" && this.state.user !== null ? <p>Not {this.state.user.displayName}?<br /><br /><Button variant="outlined" color="secondary" onClick={this.logout}>Log Out</Button></p> : <p>Anonymous User<br /><br /><Button variant="outlined" color="primary" onClick={this.login}>Log In</Button></p> }
            <NotesControls
              currentNoteId={this.state.currentNoteId}
              selectNote={this.selectNote}
              notes={this.state.notes}
              userNode={this.state.userNode}
            />
          </div>
        </header>
        <main className={this.state.fullScreen ? "fullScreen" : ""}>
          <div className="wrapper">
            <Editor
              currentNoteId={this.state.currentNoteId}
              selectNote={this.selectNote}
              userNode={this.state.userNode}
            />
          </div>
        </main>
        {this.state.fullScreen ?
          <FullscreenExit className="fullScreenToggle" onClick={this.toggleFullScreen} /> :
          <Fullscreen className="fullScreenToggle" onClick={this.toggleFullScreen} />
        }
      </div>
    );
  };
};

export default App;
