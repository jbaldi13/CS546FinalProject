let minAgeSlider = document.getElementById("minAge");
let maxAgeSlider = document.getElementById("maxAge");
let distanceSlider = document.getElementById("maxDistance");

let minAgeOutput = document.getElementById("minAgeLabel");
let maxAgeOutput = document.getElementById("maxAgeLabel");
let distanceOutput = document.getElementById("maxDistanceLabel");

minAgeOutput.innerHTML = minAgeSlider.value; // Display the default slider value
maxAgeOutput.innerHTML = maxAgeSlider.value;
distanceOutput.innerHTML = distanceSlider.value;

// Update the current slider value (each time you drag the slider handle)
minAgeSlider.oninput = function() {
    minAgeOutput.innerHTML = this.value;
};

maxAgeSlider.oninput = function() {
    maxAgeOutput.innerHTML = this.value;
};

distanceSlider.oninput = function() {
    distanceOutput.innerHTML = this.value;
};


