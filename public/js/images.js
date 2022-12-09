let hamburgerMenu = document.querySelector('.hamburgerMenu');
let submitButton = document.querySelector('.homepage-buttons');
let h2 = document.querySelector('.neon');
let imagesH2 = document.querySelector('#imagesH2');
let user;

async function images () {
    try {
        user = await axios.get('/users/user');
        user = user.data;
    }
    catch (e) {
        console.log(e);
    }

    if (user.images.profilePic !== null) {
        hamburgerMenu.removeAttribute('hidden');
        submitButton.innerHTML = "Save Changes";
        h2.innerHTML = "UPDATE PHOTOS";
        imagesH2.remove();
    }
}
images();

function previewBeforeUpload(id) {
    document.querySelector("#" + id).addEventListener("change", function (e) {
        if (e.target.files.length === 0) {
            return;
        }
        let file = e.target.files[0];
        let url = URL.createObjectURL(file);
        document.querySelector('#' + id + '-preview div').innerText = file.name;
        document.querySelector('#' + id + '-preview img').src = url;
    });
}

previewBeforeUpload("file-0");
previewBeforeUpload("file-1");
previewBeforeUpload("file-2");
previewBeforeUpload("file-3");

// Function to check for duplicate files in an array of input elements
function hasDuplicateFiles(inputElements) {
    // Create an array to hold the selected files
    const files = [];

    // Loop through the input elements
    for (const input of inputElements) {
        // If the input has a file selected, add it to the array of files
        if (input.files.length > 0) {
            files.push(input.files[0]);
        }
    }

    // Loop through the files
    for (let i = 0; i < files.length; i++) {
        // Check if any other files in the array have the same name as the current file
        if (files.slice(i + 1).some(file => file.name === files[i].name)) {
            // If there is a duplicate file, return true
            return true;
        }
    }

    // If no duplicate files were found, return false
    return false;
}

let proPic = document.getElementById("file-0");
let addPic1 = document.getElementById("file-1");
let addPic2 = document.getElementById("file-2");
let addPic3 = document.getElementById("file-3");
let form1 = document.getElementById("form1");
const errorContainer = document.getElementById('error-container');
const errorTextElement = errorContainer.getElementsByClassName(
    'text-goes-here'
)[0];



form1.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorContainer.classList.add('hidden');


    try {
        // Check if there are any duplicates in the selected files
        if (hasDuplicateFiles([proPic, addPic1, addPic2, addPic3])) {
            // If there are duplicates, throw an error
            throw 'You can\'t have two of the same photo';
        }

        if (proPic.value === "") throw "You must select a profile picture";
    }
    catch (e) {
        const message = typeof e === 'string' ? e : e.message;
        errorTextElement.textContent = `Error: ${message}`;
        errorContainer.classList.remove('hidden');
        return;
    }
    try {
        const formData = new FormData();

        formData.append('images', proPic.files[0]);
        formData.append('images', addPic1.files[0]);
        formData.append('images', addPic2.files[0]);
        formData.append('images', addPic3.files[0]);

        let res = await fetch('/users/onboarding/images', {
            method: 'POST',
            body: formData
        });

        // Parse the response as JSON
        const imageUrls = await res.json();


        // Loop through the image URLs
        let currUrl;
        let currUrlId;
        let newData = {images: {profilePic: "", otherPics: []}};

        for (const url of imageUrls) {
            currUrlId = url.id.replace(/%20/g, ' ');
            if (currUrlId === proPic.files[0]?.name) {
                currUrl = url.storage.apiEndpoint + '/' +  url.bucket.name + '/' + url.id;
                newData.images.profilePic = currUrl;
            }
            else if (currUrlId === addPic1.files[0]?.name ||
                currUrlId === addPic2.files[0]?.name ||
                currUrlId === addPic3.files[0]?.name) {
                currUrl = url.storage.apiEndpoint + '/' +  url.bucket.name + '/' + url.id;
                newData.images.otherPics.push(currUrl);
            }
        }

        res = await axios.patch(`/users/onboarding`, newData);
        window.location.href = `/users/dashboard`;


    }
    catch (e) {
        const message = typeof e === 'string' ? e : e.message;
        errorTextElement.textContent = `Error: ${message}`;
        errorContainer.classList.remove('hidden');
    }
});

