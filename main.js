import './style.css';
import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';z
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// import { VRMLoaderPlugin, VRMLookAt, VRMUtils } from '@pixiv/three-vrm';
import { VRM, VRMUtils } from '@pixiv/three-vrm';
import * as Kalidokit from 'kalidokit';

const VRMSchema = {
  Chest: "chest",
  Head: "head",
  Hips: "hips",
  Jaw: "jaw",
  LeftEye: "leftEye",
  LeftFoot: "leftFoot",
  LeftHand: "leftHand",
  LeftIndexDistal: "leftIndexDistal",
  LeftIndexIntermediate: "leftIndexIntermediate",
  LeftIndexProximal: "leftIndexProximal",
  LeftLittleDistal: "leftLittleDistal",
  LeftLittleIntermediate: "leftLittleIntermediate",
  LeftLittleProximal: "leftLittleProximal",
  LeftLowerArm: "leftLowerArm",
  LeftLowerLeg: "leftLowerLeg",
  LeftMiddleDistal: "leftMiddleDistal",
  LeftMiddleIntermediate: "leftMiddleIntermediate",
  LeftMiddleProximal: "leftMiddleProximal",
  LeftRingDistal: "leftRingDistal",
  LeftRingIntermediate: "leftRingIntermediate",
  LeftRingProximal: "leftRingProximal",
  LeftShoulder: "leftShoulder",
  LeftThumbDistal: "leftThumbDistal",
  LeftThumbIntermediate: "leftThumbIntermediate",
  LeftThumbProximal: "leftThumbProximal",
  LeftToes: "leftToes",
  LeftUpperArm: "leftUpperArm",
  LeftUpperLeg: "leftUpperLeg",
  Neck: "neck",
  RightEye: "rightEye",
  RightFoot: "rightFoot",
  RightHand: "rightHand",
  RightIndexDistal: "rightIndexDistal",
  RightIndexIntermediate: "rightIndexIntermediate",
  RightIndexProximal: "rightIndexProximal",
  RightLittleDistal: "rightLittleDistal",
  RightLittleIntermediate: "rightLittleIntermediate",
  RightLittleProximal: "rightLittleProximal",
  RightLowerArm: "rightLowerArm",
  RightLowerLeg: "rightLowerLeg",
  RightMiddleDistal: "rightMiddleDistal",
  RightMiddleIntermediate: "rightMiddleIntermediate",
  RightMiddleProximal: "rightMiddleProximal",
  RightRingDistal: "rightRingDistal",
  RightRingIntermediate: "rightRingIntermediate",
  RightRingProximal: "rightRingProximal",
  RightShoulder: "rightShoulder",
  RightThumbDistal: "rightThumbDistal",
  RightThumbIntermediate: "rightThumbIntermediate",
  RightThumbProximal: "rightThumbProximal",
  RightToes: "rightToes",
  RightUpperArm: "rightUpperArm",
  RightUpperLeg: "rightUpperLeg",
  Spine: "spine",
  UpperChest: "upperChest",
};

// Animate Rotation Helper function
const rigRotation = (name, rotation = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) => {
  if (!currentVrm) {
      return;
  }
  const Part = currentVrm.humanoid.getBoneNode(VRMSchema[name]);
  if (!Part) {
      return;
  }

  let euler = new THREE.Euler(
      rotation.x * dampener,
      rotation.y * dampener,
      rotation.z * dampener,
      rotation.rotationOrder || "XYZ"
  );
  let quaternion = new THREE.Quaternion().setFromEuler(euler);
  Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};

// Animate Position Helper Function
const rigPosition = (name, position = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) => {
  if (!currentVrm) {
      return;
  }
  const Part = currentVrm.humanoid.getBoneNode(VRMSchema[name]);
  if (!Part) {
      return;
  }
  let vector = new THREE.Vector3(position.x * dampener, position.y * dampener, position.z * dampener);
  Part.position.lerp(vector, lerpAmount); // interpolate
};

// renderer
const heightString = getComputedStyle(document.getElementById('menu')).height
const canvasHeight = window.innerHeight - heightString.substring(0, heightString.length - 2)
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, canvasHeight );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

