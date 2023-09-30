/* Demo purposes only */
$(".hover").mouseleave(
    function () {
      $(this).removeClass("hover");
    }
  );

// Get references to the HTML elements
const nameInput = document.getElementById('name-input');
const photoInput = document.getElementById('photo-input');
const profileName = document.getElementById('profile-name');
const profileImg = document.getElementById('profile-img');
const backgroundImg = document.getElementById('background-img');

// Listen for changes in the name input
nameInput.addEventListener('input', function () {
  profileName.textContent = nameInput.value;
});

// Listen for changes in the photo input
photoInput.addEventListener('change', function () {
  const selectedFile = photoInput.files[0];
  if (selectedFile) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const imageUrl = event.target.result;
      profileImg.src = imageUrl;
      backgroundImg.src = imageUrl;
    };

    reader.readAsDataURL(selectedFile);
  }
});