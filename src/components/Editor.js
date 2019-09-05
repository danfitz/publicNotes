import React, { Component } from "react";
import firebase from "../firebase.js";

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            body: ""
        };
    };

    componentDidUpdate(prevProps, prevState) {
        // Conditional flow for changes in note change selection
        if (this.props.currentNoteId !== prevProps.currentNoteId) {
            // IF user selects a new existing note...
            // THEN obtain the Firebase data and update state
            if (this.props.currentNoteId) {
                const noteRef = firebase.database().ref(this.props.currentNoteId);
        
                noteRef.once("value", response => {
                    const data = response.val();
        
                    this.setState({
                        title: data.title,
                        body: data.body
                    });
                });

            // OTHERWISE the selected note was cleared (updated to null)...
            // SO clear state
            } else {
                this.setState({
                    title: "",
                    body: ""
                });
            };
        };

        // Update Firebase database only if a note is selected AND its title or text was changed by user
        if (this.props.currentNoteId && (prevState.title !== this.state.title || prevState.body !== this.state.body)) {
            const noteRef = firebase.database().ref(this.props.currentNoteId);
            noteRef.update({
                title: this.state.title,
                body: this.state.body
            });
        };
    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {
        return (
            <section className="editor">
                <label htmlFor="title" className="visuallyHidden">
                    Text input for title of note
                </label>
                <input
                    className="title"
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Input title"
                    value={this.state.title}
                    onChange={this.handleChange}
                />

                <label htmlFor="body" className="visuallyHidden">
                    Text input for body of note
                </label>
                <textarea
                    className="body"
                    id="body"
                    name="body"
                    placeholder="Input text"
                    value={this.state.body}
                    onChange={this.handleChange}
                />
            </section>
        );
    };
};

export default Editor;