// camera
const camera = new THREE.PerspectiveCamera( 30.0, window.innerWidth / canvasHeight, 0.1, 20.0 );
camera.position.set( 0.0, 1.0, -5.0 );

// camera controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.screenSpacePanning = true;
controls.target.set( 0.0, 1.0, 0.0 );
controls.update();

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.DirectionalLight( 0xffffff, Math.PI );
light.position.set( 1.0, 1.0, 1.0 ).normalize();
scene.add( light );

// gltf and vrm
let currentVrm = undefined;
const loader = new GLTFLoader();
loader.crossOrigin = 'anonymous';

loader.load(

  './models/29e07830-2317-4b15-a044-135e73c7f840_Ashtra.vrm',

  async ( gltf ) => {
    const vrm = await VRM.from(gltf);

    // calling these functions greatly improves the performance
    VRMUtils.removeUnnecessaryJoints( gltf.scene );

    scene.add( vrm.scene );
    currentVrm = vrm;

    console.log( vrm );
  },

  ( progress ) => console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' ),

  ( error ) => console.error( error )

);

// helpers
const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// animate
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame( animate );
  const deltaTime = clock.getDelta();
  if ( currentVrm ) {
    // update vrm
    updatePose(riggedPose)
    currentVrm.update( deltaTime );
  }
  renderer.render( scene, camera );
}

animate();

function updatePose(riggedPose) {
  rigRotation("Hips", riggedPose.Hips.rotation, 0.7);
  rigPosition(
      "Hips",
      {
          x: riggedPose.Hips.position.x, // Reverse direction
          y: riggedPose.Hips.position.y + 1, // Add a bit of height
          z: -riggedPose.Hips.position.z, // Reverse direction
      },
      1,
      0.07
  );

  rigRotation("Chest", riggedPose.Spine, 0.25, 0.3);
  rigRotation("Spine", riggedPose.Spine, 0.45, 0.3);

  rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, 0.3);
  rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, 0.3);
  rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, 0.3);
  rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, 0.3);

  rigRotation("LeftUpperLeg", riggedPose.LeftUpperLeg, 1, 0.3);
  rigRotation("LeftLowerLeg", riggedPose.LeftLowerLeg, 1, 0.3);
  rigRotation("RightUpperLeg", riggedPose.RightUpperLeg, 1, 0.3);
  rigRotation("RightLowerLeg", riggedPose.RightLowerLeg, 1, 0.3);
}

function process3(data) {
  return Array(33).fill(0).map((v, idx) => ({
    x: data[idx * 3],
    y: data[idx * 3 + 1],
    z: data[idx * 3 + 2],
    visibility: 1
  }))
}
function process4(data) {
  return Array(33).fill(0).map((v, idx) => ({
    x: data[idx * 4],
    y: data[idx * 4 + 1],
    z: data[idx * 4 + 2],
    visibility: data[idx * 4 + 3],
  }))
}
const data2d = [0.507,  0.117, -0.675,  1.   ,  0.521,  0.096, -0.631,  1.   ,
  0.533,  0.094, -0.631,  1.   ,  0.545,  0.093, -0.631,  1.   ,
  0.487,  0.1  , -0.614,  1.   ,  0.477,  0.102, -0.614,  1.   ,
  0.468,  0.103, -0.614,  1.   ,  0.562,  0.099, -0.274,  1.   ,
  0.462,  0.111, -0.196,  1.   ,  0.536,  0.133, -0.535,  1.   ,
  0.492,  0.137, -0.513,  1.   ,  0.672,  0.199, -0.033,  1.   ,
  0.416,  0.21 ,  0.062,  1.   ,  0.729,  0.337, -0.388,  0.995,
  0.389,  0.316,  0.118,  0.855,  0.676,  0.269, -1.202,  0.996,
  0.356,  0.379, -0.349,  0.901,  0.652,  0.249, -1.366,  0.992,
  0.339,  0.395, -0.451,  0.879,  0.649,  0.232, -1.395,  0.992,
  0.343,  0.388, -0.539,  0.885,  0.651,  0.239, -1.23 ,  0.987,
  0.352,  0.384, -0.395,  0.863,  0.597,  0.465,  0.056,  0.999,
  0.456,  0.46 , -0.056,  1.   ,  0.545,  0.664,  0.255,  0.687,
  0.506,  0.671, -0.254,  0.973,  0.486,  0.673,  1.218,  0.152,
  0.501,  0.884, -0.045,  0.939,  0.461,  0.695,  1.305,  0.244,
  0.494,  0.901, -0.043,  0.798,  0.488,  0.758,  1.086,  0.252,
  0.524,  0.955, -0.481,  0.885]
