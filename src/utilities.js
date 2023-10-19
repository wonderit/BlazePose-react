/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as params from './params';
import * as poseDetection from '@tensorflow-models/pose-detection';

// const color = "aqua";
// const boundingBoxColor = "red";
const lineWidth = 2;

// export const tryResNetButtonName = "tryResNetButton";
export const tryResNetButtonText = "[New] Try ResNet50";
const tryResNetButtonTextCss = "width:100%;text-decoration:underline;";
const tryResNetButtonBackgroundCss = "background:#e61d5f;";

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

function setDatGuiPropertyCss(propertyText, liCssString, spanCssString = "") {
  var spans = document.getElementsByClassName("property-name");
  for (var i = 0; i < spans.length; i++) {
    var text = spans[i].textContent || spans[i].innerText;
    if (text === propertyText) {
      spans[i].parentNode.parentNode.style = liCssString;
      if (spanCssString !== "") {
        spans[i].style = spanCssString;
      }
    }
  }
}

export function updateTryResNetButtonDatGuiCss() {
  setDatGuiPropertyCss(
    tryResNetButtonText,
    tryResNetButtonBackgroundCss,
    tryResNetButtonTextCss
  );
}

/**
 * Toggles between the loading UI and the main canvas UI.
 */
export function toggleLoadingUI(
  showLoadingUI,
  loadingDivId = "loading",
  mainDivId = "main"
) {
  if (showLoadingUI) {
    document.getElementById(loadingDivId).style.display = "block";
    document.getElementById(mainDivId).style.display = "none";
  } else {
    document.getElementById(loadingDivId).style.display = "none";
    document.getElementById(mainDivId).style.display = "block";
  }
}

// function toTuple({ y, x }) {
//   return [y, x];
// }

export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
export function drawSkeleton(keypoints, ctx) {
  ctx.fillStyle = 'White';
  ctx.strokeStyle = 'White';
  ctx.lineWidth = params.DEFAULT_LINE_WIDTH;
  //movenet2blazepose
  poseDetection.util.getAdjacentPairs(params.STATE.BlazePose).forEach(([
                                                                         i, j
                                                                       ]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;
    //movenet2blazepose
    const scoreThreshold = params.BLAZEPOSE_CONFIG.scoreThreshold || 0;

    if (score1 >= scoreThreshold && score2 >= scoreThreshold
      && i >= params.BLAZEPOSE_CONFIG.indexStart
      && i <= params.BLAZEPOSE_CONFIG.indexEnd
    ) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(keypoints, ctx) {
  // movenet -> blazepose
  const keypointInd =
    poseDetection.util.getKeypointIndexBySide(params.STATE.BlazePose);
  ctx.fillStyle = 'White';
  ctx.strokeStyle = 'White';
  ctx.lineWidth = params.DEFAULT_LINE_WIDTH;


  // console.log(keypointInd["middle"]);
  for (const i of keypointInd["middle"]) {
    // console.log(keypoints);
    drawKeypoint(keypoints[i], i, ctx);
  }

  ctx.fillStyle = 'Green';
  for (const i of keypointInd.left) {
    drawKeypoint(keypoints[i], i, ctx);
  }

  ctx.fillStyle = 'Orange';
  for (const i of keypointInd.right) {
    drawKeypoint(keypoints[i], i, ctx);
  }
}

export function drawKeypoint(keypoint, idx, ctx) {
  // If score is null, just show the keypoint.
  console.log(keypoint, idx, ctx);
  const score = keypoint.score != null ? keypoint.score : 1;
  // // movenet -> blazepose
  const scoreThreshold = params.BLAZEPOSE_CONFIG.scoreThreshold || 0;

  if (score >= scoreThreshold
    && idx >= params.BLAZEPOSE_CONFIG.indexStart
    && idx <= params.BLAZEPOSE_CONFIG.indexEnd
  ) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, params.DEFAULT_RADIUS, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);
  }
}
