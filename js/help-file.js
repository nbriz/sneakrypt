module.exports = `
A simple CLI for synchronously encrypting and decrypting text files modeled on the classic hacker film Sneakers, because there's no technical reason hacking can't look the way it does in the movies.

Commands:
  e, encrypt       encrypt a message or text file
  d, decrypt       decrypt a message or text file

Options:
  -h              display this help file
  -m              message to encrypt or decrypt
  -f              path to file to encrypt or decrypt
  -o              path to save the output file

Examples:
  sneakrypt encrypt -m "hello world"
  sneakrypt encrypt -f ~/Desktop/message.txt
  sneakrypt encrypt -m "hello world" -o ~/Desktop/encrypted.txt
  sneakrypt decrypt -f ~/Desktop/encrypted.txt
`