const data3d = [-0.017, -0.595, -0.189,  1.   , -0.015, -0.636, -0.177,  1.   ,
  -0.015, -0.636, -0.176,  1.   , -0.015, -0.637, -0.176,  1.   ,
  -0.047, -0.627, -0.17 ,  1.   , -0.047, -0.628, -0.17 ,  1.   ,
  -0.047, -0.629, -0.17 ,  1.   ,  0.05 , -0.646, -0.073,  1.   ,
  -0.094, -0.616, -0.057,  1.   ,  0.016, -0.582, -0.151,  1.   ,
  -0.026, -0.571, -0.144,  1.   ,  0.178, -0.467,  0.003,  1.   ,
  -0.138, -0.475,  0.013,  1.   ,  0.198, -0.254, -0.11 ,  0.995,
  -0.173, -0.24 ,  0.032,  0.855,  0.158, -0.335, -0.354,  0.996,
  -0.207, -0.123, -0.114,  0.901,  0.131, -0.339, -0.399,  0.992,
  -0.206, -0.074, -0.136,  0.879,  0.13 , -0.377, -0.411,  0.992,
  -0.208, -0.096, -0.164,  0.885,  0.15 , -0.352, -0.362,  0.987,
  -0.198, -0.122, -0.127,  0.863,  0.1  ,  0.008,  0.026,  0.999,
  -0.1  , -0.009, -0.024,  1.   , -0.01 ,  0.402,  0.072,  0.687,
  -0.04 ,  0.388, -0.059,  0.973, -0.06 ,  0.465,  0.339,  0.152,
  -0.013,  0.773, -0.027,  0.939, -0.058,  0.485,  0.36 ,  0.244,
  -0.01 ,  0.823, -0.03 ,  0.798, -0.037,  0.561,  0.327,  0.252,
  -0.01 ,  0.88 , -0.161,  0.885]
let pose2DLandmarks = process4(data2d)
let pose3DLandmarks = process4(data3d)
let riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
    runtime: "mediapipe",
    imageSize: {
      width: 172,
      height: 270
    }
});

let source
const connectButton = document.getElementById('connect')
const urlInput = document.getElementById('url')
urlInput.value = localStorage.getItem('url') || ''
connectButton.addEventListener('click', () => {
  if (source) {
    source.close()
    source = null
    connectButton.innerText = 'Connect'
  } else {
    const url = urlInput.value
    console.log(url)
    localStorage.setItem('url', url)
    source = new EventSource(url)
    source.addEventListener('open', () => {
      console.log('connected')
    })
    source.addEventListener('error', (e) => {
      console.error(e)
      source.close()
      connectButton.innerText = 'Close'
      source = null
    })
    source.onmessage = (data) => {
      const { pose3DLandmarks, pose2DLandmarks } = parse(data.data)
      // console.debug(pose2DLandmarks, pose3DLandmarks)
      riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
        runtime: "mediapipe",
        imageSize: {
          width: 640,
          height: 480
        }
      })
    }
    connectButton.innerText = 'Close'
  }
})

