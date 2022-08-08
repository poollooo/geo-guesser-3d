import * as THREE from 'three'
import gsap from 'gsap'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

console.log(fragmentShader)

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
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            globeTexture: {
                value: new THREE.TextureLoader().load('./img/globe.jpeg')
            }
        }
    })
)

//create atmosphere
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        // vertexShader: atmosphereVertexShader,
        // fragmentShader: atmosphereFragmentShader
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)

atmosphere.scale.set(1.1, 1.1, 1.1)

scene.add(atmosphere)

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

camera.position.z = 14

const mouse = {
    x: undefined,
    y: undefined,
    down: false,
    xPrev: undefined,
    yPrev: undefined
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    sphere.rotation.y += 0.001
    gsap.to(group.rotation, {
        x: -mouse.y * 0.5,
        y: mouse.x * 0.5,
        duration: 2
    })
}

animate()

addEventListener('mousemove', (event) => {
    if (innerWidth >= 1280) {
        mouse.x = ((event.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1
        mouse.y = -(event.clientY / innerHeight) * 2 + 1
    } else {
        const offset = canvasContainer.getBoundingClientRect().top
        mouse.x = (event.clientX / innerWidth) * 2 - 1
        mouse.y = -((event.clientY - offset) / innerHeight) * 2 + 1
        console.log(mouse.y)
    }
    // console.log(mouse)
})
