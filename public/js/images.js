const userId = document.getElementById("id").innerText;

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

let proPic = document.getElementById("file-0");
let addPic1 = document.getElementById("file-1");
let addPic2 = document.getElementById("file-2");
let addPic3 = document.getElementById("file-3");
let form1 = document.getElementById("form1");
let form2 = document.getElementById("form2");
const errorContainer = document.getElementById('error-container');
const errorTextElement = errorContainer.getElementsByClassName(
    'text-goes-here'
)[0];
let otherPics = [];
const newData = {images: {profilePic: "", otherPics: {other1: "", other2: "", other3: ""}}};

async function submitForms() {
    errorContainer.classList.add('hidden');
    try {
        if (proPic.value === "") throw "You must select a profile picture";
    }
    catch (e) {
        const message = typeof e === 'string' ? e : e.message;
        errorTextElement.textContent = `Error: ${message}`;
        errorContainer.classList.remove('hidden');
        return;
    }
    try {
        console.log(addPic2.value);
        if (proPic.value === addPic1.value || proPic.value === addPic2.value ||
            proPic.value === addPic3.value) throw 'You can\'t have two of the same photo';
        newData.images.profilePic = proPic.value;
        if (newData.images.otherPics.other1 !== addPic1.value) {
            if (addPic1.value === proPic.value || addPic1.value === addPic2.value ||
                addPic1.value === addPic3.value) throw 'You can\'t have two of the same photo';
            newData.images.otherPics.other1 = addPic1.value;
        }
        if (newData.images.otherPics.other2 !== addPic2.value) {
            if (addPic2.value === proPic.value || addPic2.value === addPic1.value ||
                addPic2.value === addPic3.value) throw 'You can\'t have two of the same photo';
            newData.images.otherPics.other2 = addPic2.value;
        }
        if (newData.images.otherPics.other3 !== addPic3.value) {
            if (addPic3.value === proPic.value || addPic3.value === addPic1.value ||
                addPic3.value === addPic2.value) throw 'You can\'t have two of the same photo';
            newData.images.otherPics.other3 = addPic3.value;
        }

        window.location.href = `/users/dashboard`;
        let res = await axios.patch(`/users/onboarding/${userId}`, newData);
    }
    catch (e) {
        const message = typeof e === 'string' ? e : e.message;
        errorTextElement.textContent = `Error: ${message}`;
        errorContainer.classList.remove('hidden');
    }



}