function parse(data) {
  // FIXME: resolve data_2d, data_3d
  const pose2DLandmarks = Array(33).fill(0).map(x => ({x: 0, y: 0, z: 0, visibility: 1}))
  const pose3DLandmarks = Array(33).fill(0).map(x => ({x: 0, y: 0, z: 0, visibility: 1}))
  const array = data.split(',').map(x => parseFloat(x))
  const data_2d = Array(17).fill(0).map((v, idx) => [array[17 + idx * 2], array[17 + idx * 2 + 1]])
  const data_3d = Array(17).fill(0).map((v, idx) => [array[51 + idx * 3], array[51 + idx * 3 + 1], array[51 + idx * 3 + 2]])
  pose2DLandmarks[0].x=data_2d[9][0];
  pose2DLandmarks[0].y=data_2d[9][1];
  pose2DLandmarks[0].z=0;
  pose3DLandmarks[0].x=data_3d[9][0];
  pose3DLandmarks[0].y=data_3d[9][1];
  pose3DLandmarks[0].z=data_3d[9][2];
  pose2DLandmarks[0].visibility=array[9];
  pose3DLandmarks[0].visibility=array[9];

  // i=11 14
  pose2DLandmarks[11].x=data_2d[14][0];
  pose2DLandmarks[11].y=data_2d[14][1];
  pose2DLandmarks[11].z=0;
  pose3DLandmarks[11].x=data_3d[14][0];
  pose3DLandmarks[11].y=data_3d[14][1];
  pose3DLandmarks[11].z=data_3d[14][2];
  pose2DLandmarks[11].visibility=array[14];
  pose3DLandmarks[11].visibility=array[14];

  // i=12 11
  pose2DLandmarks[12].x=data_2d[11][0];
  pose2DLandmarks[12].y=data_2d[11][1];
  pose2DLandmarks[12].z=0;
  pose3DLandmarks[12].x=data_3d[11][0];
  pose3DLandmarks[12].y=data_3d[11][1];
  pose3DLandmarks[12].z=data_3d[11][2];
  pose2DLandmarks[12].visibility=array[11];
  pose3DLandmarks[12].visibility=array[11];

  // i=13 15
  pose2DLandmarks[13].x=data_2d[15][0];
  pose2DLandmarks[13].y=data_2d[15][1];
  pose2DLandmarks[13].z=0;
  pose3DLandmarks[13].x=data_3d[15][0];
  pose3DLandmarks[13].y=data_3d[15][1];
  pose3DLandmarks[13].z=data_3d[15][2];
  pose2DLandmarks[13].visibility=array[15];
  pose3DLandmarks[13].visibility=array[15];

  // i=14 12
  pose2DLandmarks[14].x=data_2d[12][0];
  pose2DLandmarks[14].y=data_2d[12][1];
  pose2DLandmarks[14].z=0;
  pose3DLandmarks[14].x=data_3d[12][0];
  pose3DLandmarks[14].y=data_3d[12][1];
  pose3DLandmarks[14].z=data_3d[12][2];
  pose2DLandmarks[14].visibility=array[12];
  pose3DLandmarks[14].visibility=array[12];

  // i=15 16
  pose2DLandmarks[15].x=data_2d[16][0];
  pose2DLandmarks[15].y=data_2d[16][1];
  pose2DLandmarks[15].z=0;
  pose3DLandmarks[15].x=data_3d[16][0];
  pose3DLandmarks[15].y=data_3d[16][1];
  pose3DLandmarks[15].z=data_3d[16][2];
  pose2DLandmarks[15].visibility=array[16];
  pose3DLandmarks[15].visibility=array[16];

  // i=16 13
  pose2DLandmarks[16].x=data_2d[13][0];
  pose2DLandmarks[16].y=data_2d[13][1];
  pose2DLandmarks[16].z=0;
  pose3DLandmarks[16].x=data_3d[13][0];
  pose3DLandmarks[16].y=data_3d[13][1];
  pose3DLandmarks[16].z=data_3d[13][2];
  pose2DLandmarks[16].visibility=array[13];
  pose3DLandmarks[16].visibility=array[13];

  // i=17 copy i=15
  pose2DLandmarks[17].x=data_2d[16][0];
  pose2DLandmarks[17].y=data_2d[16][1];
  pose2DLandmarks[17].z=0;
  pose3DLandmarks[17].x=data_3d[16][0];
  pose3DLandmarks[17].y=data_3d[16][1];
  pose3DLandmarks[17].z=data_3d[16][2];
  pose2DLandmarks[17].visibility=array[16];
  pose3DLandmarks[17].visibility=array[16];

  // i=18 copy i=16
  pose2DLandmarks[18].x=data_2d[13][0];
  pose2DLandmarks[18].y=data_2d[13][1];
  pose2DLandmarks[18].z=0;
  pose3DLandmarks[18].x=data_3d[13][0];
  pose3DLandmarks[18].y=data_3d[13][1];
  pose3DLandmarks[18].z=data_3d[13][2];
  pose2DLandmarks[0].visibility=array[13];
  pose3DLandmarks[0].visibility=array[13];

  // i=19 copy i=15
  pose2DLandmarks[19].x=data_2d[16][0];
  pose2DLandmarks[19].y=data_2d[16][1];
  pose2DLandmarks[19].z=0;
  pose3DLandmarks[19].x=data_3d[16][0];
  pose3DLandmarks[19].y=data_3d[16][1];
  pose3DLandmarks[19].z=data_3d[16][2];
  pose2DLandmarks[19].visibility=array[16];
  pose3DLandmarks[19].visibility=array[16];

  // i=20 copy i=16
  pose2DLandmarks[20].x=data_2d[13][0];
  pose2DLandmarks[20].y=data_2d[13][1];
  pose2DLandmarks[20].z=0;
  pose3DLandmarks[20].x=data_3d[13][0];
  pose3DLandmarks[20].y=data_3d[13][1];
  pose3DLandmarks[20].z=data_3d[13][2];
  pose2DLandmarks[0].visibility=array[13];
  pose3DLandmarks[0].visibility=array[13];
  // i=23 1
  pose2DLandmarks[23].x=data_2d[1][0];
  pose2DLandmarks[23].y=data_2d[1][1];
  pose2DLandmarks[23].z=0;
  pose3DLandmarks[23].x=data_3d[1][0];
  pose3DLandmarks[23].y=data_3d[1][1];
  pose3DLandmarks[23].z=data_3d[1][2];
  pose2DLandmarks[23].visibility=array[1];
  pose3DLandmarks[23].visibility=array[1];
  // i=24 4
  pose2DLandmarks[24].x=data_2d[4][0];
  pose2DLandmarks[24].y=data_2d[4][1];
  pose2DLandmarks[24].z=0;
  pose3DLandmarks[24].x=data_3d[4][0];
  pose3DLandmarks[24].y=data_3d[4][1];
  pose3DLandmarks[24].z=data_3d[4][2];
  pose2DLandmarks[24].visibility=array[4];
  pose3DLandmarks[24].visibility=array[4];
  // i=25 2
  pose2DLandmarks[25].x=data_2d[2][0];
  pose2DLandmarks[25].y=data_2d[2][1];
  pose2DLandmarks[25].z=0;
  pose3DLandmarks[25].x=data_3d[2][0];
  pose3DLandmarks[25].y=data_3d[2][1];
  pose3DLandmarks[25].z=data_3d[2][2];
  pose2DLandmarks[25].visibility=array[2];
  pose3DLandmarks[25].visibility=array[2];
  // i=26 5 
  pose2DLandmarks[26].x=data_2d[5][0];
  pose2DLandmarks[26].y=data_2d[5][1];
  pose2DLandmarks[26].z=0;
  pose3DLandmarks[26].x=data_3d[5][0];
  pose3DLandmarks[26].y=data_3d[5][1];
  pose3DLandmarks[26].z=data_3d[5][2];
  pose2DLandmarks[26].visibility=array[5];
  pose3DLandmarks[26].visibility=array[5];
  // i=27 3
  pose2DLandmarks[27].x=data_2d[3][0];
  pose2DLandmarks[27].y=data_2d[3][1];
  pose2DLandmarks[27].z=0;
  pose3DLandmarks[27].x=data_3d[3][0];
  pose3DLandmarks[27].y=data_3d[3][1];
  pose3DLandmarks[27].z=data_3d[3][2];
  pose2DLandmarks[27].visibility=array[3];
  pose3DLandmarks[27].visibility=array[3];
  // i=28 6
  pose2DLandmarks[28].x=data_2d[6][0];
  pose2DLandmarks[28].y=data_2d[6][1];
  pose2DLandmarks[28].z=0;
  pose3DLandmarks[28].x=data_3d[6][0];
  pose3DLandmarks[28].y=data_3d[6][1];
  pose3DLandmarks[28].z=data_3d[6][2];
  pose2DLandmarks[28].visibility=array[6];
  pose3DLandmarks[28].visibility=array[6];

  return { pose2DLandmarks, pose3DLandmarks }
}
