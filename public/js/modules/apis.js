import { API_URL } from "../utils/constants.js"

/* ADD User To MongoDB */
export async function addUser(uid, email, projects, username, profileimage){
   await fetch(`${API_URL}/createUser`, {
        method: 'POST',

        body: JSON.stringify({
            uid: uid,
            email: email,
            projects: projects,
            username: username,
            profileimage:  profileimage
        }),

        headers: {
            'Content-type' : 'application/json'
        }
    })
}