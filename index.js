const bip39 = require('bip39');
const crypto = require('crypto');
// Constants
const GEAR_SIZE = 16;

// Helper Functions
function rotateRightN(arr, n) {
    const rightPart = arr.slice(-n);
    const leftPart = arr.slice(0, -n);
    return rightPart.concat(leftPart);
}

function splitArray(arr) {
    const middleIndex = Math.floor(arr.length / 2) - 2;
    return {
        left: arr.slice(0, middleIndex),
        middle: arr.slice(middleIndex, middleIndex + 4),
        right: arr.slice(middleIndex + 4),
    };
}

function visualizeGear(gear, rotations) {
    const { left, middle, right } = splitArray(gear);
    const visualLeft = left.map(item => item ? "■" : "□").join('');
    const visualMiddle = middle.map(item => item ? "■" : "□").join('');
    const visualRight = right.map(item => item ? "■" : "□").join('');
    return `${visualLeft} ${visualMiddle} ${visualRight} : Rotate ${String(rotations / 4).padStart(2, '0')} times`;
}

function generateBinaryGear() {
    let gear = [];
    for (let i = 0; i < GEAR_SIZE; i++) {
        const binary = i.toString(2).padStart(4, '0');
        gear.push(...binary.split('').map(bit => parseInt(bit)));
    }
    return gear;
}

function binaryChunksFromMnemonic(mnemonic) {
    const wordlist = bip39.wordlists.EN;
    const words = mnemonic.split(' ');

    const binaryRepresentation = words.map(word => {
        const index = wordlist.indexOf(word);
        return index.toString(2).padStart(11, '0');
    }).join('');

    const rawBinary = binaryRepresentation.slice(0, -8);
    console.log(rawBinary);
    const chunks = [];
    for (let i = 0; i < rawBinary.length; i += 4) {
        chunks.push(Array.from(rawBinary.slice(i, i + 4)).map(bit => parseInt(bit)));
    }

    return chunks;
}

function getCylindricalRepresentation(chunks) {
    const gear = generateBinaryGear();

    const cylindrical = [];

    for (const chunk of chunks) {
        let currentGear = [...gear];
        for (let j = 0; j < gear.length / 4; j++) {
            const { middle } = splitArray(currentGear);
            if (JSON.stringify(middle) === JSON.stringify(chunk)) {
                cylindrical.push({ gear: currentGear, rotations: j * 4 });
                break;
            }
            currentGear = rotateRightN(currentGear, 4);
        }
    }

    return cylindrical;
}


function extractRawBinaryFromGear(cylindrical) {
    const wordlist = bip39.wordlists.EN;

    // 1. Convert the middle sections extracted from the gears back into their respective binary representations.
    const binaryStrings = cylindrical.map(({ gear }) => {
        const { middle } = splitArray(gear);
        return middle.join('');
    });
    // 2. Concatenate those binary strings together.
    const concatenatedBinary = binaryStrings.join('');

    // Convert concatenated binary to byte representation
    const bytes = new Uint8Array(concatenatedBinary.length / 8);
    for (let i = 0; i < concatenatedBinary.length; i += 8) {
        bytes[i / 8] = parseInt(concatenatedBinary.slice(i, i + 8), 2);
    }

    // Calculate the checksum
    const hash = crypto.createHash('sha256').update(bytes).digest();
    const mnemonicLength = concatenatedBinary.length / 11;
    const checksumLength = Math.ceil(mnemonicLength / 3);
    const checksum = hash[0].toString(2).padStart(8, '0').slice(0, checksumLength);

    // Append the checksum to the concatenated binary
    const finalBinary = concatenatedBinary + checksum;

    // 3. Split the final binary string into its 11-bit segments.
    let binaryChunks = [];
    for (let i = 0; i < finalBinary.length; i += 11) {
        binaryChunks.push(finalBinary.slice(i, i + 11));
    }

    // 4. Translate each 11-bit segment back into its corresponding word from the bip39 wordlist.
    const mnemonicWords = binaryChunks.map(binary => {
        const index = parseInt(binary, 2);
        return wordlist[index];
    });

    return mnemonicWords.join(' ');
}

// Event handlers
document.addEventListener("DOMContentLoaded", () => {
    const mnemonicInput = document.getElementById('mnemonicInput');
    const generateBtn = document.getElementById('generateBtn');
    const output = document.getElementById('output');

    generateBtn.addEventListener('click', () => {
        const mnemonic = mnemonicInput.value.trim();
        const chunks = binaryChunksFromMnemonic(mnemonic);
        const cylindrical = getCylindricalRepresentation(chunks);

        console.log(cylindrical);
        console.log(extractRawBinaryFromGear(cylindrical));
        const visualCylindrical = cylindrical.map(({ gear, rotations }) => visualizeGear(gear, rotations));
        output.innerHTML = visualCylindrical.join('<br>');
    });
});
