import * as React from "react";
import { useHistory, Redirect, NavLink} from "react-router-dom";
import "./LoginView.css";


interface LoginViewState {
    loading: boolean,
    enteredServerAddress: string,
    enteredPassword: string,
    loginIsValid: boolean,
    syncProgress: number,
    redirect: string,
    loadingMessage: string
}



class LoginView extends React.Component<object, LoginViewState>{
    constructor(props){
        super(props)

        this.state = {
            loading: false, //Used to show circle loader
            enteredServerAddress: "",
            enteredPassword: "",
            loginIsValid: true, //Used to show progress bar
            syncProgress: 25,
            redirect: null,
            loadingMessage: "Syncing Database"
        }
    }

    componentDidMount(){
        document.getElementById("TitleBarRight").classList.add("loginTitleBarRight")
    }

    handleServerChange = (event) => {
        this.setState({
            enteredServerAddress: event.target.value
        })
    }

    handlePasswordChange = (event) => {
        this.setState({
            enteredPassword: event.target.value
        })
    }

    handleSubmit = () => {
        try{
            this.setState({loading: true})
            //VERIFY LOGIN HERE WITH this.state.enteredServerAddress & enteredPassword
            //If good go to messaging


            //UNCOMMENT THESE LINES TO GO TO MESSAGINGVIEW
            // document.getElementById("TitleBarRight").classList.remove("messagingTitleBarRight")
            // this.setState({redirect: "/messaging"})
        } catch(err){
            this.setState({loading: false})
        }
    }

    handleInputChange =(event) => {
        this.setState({
            enteredServerAddress: event.target.value
        })
    }


    render() {
        const setProgressPercent = {
            //Set progress % by setting width % of progressBarSpan
            width: this.state.syncProgress + '%'
        }

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect}> </Redirect>
          }
          return (
            <div className="LoginView">
                {this.state.loading ? (
                    <div id="loadingContainer">
                            {this.state.loginIsValid ? (<><h1>{this.state.loadingMessage}</h1><div id="loader"></div><div id="progressBar">
                            <span style={setProgressPercent} id="progressBarSpan"></span>
                        </div></> ): (<div id="loader"></div>)}
                        <NavLink id="skipToMessaging" to="/messaging">Skip to Messaging</NavLink>
                    </div>): (
                    <div id="loginContainer">
                        <h1>Connect to server</h1>
                        <form id="loginForm" onSubmit={this.handleSubmit}>
                            <input type="url" name="enteredServerAddress" value={this.state.enteredServerAddress} onChange={this.handleServerChange} placeholder="Server URL"></input>
                            <input type="password" name="enteredPassword" value={this.state.enteredPassword} onChange={this.handlePasswordChange} placeholder="Password"></input>
                            <button>Connect</button>
                        </form>
                        <p id="versionNumber">V1.0</p>
                    </div>
                )}
            </div>
        );        
    }
    
}

export default LoginView;
