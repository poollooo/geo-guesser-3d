import './tailwind.css'
import * as THREE from 'three'
import gsap from 'gsap'
import countries from './countries.json'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

const canvasContainer = document.querySelector('#canvasContainer')

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer(
    {
        antialias: true,
        canvas: document.querySelector('canvas')
    }
)

renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
renderer.setPixelRatio(window.devicePixelRatio)

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

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
})

const starVertices = []
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = -Math.random() * 2300
    starVertices.push(x, y, z)
}

starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starVertices, 3)
)

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

camera.position.z = 10

// function createBox({ lat, lng, country, population }) {
//     const box = new THREE.Mesh(
//         new THREE.BoxGeometry(0.2, 0.2, 0.8),
//         new THREE.MeshBasicMaterial({
//             color: '#3BF7FF',
//             opacity: 0.4,
//             transparent: true
//         })
//     )

//     // 23.6345° N, 102.5528° W = mexico
//     const latitude = (lat / 180) * Math.PI
//     const longitude = (lng / 180) * Math.PI
//     const radius = 5

//     const x = radius * Math.cos(latitude) * Math.sin(longitude)
//     const y = radius * Math.sin(latitude)
//     const z = radius * Math.cos(latitude) * Math.cos(longitude)

//     box.position.x = x
//     box.position.y = y
//     box.position.z = z

//     box.lookAt(0, 0, 0)
//     box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.4))

//     group.add(box)

//     gsap.to(box.scale, {
//         z: 1.4,
//         duration: 2,
//         yoyo: true,
//         repeat: -1,
//         ease: 'linear',
//         delay: Math.random()
//     })
//     // box.scale.z =

//     box.country = country
//     box.population = population
// }

function createBoxes(countries) {
    countries.forEach((country) => {
        const scale = country.population / 1000000000
        const lat = country.latlng[0]
        const lng = country.latlng[1]
        const zScale = 0.8 * scale

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(
                Math.max(0.1, 0.2 * scale),
                Math.max(0.1, 0.2 * scale),
                Math.max(zScale, 0.4 * Math.random())
            ),
            new THREE.MeshBasicMaterial({
                color: '#3BF7FF',
                opacity: 0.4,
                transparent: true
            })
        )

        // convert lat and lng to radians, then to world coordinates
        const latitude = (lat / 180) * Math.PI
        const longitude = (lng / 180) * Math.PI
        const radius = 5

        const x = radius * Math.cos(latitude) * Math.sin(longitude)
        const y = radius * Math.sin(latitude)
        const z = radius * Math.cos(latitude) * Math.cos(longitude)

        box.position.x = x
        box.position.y = y
        box.position.z = z

        box.lookAt(0, 0, 0)
        box.geometry.applyMatrix4(
            new THREE.Matrix4().makeTranslation(0, 0, -zScale / 2)
        )

        group.add(box)

        gsap.to(box.scale, {
            z: 1.4,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'linear',
            delay: Math.random()
        })
        // box.scale.z =

        box.country = country.name
        box.population = new Intl.NumberFormat().format(country.population)
    })
}

createBoxes(countries)

sphere.rotation.y = -Math.PI / 2
group.rotation.offset = {
    x: 0,
    y: 0
}

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
    // sphere.rotation.y += 0.001
    // if (mouse.x) {
    //     gsap.to(group.rotation, {
    //         x: -mouse.y * 1.5,
    //         y: mouse.x * 1.5,
    //         duration: 2
    //     })
    // }
}


animate()

canvasContainer.addEventListener('mousedown', ({ clientX, clientY }) => {
    mouse.down = true;
    mouse.xPrev = clientX;
    mouse.yPrev = clientY;
    console.log(mouse.down)
})

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

    gsap.set(popUpEl, {
        x: event.clientX,
        y: event.clientY
    })

    if (mouse.down) {
        // event.preventDefault() is used to prevent the text on the left of the globe to get selected when the mouse is down
        event.preventDefault()
        // console.log('turn the earth')
        const deltaX = event.clientX - mouse.xPrev
        const deltaY = event.clientY - mouse.yPrev
        group.rotation.y += deltaX * 0.005
        group.rotation.x += deltaY * 0.005
        // console.log(deltaX)

        group.rotation.offset.x += deltaY * 0.005
        group.rotation.offset.y += deltaX * 0.005

        gsap.to(group.rotation, {
            y: group.rotation.offset.y,
            x: group.rotation.offset.x,
            duration: 2
        })
        mouse.xPrev = event.clientX
        mouse.yPrev = event.clientY
    }

    // console.log(mouse)
})

addEventListener('mouseup', () => {
    mouse.down = false;
    console.log(mouse.down)
})