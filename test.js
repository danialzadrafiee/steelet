const bip39 = require('bip39');

function find24thWord(mnemonic23) {
    // Convert the 23 words into binary
    const entropyBits = bip39.mnemonicToEntropy(mnemonic23) + '00000000'; // Add 8 bits for the checksum

    // Convert binary to hex
    const entropyHex = parseInt(entropyBits, 2).toString(16).padStart(64, '0');

    // Calculate the checksum
    const hash = bip39.createHash().update(Buffer.from(entropyHex, 'hex')).digest();
    const hashBits = hash.toString('binary');

    // Get the first 8 bits of the hash
    const checksum = hashBits.substring(0, 8);

    // Append the checksum to the original entropy
    const fullEntropyBits = entropyBits.substring(0, entropyBits.length - 8) + checksum;

    // Convert the full entropy bits to hex
    const fullEntropyHex = parseInt(fullEntropyBits, 2).toString(16).padStart(64, '0');

    // Convert the full entropy to a mnemonic
    const fullMnemonic = bip39.entropyToMnemonic(fullEntropyHex);

    // Return the 24th word
    return fullMnemonic.split(' ')[23];
}

const inputMnemonic = "grit camera point hamster donate napkin curtain drive hover sure million armed ask draft monitor diary frequent buddy weekend soul hunt prize jeans";
try {
    const word24 = find24thWord(inputMnemonic);
    console.log(`The 24th word is: ${word24}`);
} catch (error) {
    console.error(error.message);
}
