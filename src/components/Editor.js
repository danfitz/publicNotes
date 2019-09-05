import React, { Component } from "react";
import firebase from "../firebase.js";

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            title: "",
            body: ""
        };
    };

    componentDidUpdate() {
        if (this.props.currentNoteId !== this.state.id) {
            const noteRef = firebase.database().ref(this.props.currentNoteId);

            noteRef.on("value", response => {
                const data = response.val();

                this.setState({
                    id: this.props.currentNoteId,
                    title: data.title,
                    body: data.body
                });
            });
        };
        // const noteObject = {
        //     title: this.state.title,
        //     body: this.state.body
        // };

        // if (this.state.id) {
        //     dbRef.child(this.state.id).set(noteObject);
        // } else {
        //     dbRef.push(noteObject);
        // };
    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {
        return (
            <section className="editor">
                <label htmlFor="title" className="visuallyHidden">Text input for title of note</label>
                <input
                    className="title"
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Input title"
                    value={this.state.title}
                    onChange={this.handleChange}
                />

                <label htmlFor="body" className="visuallyHidden">Text input for body of note</label>
                <textarea
                    className="body"
                    id="body"
                    name="body"
                    placeholder="Input text"
                    value={this.state.body}
                    onChange={this.handleChange}
                ></textarea>
            </section>
        );
    };
};

export default Editor;