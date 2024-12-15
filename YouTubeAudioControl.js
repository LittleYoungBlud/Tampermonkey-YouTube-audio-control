// ==UserScript==
// @name         YouTube Audio Control
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Enables Mono or Surround Sound for YouTube audio
// @author       MARSE
// @match        *://*.youtube.com/*
// @updateURL    https://raw.githubusercontent.com/LittleYoungBlud/Tampermonkey-YouTube-audio-control/refs/heads/main/YouTubeAudioControl.js
// ==/UserScript==

(function() {
  'use strict';

  let audioContext = null;
  let source = null;
  let splitter = null;
  let merger = null;
  let gainNode = null;
  let isMonoActive = false;
  let isButtonDisabled = false;  // To keep track of button state

  function enableMono(audioElement) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audioElement);
    splitter = audioContext.createChannelSplitter(2);
    merger = audioContext.createChannelMerger(1);
    gainNode = audioContext.createGain();
    gainNode.gain.value = 3; // Default to 1 (normal volume level)

    source.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 0);
    merger.connect(gainNode);
    gainNode.connect(audioContext.destination);
    isMonoActive = true;
  }

  function disableMono() {
    if (audioContext) {
      audioContext.close();
      audioContext = null;
      source = null;
      splitter = null;
      merger = null;
      gainNode = null;
      isMonoActive = false;
    }
  }

  function toggleAudioMode(audioElement) {
    if (isMonoActive) {
      disableMono();
      audioElement.src = audioElement.src; // Reload the audio element to restore default audio settings
      audioElement.load();
    } else {
      enableMono(audioElement);
    }
  }

  const button = document.createElement('button');
  button.textContent = 'Mono';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.backgroundColor = '#2196F3';
  button.style.color = '#fff';
  button.style.borderRadius = '5px';
  button.style.zIndex = 1000;

  button.addEventListener('click', () => {
    if (!isButtonDisabled) {
      const audioElement = document.querySelector('video');
      if (audioElement) {
        toggleAudioMode(audioElement);
        button.textContent = isMonoActive ? 'Surround' : 'Mono';

        isButtonDisabled = true; // Disable the button
        setTimeout(() => {
          isButtonDisabled = false; // Re-enable the button after 1000 ms
        }, 1000);
      }
    }
  });

  document.body.appendChild(button);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'VIDEO') {
            document.body.appendChild(button);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
