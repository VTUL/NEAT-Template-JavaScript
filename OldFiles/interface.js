let accordionIndex = 0;

var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      /* Toggle between adding and removing the "active" class,
      to highlight the button that controls the panel */
      this.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }

  function toggleAccordion(index) {
  const acc = document.getElementsByClassName("accordion");
  const btn = acc[index];
  if (!btn) return;

  btn.classList.toggle("active");

  const panel = btn.nextElementSibling;
  panel.style.display =
    panel.style.display === "block" ? "none" : "block";
}

const acc = document.getElementsByClassName("accordion");

  if (gp && acc.length > 0) {

    //right stick UP / DOWN selects accordion (axes[3])
    if (millis() > rightStickCooldown) {
      const selectY = gp.axes[3];

      if (selectY > 0.6) {
        accordionIndex = Math.min(accordionIndex + 1, acc.length - 1);
        rightStickCooldown = millis() + 250;
      }
      else if (selectY < -0.6) {
        accordionIndex = Math.max(accordionIndex - 1, 0);
        rightStickCooldown = millis() + 250;
      }
    }

    //B button toggles accordion (button 1)
    const bPressed = gp.buttons[1]?.pressed;
    if (bPressed && !bWasPressed) {
      toggleAccordion(accordionIndex);
    }
    bWasPressed = bPressed;

    //visual highlight
    for (let i = 0; i < acc.length; i++) {
      acc[i].classList.toggle("selected", i === accordionIndex);
    }
  }