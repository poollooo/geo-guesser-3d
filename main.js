import './tailwind.css'
import * as THREE from 'three'
import gsap from 'gsap'
import countries from './countries.json'
import cities from './world-cities-filtered.json'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'
import exoticPlaces from './exotic-places.json'
import * as geolib from 'geolib'



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
                value: new THREE.TextureLoader().load('https://sneakmartbucket.s3.eu-west-3.amazonaws.com/globe.jpeg')
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

function createBoxes(countries) {
    countries.forEach((country) => {
        const scale = country.population / 1000000000
        const lat = country.latlng[0]
        const lng = country.latlng[1]
        const zScale = 0.8 * scale

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.14, 0.5),
            new THREE.MeshBasicMaterial({
                color: '#3BF7FF',
                opacity: 0.4,
                transparent: true
            })
        )

        // convert lat and lng to radians, then to world coordinates
        const latitude = (lat / 180) * Math.PI
        // console.log('latitude in radians is :', latitude)
        const longitude = (lng / 180) * Math.PI
        const radius = 5
        
        const x = radius * Math.cos(latitude) * Math.sin(longitude)
        // console.log('x :', x)
        const y = radius * Math.sin(latitude)
        const z = radius * Math.cos(latitude) * Math.cos(longitude)

        box.position.x = x
        box.position.y = y
        box.position.z = z
        // console.log({x, y ,z})

        box.lookAt(0, 0, 0)

        group.add(box)

        gsap.to(box.scale, {
            z: 1.4,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'linear',
            delay: Math.random()
        })
        box.country = country.name
        box.capital = country.capital
        box.latlng = country.latlng
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

const raycaster = new THREE.Raycaster()
const popUpEl = document.querySelector('#popUpEl')
let countrySelected = []
let lastCountrySelected
let lastCoordinatesSelected


function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)
    const countryElement = document.querySelector('#countryElement')
    const countryNameElement = document.querySelector('#countryNameElement')

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(
        group.children.filter((mesh) => {
            return mesh.geometry.type === 'BoxGeometry'
        })
    )

    group.children.forEach((mesh) => {
        mesh.material.opacity = 0.4
    })

    // doesn't show the country name if there is no hover
    gsap.set(popUpEl, {
        display: 'none'
    })

    for (let i = 0; i < intersects.length; i++) {
        const box = intersects[i].object
        // console.log(intersects[i].object)
        box.material.opacity = 1
        // showes the country name if the mouse is hovering hover a country box
        gsap.set(popUpEl, {
            display: 'block'
        })

        countryElement.innerHTML = box.country

        countryNameElement.innerHTML = `Capital : ${box.capital}`
        popUpEl.addEventListener('mousedown', () => {
            countrySelected.push(box)
            lastCountrySelected = countrySelected[countrySelected.length - 1].country
            lastCoordinatesSelected = countrySelected[countrySelected.length - 1].latlng
        })
        popUpEl.addEventListener('mouseup', () => {
            countrySelected = []
        })
        // console.log('countrySelected.length - 1 is :', countrySelected.length)
    }
    renderer.render(scene, camera)
}

animate()

canvasContainer.addEventListener('mousedown', ({ clientX, clientY }) => {
    mouse.down = true;
    mouse.xPrev = clientX;
    mouse.yPrev = clientY;
    // console.log(mouse.down)
})

