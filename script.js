document.addEventListener("DOMContentLoaded", () => {
    const imageUpload = document.getElementById("imageUpload");
    const scanButton = document.getElementById("scanButton");
    const captureButton = document.getElementById("captureButton");
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const output = document.getElementById("output");
    let selectedLanguage = 'eng'; // Default language
    let stream = null; // Store webcam stream

    // Function to extract text from an image using Tesseract.js
    function recognizeText(image) {
        output.value = "Processing...";
        console.log(`Recognizing text in language: ${selectedLanguage}`);

        Tesseract.recognize(
            image,
            selectedLanguage,
            { logger: m => console.log(m) } // Log progress
        ).then(({ data: { text } }) => {
            output.value = text.trim() || "No readable text found!";
            console.log(`Extracted text: ${text}`);
        }).catch(error => {
            output.value = "Error recognizing text!";
            console.error(error);
        });
    }

    // Function to stop the webcam
    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop(); // Stop each track
            });
            video.srcObject = null; // Disconnect stream from video
            stream = null; // Clear stream variable
            console.log("Webcam stopped.");
        }
        video.style.display = "none"; // Hide the video
        captureButton.style.display = "none"; // Hide capture button
    }

    // Handle image upload
    imageUpload.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                console.log("Image uploaded successfully.");
                recognizeText(reader.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Stop the webcam when switching to image upload
    imageUpload.addEventListener("click", function(event) {
        stopWebcam(); // Stop the webcam when clicking image upload button
    });

    // Open webcam
    scanButton.addEventListener("click", async function() {
        stopWebcam(); // Ensure any previous webcam session is stopped before opening a new one
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } }); // Increase resolution
            video.srcObject = stream;
            video.style.display = "block"; // Show the video
            video.style.width = "100%"; // Ensure the video takes up the full width of its container
            video.style.maxWidth = "1920px"; // Set a maximum width to match the resolution
            video.style.height = "auto"; // Maintain aspect ratio
            captureButton.style.display = "block"; // Show capture button
            console.log("Webcam opened.");
        } catch (error) {
            console.error("Error accessing webcam:", error);
            alert("Could not access the webcam. Please check your permissions.");
        }
    });

    // Capture image from webcam, recognize text, and turn off the webcam
    captureButton.addEventListener("click", function() {
        if (!stream) return;
    
        const ctx = canvas.getContext("2d");
    
        // Set canvas size to match video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    
        // Capture the frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        // Convert to JPEG for better recognition
        const imageDataURL = canvas.toDataURL("image/jpeg", 1.0); // Increase quality to 1.0
        console.log("Captured image from webcam.");
    
        // Recognize text
        recognizeText(imageDataURL);
    
        // Turn off the webcam
        stopWebcam();
    });

    // Handle language selection
    document.querySelectorAll('.language-selection button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.language-selection button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedLanguage = this.getAttribute('data-lang');
            console.log(`Language selected: ${selectedLanguage}`);
        });
    });
});
