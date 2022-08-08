import * as THREE from 'three'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer(
    {
        antialias: true
    }
)
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

//create sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    // new THREE.MeshBasicMaterial({ color: 0xFF0000 })
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('./img/globe.jpeg')
    })
)

console.log('sphere is :', sphere)
scene.add(sphere)
camera.position.z = 14

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

animate()


console.log(scene)