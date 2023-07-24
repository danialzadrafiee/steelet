from mnemonic import Mnemonic

def derive_24th_word(mnemonic_phrase):
    m = Mnemonic("english")
    
    # Convert the mnemonic to its binary representation
    binary_phrase = ''.join([bin(m.wordlist.index(word))[2:].zfill(11) for word in mnemonic_phrase.split()])
    
    # Loop through all possible 8-bit combinations
    for i in range(256):
        potential_checksum = bin(i)[2:].zfill(8)
        potential_binary_phrase = binary_phrase + potential_checksum
        
        # Convert the binary phrase back to a mnemonic
        potential_mnemonic = ''.join([m.wordlist[int(potential_binary_phrase[j:j+11], 2)] for j in range(0, len(potential_binary_phrase), 11)])
        
        # Check if the mnemonic is valid
        if m.check(potential_mnemonic):
            return potential_mnemonic.split()[-1]

    return None

# Get input from the user
mnemonic_23_words = input("Enter the first 23 words of your mnemonic, separated by spaces: ")
print("The 24th word is:", derive_24th_word(mnemonic_23_words))
