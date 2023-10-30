import { navToRegistration } from "./modules/navigator.js";

$('.getStartedButton').click(function() {
 navToRegistration();
});

const createElement = document.getElementById("create-text");
const editElement = document.getElementById("edit-text");
const regenElement = document.getElementById("regen-text");
const styleElement = document.getElementById("style-text");
const exportElement = document.getElementById("export-text");


const inputElements = [
    createElement, editElement, regenElement, styleElement, exportElement
];

const textsToType = [
    "Create a bedroom",
    "Add a dinning table set and a tv-stand",
    "Generate a new design",
    "add a tv stand",
    "change the room to have a japanese style"
];

const typingStates = [true, true, true, true];
const currentTexts = ["", "", "", ""];
const currentIndexes = [0, 0, 0, 0];

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