import { navToRegistration, navToEarlyAccess } from "./modules/navigator.js";

const createElement = document.getElementById("create-text");
const editElement = document.getElementById("edit-text");
const regenElement = document.getElementById("regen-text");
const styleElement = document.getElementById("style-text");
const exportElement = document.getElementById("export-text");

const earlyAccessButton = document.getElementById("earlyAccessButton");
const contactNav = document.getElementById("contactNav");
const joinWaitList1 = document.getElementById("joinWaitList1");
const joinWaitList2 = document.getElementById("joinWaitList2");
const joinWaitList3 = document.getElementById("joinWaitList3");

joinWaitList1.onclick = () => {
    window.location.href = "/early-access";
    navToEarlyAccess();
}
joinWaitList2.onclick = () => {
    window.location.href = "/early-access";
    navToEarlyAccess();
}
joinWaitList3.onclick = () => {
    window.location.href = "/early-access";
    navToEarlyAccess();
}
contactNav.onclick = () => {
    window.location.href = "/early-access";
}
earlyAccessButton.onclick = () => {
    window.location.href = "/early-access";
    navToEarlyAccess();
};

const inputElements = [
    createElement, regenElement, editElement, styleElement, exportElement
];

const textsToType = [
    "Create a Livingroom",
    "Generate a new design",
    "Add a TV-Stand"
];

const typingStates = [true, true, true];
const currentTexts = ["", "", ""];
const currentIndexes = [0, 0, 0];

function typeAndDelete(index) {
    if (typingStates[index]) {
        currentTexts[index] += textsToType[index][currentIndexes[index]];
        inputElements[index].value = currentTexts[index];
        currentIndexes[index]++;

        if (currentIndexes[index] === textsToType[index].length) {
            typingStates[index] = false;
            setTimeout(() => typeAndDelete(index), 1000);
        } else {
            setTimeout(() => typeAndDelete(index), 100);
        }
    } else {
        currentTexts[index] = currentTexts[index].slice(0, -1);
        inputElements[index].value = currentTexts[index];

        if (currentTexts[index] === "") {
            typingStates[index] = true;
            currentIndexes[index] = 0;
            setTimeout(() => typeAndDelete(index), 1000);
        } else {
            setTimeout(() => typeAndDelete(index), 100);
        }
    }
}

// Start the typing and deleting animation for each text field
for (let i = 0; i < inputElements.length; i++) {
    typeAndDelete(i);
}

// typeAndDelete("Create a bedroom", createElement);
// b = typeAndDelete("furnature the bedroom", regenElement);
// c = typeAndDelete("add a tv stand", regenElement);
// d = typeAndDelete("change the room to have a japanese style", styleElement);