addEventListener('mousemove', (event) => {
    if (innerWidth >= 1280) {
        mouse.x = ((event.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1
        mouse.y = -(event.clientY / innerHeight) * 2 + 1
        // console.log(mouse.x)
    } else {
        const offset = canvasContainer.popUpElBoundingClientRect().top
        mouse.x = (event.clientX / innerWidth) * 2 - 1
        mouse.y = -((event.clientY - offset) / innerHeight) * 2 + 1
        // mouse.x = ((event.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1
        // mouse.y = -(event.clientY / innerHeight) * 2 + 1
        // console.log(mouse.y)
    }

    gsap.set(popUpEl, {
        x: event.clientX,
        y: event.clientY
    })

    if (mouse.down) {
        // event.preventDefault() is used to prevent the text on the left of the globe to get selected when the mouse is down
        event.preventDefault()
        // turn the earth
        const deltaX = event.clientX - mouse.xPrev
        const deltaY = event.clientY - mouse.yPrev

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
    // console.log(mouse.down)
})

// Game logic

// Randomly select an exotic place from the given list
function fisherYatesShuffle(arr) {
    for (let i = arr.length; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = arr[j]
        arr[j] = arr[i - 1]
        arr[i - 1] = temp
    }
}

function getRandomSelection(n, array) {
    const cloned = Array.from(array)
    fisherYatesShuffle(cloned)
    const selected = cloned.slice(0, n)
    return selected
}

let randomExoticPlacesArray = getRandomSelection(7, exoticPlaces)
console.log('random Array is :', randomExoticPlacesArray)

const playButton = document.querySelector('#play-button')
let counter = 0;
let score = 0;
let instructionTitle = document.querySelector('#instructionTitle')
let instruction = document.querySelector('#instruction')
let scoreElement = document.querySelector('#score')
let distanceInKm = 0;

playButton.addEventListener('click', () => {
    console.log('clicked on play button')
    console.log('first counter is :', counter)
    if (counter === 0) {
        gameInstructions()
        console.log('counter is', counter)
    } else if (counter <= randomExoticPlacesArray.length) {
        instructionTitle.innerHTML = `Thought it would be easy ?<br>Make your best guess !`
        instruction.innerHTML = `<img class="rounded-md" src="${randomExoticPlacesArray[counter].image}">`
        playButton.style.display = 'none'
        counter++;
    }
})

popUpEl.addEventListener('click', () => {
    let wrongGuess = 1;
    if (counter >= 2) {
        if (checkIfCountryIsCorrect(lastCountrySelected)) {
            console.log('correct')
            distance(randomExoticPlacesArray[counter - 1].latlng ,lastCoordinatesSelected)
            instructionTitle.innerHTML = `Congratttts!<br>You got it right! See, you're not that bad after all 👏`
            playButton.style.display = 'block'
            playButton.classList.add('content')
            playButton.textContent = `Show me a cool place`
            score += Math.floor((10 * distanceInKm))
            console.log('score is', score)
            scoreElement.textContent = `Score : ${score}`
        } else {
            console.log('wrong')
            distance(randomExoticPlacesArray[counter - 1].latlng ,lastCoordinatesSelected)
            instructionTitle.innerHTML = `
            You selected ${lastCountrySelected} which is ${distanceInKm} kms away..
            <br>
            You guessed wrong ${wrongGuess} times, try again!`
            wrongGuess++;
            score += Math.floor((-distanceInKm / 10))
            console.log('score is', score)
            scoreElement.textContent = `Score : ${score}`
        }
    }
})

// console.log('last lat', lastCoordinatesSelected[0])
// console.log('last long', lastCoordinatesSelected[1])

function checkIfCountryIsCorrect(country) {
    console.log('counter wazzza is', counter)
    // console.log('lastCountrySelected is :', country)
    if (country === randomExoticPlacesArray[counter - 1].country) {
        return true
    } else {
        return false
    }
}

function gameInstructions() {
    instructionTitle.innerHTML = `Welcome traveler 🌴<br> The rules of the game are simple:`
    instruction.innerHTML = `- You will be presented with images from the most exotic and remote places in the world.<br>- Your mission is to guess in which country the picture was taken. <br>- The closer you are, the more points you'll score!`
    playButton.textContent = `I'm ready to play!`
    counter++;
}



function distance(givenCoordinates ,userCoordinates) {
    //return positive latitude and longitude
    // givenCoordinates = [0,0]

    console.log('coordinate that should be negative are', userCoordinates)
    console.log('Positive coordinates which should be positive are :', userCoordinates)
    distanceInKm = Math.floor(geolib.getDistance(givenCoordinates, userCoordinates) / 1000)
    console.log('distance in km is ', distanceInKm)
}

console.log('distance is :', distanceInKm)



