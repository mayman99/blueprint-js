import { signUP, signIn, signUPMailingList } from "./modules/firebase.js";

let switchCtn = document.querySelector("#switch-cnt");
let switchC1 = document.querySelector("#switch-c1");
let switchC2 = document.querySelector("#switch-c2");
let switchCircle = document.querySelectorAll(".switch__circle");
let switchBtn = document.querySelectorAll(".switch-btn");
let aContainer = document.querySelector("#a-container");
let bContainer = document.querySelector("#b-container");
let allButtons = document.querySelectorAll(".submit");

var signUpEmail = "";
var signUpName = "";

// SignUP click
document.querySelector('#signUpButton').addEventListener('click', function() {
    userSignUp();
});

// SignIn and SignUp

function checkSignUpInputs(email){
    if(email != ""){
        return true;
    }
    else{
        return false;
    }
}

function userSignUp(){
    // signUpName = document.querySelector('#signUpName').value;
    signUpEmail = document.querySelector('#signUpEmail').value;

    if(checkSignUpInputs(signUpEmail)){
        signUPMailingList(signUpEmail);
    }
    else{
        alert("please fill in all of your Informations");
    }

}

