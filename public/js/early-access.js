import { signUP, signIn, signUPMailingList } from "./modules/firebase.js";
/*
		Designed by: SELECTO
		Original image: https://dribbble.com/shots/5311359-Diprella-Login
*/
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
$('#signUpButton').click(function() {
    userSignUp();
});


let getButtons = (e) => e.preventDefault()

let changeForm = (e) => {

    switchCtn.classList.add("is-gx");
    setTimeout(function(){
        switchCtn.classList.remove("is-gx");
    }, 1500)

    switchCtn.classList.toggle("is-txr");
    switchCircle[0].classList.toggle("is-txr");
    switchCircle[1].classList.toggle("is-txr");

    switchC1.classList.toggle("is-hidden");
    switchC2.classList.toggle("is-hidden");
    aContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-z200");
}

let mainF = (e) => {
    for (var i = 0; i < allButtons.length; i++)
        allButtons[i].addEventListener("click", getButtons );
    for (var i = 0; i < switchBtn.length; i++)
        switchBtn[i].addEventListener("click", changeForm)
}

window.addEventListener("load", mainF);


// SignIn and SignUp

function checkSignUpInputs(name, email){
    if(name != "" && email != ""){
        return true;
    }
    else{
        return false;
    }
}

function userSignUp(){
    signUpName = $('#signUpName').val();
    signUpEmail = $('#signUpEmail').val();
    if(checkSignUpInputs(signUpName, signUpEmail)){
        signUPMailingList(signUpEmail, signUpName);
    }
    else{
        alert("please fill in all of your Informations");
    }

}

