let hamburgerMenu = document.querySelector('.hamburgerMenu');
let submitButton = document.querySelector('.homepage-buttons');
let h2 = document.querySelector('.neon');
let imagesH2 = document.querySelector('#imagesH2');
let user;

async function images () {
    try {
        user = await axios.get('/users/user');
        user = user.data;
        // // Pre-populate the image values
        // if (user.images.profilePic !== null) {
        //     document.querySelector('#file-0' + '-preview img').src = user.images.profilePic;
        // }
        // if (user.images.otherPics.length > 0) {
        //     for (let i = 0, j = 1; i < user.images.otherPics.length; i++, j++) {
        //         document.querySelector(`#file-${j}` + '-preview img').src = user.images.otherPics[i];
        //     }
        // }
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
        //Rendering any images with a base name not seen before just breaks if there's no image with just that base name in the google cloud, so we have to upload it twice,
        //once as the base name & once with the modified name to handle duplicate image names. Only the modified name appears to be used.
        formData.append('images', proPic.files[0]);  
        formData.append('images', addPic1.files[0]);  
        formData.append('images', addPic2.files[0]);  
        formData.append('images', addPic3.files[0]);  


        if(proPic.files[0]){
            picName = proPic.files[0].name.substring(0, proPic.files[0].name.lastIndexOf('.'));
            picType = proPic.files[0].name.substring(proPic.files[0].name.lastIndexOf('.'));
            formData.append('images', proPic.files[0], picName + "-" + user._id.toString() + picType);  
        }

        if(addPic1.files[0]){
            picName = addPic1.files[0].name.substring(0, addPic1.files[0].name.lastIndexOf('.'));
            picType = addPic1.files[0].name.substring(addPic1.files[0].name.lastIndexOf('.'));
            formData.append('images', addPic1.files[0], picName + "-" + user._id.toString() + picType);
        }

        if(addPic2.files[0]){
            picName = addPic2.files[0].name.substring(0, addPic2.files[0].name.lastIndexOf('.'));
            picType = addPic2.files[0].name.substring(addPic2.files[0].name.lastIndexOf('.'));
            formData.append('images', addPic2.files[0], picName + "-" + user._id.toString() + picType);
        }

        if(addPic3.files[0]){
            picName = addPic3.files[0].name.substring(0, addPic3.files[0].name.lastIndexOf('.'));
            picType = addPic3.files[0].name.substring(addPic3.files[0].name.lastIndexOf('.'));
            formData.append('images', addPic3.files[0], picName + "-" + user._id.toString() + picType);
        }

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
            picName = url.id.substring(0, url.id.lastIndexOf('.'));
            picType = url.id.substring(url.id.lastIndexOf('.'));
            if (currUrlId === proPic.files[0]?.name) {
                currUrl = url.storage.apiEndpoint + '/' +  url.bucket.name + '/' + picName + "-" + user._id.toString() + picType;
                newData.images.profilePic = currUrl;
            }
            else if (currUrlId === addPic1.files[0]?.name ||
                currUrlId === addPic2.files[0]?.name ||
                currUrlId === addPic3.files[0]?.name) {
                currUrl = url.storage.apiEndpoint + '/' +  url.bucket.name + '/' + picName + "-" + user._id.toString() + picType;
                newData.images.otherPics.push(currUrl);
            }
        }

        res = await axios.patch(`/users/onboarding`, newData);
        window.location.href = `/users/dashboard`;


    }
    catch (e) {
        //const message = typeof e === 'string' ? e : e.message;
        errorTextElement.textContent = `Error: ${e}`;
        errorContainer.classList.remove('hidden');
    }
});

