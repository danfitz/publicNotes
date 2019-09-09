import React, { Component } from 'react';
import firebase from "../firebase.js";
import Editor from "./Editor.js";
import NotesList from "./NotesList.js";
import Blog from "./Blog.js";

import {
  BrowserRouter as Router,
  Route,
  NavLink
} from "react-router-dom";

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
    // Auth state conditional logic
    auth.onAuthStateChanged(async (user) => {
      // IF there is a logged in authorized user,
      // THEN sync to that user's node in Firebase
      if (user) {
        this.syncNotes(`users/${user.uid}`);

        this.setState({
          user,
          userNode: `users/${user.uid}` 
        });
      // OTHERWISE the user is anonymous,
      // SO create a new anonymous user node in Firebase
      } else {
        const anonymousUser = await firebase.database().ref("anonymous").push("");

        this.syncNotes(`anonymous/${anonymousUser.key}`);

        this.setState({
          user: "anonymous",
          userNode: `anonymous/${anonymousUser.key}`
        });
      };
    });

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
  };

  // Method to sync notes to given user node in Firebase
  syncNotes = (newUserNode) => {
    // Turn off previous Firebase event listener IF there was one before
    if (this.state.userNode) {
      firebase.database().ref(this.state.userNode).off("value");
    };

    // Start new Firebase event listener to constantly grab notes in database
    const userRef = firebase.database().ref(newUserNode);
    
    userRef.on("value", (response) => {
      const data = response.val();
  
      const notesArray = [];
  
      for (let key in data) {
        notesArray.push({
          id: key,
          title: data[key].title,
          text: data[key].text,
          published: data[key].published,
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

  // Method that stores a selected note in state to be used when deleting or editing a note
  // NOTE: Gets passed to child components
  selectNote = (noteId) => {
    this.setState({
      currentNoteId: noteId,
      // fullScreen: !this.state.fullScreen
    });
  };

  // Method that toggles full screen state (and re-renders how page is displayed)
  toggleFullScreen = () => {
    this.setState({
      fullScreen: !this.state.fullScreen
    });
  };

  // Method for logging in
  // NOTE: This deletes the anonymous user that gets created automatically
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

  // Method for logging out
  logout = () => {
    auth.signOut()
      .then(() => {
        this.setState({
          user: "anonymous"
        });
      });
  };

  // Method for conditionally rendering login and logout on page
  renderAuth = () => {
    if (this.state.user !== "anonymous" && this.state.user !== null) {
      return (
        <div className="authContainer">
          <Button
            className="logout"
            variant="outlined"
            size="small"
            onClick={this.logout}
          >
            Log Out
          </Button>
          <p className="authStatus">Hi, {this.state.user.displayName}!</p>
        </div>
      );
    } else {
        return (
          <div className="authContainer">
            <Button
              className="login"
              variant="outlined"
              size="small"
              onClick={this.login}
            >
              Log In
            </Button>
            <p className="authStatus">Log in via Google to start saving notes.</p>
          </div>
        );
    };
  };

  render() {
    return (
      <Router>
        <div className="app">
          <header className={this.state.fullScreen ? "collapsed" : ""}>
            <div className="headerWrapper wrapper">
              <h1>Public Notes</h1>

              {this.renderAuth()}

              {this.state.user ? 
                <NavLink to={`/${this.state.user.uid}`}>Blog</NavLink> :
                ""
              }
              <NavLink to="/">Notes</NavLink>

              <NotesList
                currentNoteId={this.state.currentNoteId}
                selectNote={this.selectNote}
                notes={this.state.notes}
                userNode={this.state.userNode}
              />
            </div>
          </header>

          <main className={this.state.fullScreen ? "fullScreen" : ""}>
            <div className="wrapper">
              <Route path="/:userId" render={ (props) => {
                return (
                  <Blog {...props} />
                );
              }} />

              <Route exact path="/" render={ () => {
                return (
                  <Editor
                    currentNoteId={this.state.currentNoteId}
                    selectNote={this.selectNote}
                    userNode={this.state.userNode}
                  />
                );
              }} />
            </div>
          </main>

          {this.state.fullScreen ?
            <FullscreenExit className="fullScreenToggle" onClick={this.toggleFullScreen} /> :
            <Fullscreen className="fullScreenToggle" onClick={this.toggleFullScreen} />
          }
        </div>
      </Router>
    );
  };
};

export default App;
