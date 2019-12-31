window.onload = function() {

	// correct mobile height
	window.addEventListener('resize', () => {
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	});

	var notes = [], playStarted = false, mouseDown = false,
		keys = ['a','w','s','e','d','f','t','g','y','h','u','j','k'],
		rate = 1;

	document.body.addEventListener("mousedown", e => mouseDown = true);
	document.body.addEventListener("mouseup", e => mouseDown = false);

	for (var i = 0; i <= 12; i++) {
		// preload audio
		var audio = new Audio();
		audio.src = "/audio/roomie/" + i + ".mp3";

		// create note
		var note = document.createElement("div");
		note.classList.add("note");

		// create fill
		var fill = document.createElement("div");
		fill.classList.add("fill");
		fill.style.backgroundImage = "url(/images/roomie/" + i + ".png)";
		note.appendChild(fill);

		// create label
		var label = document.createElement("span");
		label.innerText = keys[i].toUpperCase();
		note.appendChild(label);

		// append notes
		var whiteBox = document.getElementById('white-box'), 
			blackBox = document.getElementById('black-box');
		var blackNotes = [1,3,6,8,10];
		if (blackNotes.includes(i)) {
			note.classList.add("black");
			blackBox.appendChild(note);
		} else {
			note.classList.add("white");
			whiteBox.appendChild(note);
		}

		notes.push({
			note: note,
			fill: fill,
			label: label,
			fillStatus: 0
		});
	}
	
	notes.forEach((a,i) => {
		a.note.addEventListener("mousedown", e => playStart(i));
		a.note.addEventListener("mouseup", e => playEnd(i));
		a.note.addEventListener("mouseover", e => {if (mouseDown) playStart(i)});
		a.note.addEventListener("mouseout", e => playEnd(i));
		a.note.addEventListener("touchstart", e => {e.preventDefault(); e.stopPropagation(); playStart(i)});
		a.note.addEventListener("touchend", e => {e.preventDefault(); e.stopPropagation(); playEnd(i)});
		a.note.addEventListener("touchmove", e => {e.preventDefault(); e.stopPropagation();});
		a.note.addEventListener("touchcancel", e => {e.preventDefault(); e.stopPropagation();});
	})

	document.addEventListener("keydown", e => {
		if (keys.includes(e.key)) {
			playStart(keys.indexOf(e.key));
		}
		if (e.key === "z") changeRate(-0.1);
		if (e.key === "x") changeRate(0.1);
	})

	document.addEventListener("keyup", e => {
		if (keys.includes(e.key)) {
			playEnd(keys.indexOf(e.key));
		}
	})

	function changeRate(change) {
		// change playback rate
		rate += change;
		if (rate <= 0) rate = 0;
		var box = document.getElementById("speed-box");
		box.innerText = rate.toFixed(2);
		box.classList.toggle("fade");
	}

	function playStart(n) {
		// play sound
		var audio = new Audio("audio/roomie/" + n + ".mp3");
		audio.playbackRate = rate;
		audio.play();

		// fade out labels
		if (!playStarted) {
			playStarted = true;
			notes.forEach(n => n.label.style.opacity = 0);
		}

		// fade in fill
		notes[n].fill.style.opacity = 1;
		notes[n].fill.style.transition = "opacity .1s";

		notes[n].fillStatus = 0;
		clearTimeout(notes[n].delay)
		notes[n].delay = setTimeout(e => manageFill(n), 100)
	}

	function playEnd(n) {
		manageFill(n);
	}

	function manageFill(n) {
		notes[n].fillStatus++;
		if (notes[n].fillStatus >= 2) {
			// fade out fill
			notes[n].fill.style.opacity = 0;
			notes[n].fill.style.transition = "opacity ease-out .7s";
		}
	}

}