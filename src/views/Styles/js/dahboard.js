document.querySelector(".jsFilter").addEventListener("click", function () {
    document.querySelector(".filter-menu").classList.toggle("active");
  });
  
 
  
  var modeSwitch = document.querySelector('.mode-switch');
  modeSwitch.addEventListener('click', function () { 
   document.documentElement.classList.toggle('light');
   modeSwitch.classList.toggle('active');
  });

  var profileButton = document.querySelector('.account-info-more');
  var profileInfo = document.querySelector('.icon-container-profile')
  profileButton.addEventListener('click', function () { 
   profileInfo.classList.toggle('active');
  });


  var addProjectButton = document.querySelector('.add-Project-Button');
  var projectCreator = document.querySelector('.project-creator')
  addProjectButton.addEventListener('click', function () { 
   projectCreator.classList.toggle('active');
  });


  