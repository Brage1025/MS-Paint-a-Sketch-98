document.addEventListener("DOMContentLoaded", () => {
  // The Core Variables
  const cursor = document.getElementById("cursor");
  const canvas = document.getElementById("canvas");
  const drawingLayer = document.getElementById("drawing-layer");
  const posDisplay = document.querySelector(".pos-display");
  const toolDisplay = document.querySelector(".tool-display");

  let posX = 200;
  let posY = 200;
  let trail = [{ x: posX, y: posY }];
  const step = 10;
  const cursorSize = 19;
  let currentColor = "#000000";
  const colorIndicator = document.getElementById("color-indicator");
  colorIndicator.style.backgroundColor = currentColor;

  // The Help System Variables
  const helpTopicsBtn = document.getElementById("help-topics");
  const aboutPaintBtn = document.getElementById("about-paint");
  const closeHelpBtn = document.getElementById("close-help");
  const closeAboutBtn = document.getElementById("close-about");
  const okButton = document.getElementById("ok-button");
  const helpTaskbar = document.getElementById("help-taskbar");

  const instructionsWindow = document.getElementById("instructions-window");
  const aboutWindow = document.getElementById("about-window");

  const statusBarMessage = document.querySelector(
    ".status-bar span:first-child"
  );

  // Initializing Stuff
  updateCursorPosition();
  updateClock();

  // Updating clock every minute
  setInterval(updateClock, 60000);

  // My Keyboard Navigation
  document.addEventListener("keydown", (e) => {
    const oldX = posX;
    const oldY = posY;
    let moved = false;

    switch (e.key) {
      case "ArrowUp":
        // Moves up
        posY = Math.max(0, posY - step);
        moved = true;
        break;
      case "ArrowDown":
        // Moves down
        posY = Math.min(canvas.clientHeight - cursorSize, posY + step);
        moved = true;
        break;
      case "ArrowLeft":
        // Moves Left
        posX = Math.max(0, posX - step);
        moved = true;
        break;
      case "ArrowRight":
        // Moves right
        posX = Math.min(canvas.clientWidth - cursorSize, posX + step);
        moved = true;
        break;
      case "s":
      case "S":
        // "'Shakes' the thing. Erases what you've drawn"
        shakeToErase();
        break;
      case "c":
      case "C":
        // Cycle through colors
        cycleColor();
        break;
      case "F1":
        // Opens the "Help" window (Cuz F(number) buttons used to have cool functions like that)
        openHelp();
        e.preventDefault();
        break;
    }

    if (moved) {
      trail.push({ x: posX, y: posY });
      drawLineSegment(oldX, oldY, posX, posY);
      updateCursorPosition();
      e.preventDefault();

      // Keeping the Status bar updated
      statusBarMessage.textContent =
        "Drawing... Use arrow keys or click to continue.";
      setTimeout(() => {
        statusBarMessage.textContent =
          "For Help, click Help Topics on the Help Menu.";
      }, 2000);
    }
  });

  // Click to draw to position
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left - cursorSize / 2;
    const newY = e.clientY - rect.top - cursorSize / 2;

    const constrainedX = Math.max(
      0,
      Math.min(canvas.clientWidth - cursorSize, newX)
    );
    const constrainedY = Math.max(
      0,
      Math.min(canvas.clientHeight - cursorSize, newY)
    );

    trail.push({ x: constrainedX, y: constrainedY });
    drawLineSegment(posX, posY, constrainedX, constrainedY);

    posX = constrainedX;
    posY = constrainedY;
    updateCursorPosition();
    colorIndicator.style.left = `${e.clientX - rect.left}px`;
    colorIndicator.style.top = `${e.clientY - rect.top}px`;
  });

  // The Help (my poject got to big) section

  // Open the Help Window
  helpTopicsBtn.addEventListener("click", openHelp);

  function openHelp() {
    instructionsWindow.style.display = "block";
    helpTaskbar.style.display = "flex";
    helpTaskbar.classList.add("active");

    // Updating the status bar
    statusBarMessage.textContent = "Help window opened. Click the X to close.";
  }

  // Closes the Help Window
  closeHelpBtn.addEventListener("click", () => {
    instructionsWindow.style.display = "none";
    helpTaskbar.style.display = "none";
    helpTaskbar.classList.remove("active");
    statusBarMessage.textContent =
      "For Help, click Help Topics on the Help Menu.";
  });

  // Opens the About Window
  aboutPaintBtn.addEventListener("click", () => {
    aboutWindow.style.display = "block";
    statusBarMessage.textContent = "About Paint-a-Sketch 98";
  });

  // Closes the About Window
  closeAboutBtn.addEventListener("click", closeAbout);
  okButton.addEventListener("click", closeAbout);

  function closeAbout() {
    aboutWindow.style.display = "none";
    statusBarMessage.textContent =
      "For Help, click Help Topics on the Help Menu.";
  }

  // Makes the about and instructions windows draggable (Also something I added in case the "Draw to click" thing wasn't enough)
  makeWindowDraggable(instructionsWindow);
  makeWindowDraggable(aboutWindow);

  // The Colors Selection
  const colorSwatches = document.querySelectorAll(".color-swatch");
  colorSwatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      colorSwatches.forEach((s) => s.classList.remove("selected"));
      swatch.classList.add("selected");
      currentColor = swatch.dataset.color;
      colorIndicator.style.backgroundColor = currentColor;
      toolDisplay.textContent = `Color: ${currentColor.toUpperCase()}`;
    });
  });

  // Tracks the mouse to show the Paint cursor
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Positions the cursor image at the mouse position
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
    cursor.style.display = "block";

    // Also made so the position of the color indicator matches with my vision
    colorIndicator.style.left = `${mouseX}px`;
    colorIndicator.style.top = `${mouseY}px`;
  });

  // Hides the Paint cursor when mouse leaves canvas
  canvas.addEventListener("mouseleave", () => {
    cursor.style.display = "none";
  });

  canvas.addEventListener("mouseenter", () => {
    cursor.style.display = "block";
  });

  // My Helper functions

  function updateCursorPosition() {
    if (posDisplay) {
      posDisplay.textContent = `Pos: ${posX}, ${posY}`;
    }
  }

  function drawLineSegment(x1, y1, x2, y2) {
    const line = document.createElement("div");
    line.className = "drawing-line";

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    line.style.width = `${length}px`;
    line.style.height = "2px";
    line.style.backgroundColor = currentColor;
    line.style.position = "absolute";
    line.style.left = `${x1 + 3}px`;
    line.style.top = `${y1 + cursorSize}px`;
    line.style.transformOrigin = "0 0";
    line.style.transform = `rotate(${angle}deg)`;
    line.style.zIndex = "1";
    line.style.pointerEvents = "none";

    drawingLayer.appendChild(line);
  }

  function shakeToErase() {
    cursor.classList.add("shake");
    setTimeout(() => cursor.classList.remove("shake"), 500);

    const lines = document.querySelectorAll(".drawing-line");
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.style.opacity = "0";
        setTimeout(() => line.remove(), 300);
      }, index * 10);
    });

    trail = [{ x: posX, y: posY }];
    statusBarMessage.textContent = "Shake! Drawing cleared.";
    setTimeout(() => {
      statusBarMessage.textContent =
        "For Help, click Help Topics on the Help Menu.";
    }, 2000);
  }
  // Ooo~ Colors..
  function cycleColor() {
    const colors = [
      "#000000",
      "#ff0000",
      "#008000",
      "#0000ff",
      "#ffff00",
      "#c0c0c0",
    ];
    const currentIndex = colors.indexOf(currentColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    currentColor = colors[nextIndex];

    // Updates my "UI"
    colorSwatches.forEach((swatch) => {
      swatch.classList.remove("selected");
      if (swatch.dataset.color === currentColor) {
        swatch.classList.add("selected");
        colorIndicator.style.backgroundColor = currentColor;
      }
    });

    toolDisplay.textContent = `Color: ${currentColor.toUpperCase()}`;
  }

  // ("Upgeaded" an old) Clock Function
  function updateClock() {
    const now = new Date();
    const clockElement = document.getElementById("clock");

    // An attempt to detect the user's preferred time format
    // We've not learend abut "Intl" and this but I dabbeled in it. (Apperently not all browsers supports it.) I got it to work eventualy tho..
    if (window.Intl && Intl.DateTimeFormat) {
      // Get user's locale from browser. Again trying new things since I'm gonna emulate an old OS.
      const userLocale = navigator.language || "en-US";

      // Had to scramble together a "formatter" that shoudl use the user's locale^ and shows the time
      const timeFormatter = new Intl.DateTimeFormat(userLocale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: undefined,
      });

      // Trying to format the time correctly
      const timeString = timeFormatter.format(now);

      // Updates the clock display
      clockElement.textContent = timeString;

      // Also tried to add an very old feature: Have the time update the window title to show the time (This dosn't work.. Or barely works at least. I dunno why/why not, tho my time ran out to finish this assingment..)
      updateWindowTitleTime(now, userLocale);
    } else {
      // Tried to add a fallback for the browsers that don't support "Intl"
      // I'm unsure I managed to do it or even have my code try to detect 12 or 24 hour format from the existing time string.
      const testTime = now.toLocaleTimeString();
      const is24HourFormat =
        testTime.indexOf("AM") === -1 && testTime.indexOf("PM") === -1;

      if (is24HourFormat) {
        // This 24-hour format should work
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        clockElement.textContent = `${hours}:${minutes}`;
      } else {
        // This 12-hour format seems to work
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        clockElement.textContent = `${hours}:${minutes} ${ampm}`;
      }
    }
  }

  // Tried to fix the time to window title but with only using local this time (Didn't seem to work propperly
  function updateWindowTitleTime(now, locale) {
    // Only updates the clock if the code manages to reliably detect the time format
    try {
      const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: undefined,
      });

      const timeString = timeFormatter.format(now);
      const titleElement = document.querySelector(".main-app .title");

      if (titleElement && !titleElement.dataset.originalTitle) {
        // In case the title wants to wander away, this should force it to be there
        titleElement.dataset.originalTitle = titleElement.textContent;
      }

      // Tries to impliment the time tile idea better, but I dunno
      if (titleElement && titleElement.dataset.originalTitle) {
        // Maybe it would work if I try and make it update every 10 minutes or something..
        const minutes = now.getMinutes();
        if (minutes % 10 === 0) {
          titleElement.textContent = `${titleElement.dataset.originalTitle} (${timeString})`;

          // // Tried to see if reverting after 5 seconds would help.. It didn't..
          // setTimeout(() => {
          //   if (titleElement.dataset.originalTitle) {
          //     titleElement.textContent = titleElement.dataset.originalTitle;
          //   }
          // }, 5000);
        }
      }
    } catch (e) {
      // Should silently fail if there's an issue, would be all the time as far as I noticed.
      console.debug("Couldn't update title with time");
    }
  }

  // Tested a function to verify time format detection
  function testTimeFormat() {
    const now = new Date();
    console.log("Testing time formats:");

    // Logs what the browser reports
    console.log("toLocaleTimeString():", now.toLocaleTimeString());

    // Should work as a test with different locales
    const locales = ["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP"];

    locales.forEach((locale) => {
      try {
        const formatter = new Intl.DateTimeFormat(locale, {
          hour: "numeric",
          minute: "2-digit",
        });
        console.log(`${locale}:`, formatter.format(now));
      } catch (e) {
        console.log(`${locale}: Error`);
      }
    });
  }

  // Forces the clock to update minute, first attempt at getting it to work
  // setInterval(updateClock, 60000);

  // Forces the clock to update every second (Felt it became smoother)
  setInterval(updateClock, 1000);

  // Added this to test the clock feature in console.
  //   testTimeFormat();

  // More draggable windows
  function makeWindowDraggable(windowElement) {
    const titleBar = windowElement.querySelector(".title-bar");
    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);

    function startDrag(e) {
      isDragging = true;
      const rect = windowElement.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      windowElement.style.zIndex = "100";
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();

      // Calculates the new position
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      // Should keep it within desktop size
      const desktop = document.querySelector(".desktop");
      const desktopRect = desktop.getBoundingClientRect();
      const windowRect = windowElement.getBoundingClientRect();

      const maxX = desktopRect.width - windowRect.width;
      const maxY = desktopRect.height - 50; // Leave room for taskbar

      const constrainedX = Math.max(0, Math.min(maxX, newX));
      const constrainedY = Math.max(0, Math.min(maxY, newY));

      windowElement.style.left = `${constrainedX}px`;
      windowElement.style.top = `${constrainedY}px`;
    }

    function stopDrag() {
      isDragging = false;
    }
  }

  // The hardcoded Monster Truck Madness' Error Window
  const monsterTruckIcon = document.querySelector(
    '[data-name="Monster Truck Madness"]'
  );
  const monsterErrorWindow = document.getElementById("monster-truck-error");
  const closeMonsterErrorBtn = document.getElementById("close-monster-error");
  const errorOkBtn = document.getElementById("error-ok");
  const monsterTaskbar = document.getElementById("help-taskbar"); // Reused the help taskbar to save time

  if (monsterTruckIcon && monsterErrorWindow) {
    // Creates the fake error window when the Monster Truck Madness icon is clicked
    monsterTruckIcon.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Show the error window
      monsterErrorWindow.style.display = "block";

      // Adds it to the taskbar by reusing help taskbar.
      if (monsterTaskbar) {
        monsterTaskbar.style.display = "flex";
        monsterTaskbar.classList.add("active");

        // Changes the taskbar text to show error window (This makes so if the help taskbar is opened while this "error" are already open. It will only show this, even if the "error" is closed..)
        const taskbarSpan = monsterTaskbar.querySelector("span:last-child");
        if (taskbarSpan) {
          taskbarSpan.textContent = "Monster Truck Madness";
        }
      }

      // Updates status bar
      statusBarMessage.textContent =
        "Monster Truck Madness: Insert CD-ROM to play.";

      // Makes the error window draggable
      makeWindowDraggable(monsterErrorWindow);

      // Brings it forwards
      monsterErrorWindow.style.zIndex = "100";
    });

    // Added the close button functionality
    closeMonsterErrorBtn.addEventListener("click", closeMonsterError);

    // OK button functionality
    if (errorOkBtn) {
      errorOkBtn.addEventListener("click", function () {
        closeMonsterError();

        // Shows an error message in the Paint-a-Sketch status bar, cuz why not. (Added before I realized how little time I had left on this assingment).
        statusBarMessage.textContent = "Searching for CD-ROM in drive D:...";
        setTimeout(() => {
          statusBarMessage.textContent =
            "CD-ROM not found. Please insert the Monster Truck Madness CD.";
          setTimeout(() => {
            statusBarMessage.textContent =
              "For Help, click Help Topics on the Help Menu.";
          }, 3000);
        }, 1500);
      });
    }

    function closeMonsterError() {
      monsterErrorWindow.style.display = "none";
      if (monsterTaskbar) {
        monsterTaskbar.style.display = "none";
        monsterTaskbar.classList.remove("active");

        // Resets the taskbar text
        const taskbarSpan = monsterTaskbar.querySelector("span:last-child");
        if (taskbarSpan) {
          taskbarSpan.textContent = "Paint-a-Sketch Help";
        }
      }
      statusBarMessage.textContent =
        "For Help, click Help Topics on the Help Menu.";
    }
  }

  // The menu Bar Functionality

  // Closes the main app button
  document
    .querySelector(".main-app .window-controls .close")
    .addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to close Paint-a-Sketch?\nAny unsaved work will be lost!"
        )
      ) {
        document.body.innerHTML =
          '<div class="desktop"><h1 style="color: white; text-align: center; margin-top: 200px;">Paint-a-Sketch has been closed.<br>Thank you for using this parody of Windows 98!</h1></div>';
      }
    });

  // Menu options functionality
  document.querySelectorAll(".menu-option").forEach((option) => {
    if (!option.classList.contains("separator")) {
      // Checks which menu option it is
      if (option.id === "save-menu") {
        option.addEventListener("click", takeScreenshot);
      } else if (option.id === "exit-menu") {
        // Triggers the close button on click
        option.addEventListener("click", function () {
          document.querySelector(".main-app .window-controls .close").click();
        });
      } else {
        // For all non-working menu options, show message
        option.addEventListener("click", () => {
          statusBarMessage.textContent =
            "This menu option doesn't actually do anything. It's a parody site after all!";
          setTimeout(() => {
            statusBarMessage.textContent =
              "For Help, click Help Topics on the Help Menu.";
          }, 3000);
        });
      }
    }
  });

  // The "Save" (Screenshot) function
  function takeScreenshot() {
    // Updates my status bar
    statusBarMessage.textContent = "Saving screenshot... Please wait!";

    // Targets the main app "window"
    const mainAppWindow = document.querySelector(".main-app");

    // Uses html2canvas to capture the window (This was a god find when I browsed around for saving solutions. Got some help to impliment it correctly, but man that's a cool feature!)
    html2canvas(mainAppWindow, {
      backgroundColor: "#c0c0c0", // Makes it match my Windows 98 gray background theme
      scale: 1, // 1x scale to not "fuck" with the resolution
      useCORS: true,
      allowTaint: true,
      logging: false,
    })
      .then((canvas) => {
        // Converts the canvas to a data URL
        const imageData = canvas.toDataURL("image/png");

        // Create a temporary download link
        const link = document.createElement("a");
        link.download = "Paint-a-Sketch-98-Screenshot.png";
        link.href = imageData;

        // Force triggers a download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Updates status bar
        statusBarMessage.textContent =
          "Screenshot saved as 'Paint-a-Sketch-98-Screenshot.png'!";
        setTimeout(() => {
          statusBarMessage.textContent =
            "For Help, click Help Topics on the Help Menu.";
        }, 5000);
      })
      // Had to add an error message just in case
      .catch((error) => {
        console.error("Screenshot failed:", error);
        statusBarMessage.textContent = "Screenshot failed! Try again.";
        setTimeout(() => {
          statusBarMessage.textContent =
            "For Help, click Help Topics on the Help Menu.";
        }, 3000);
      });
  }
});
