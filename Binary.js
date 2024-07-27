// Binary encoding function
const toBinary = (str) => {
    return str.split('').map(char => char.charCodeAt(0).toString(2)).join(' ');
  };
  
  // Binary decoding function
  const fromBinary = (binaryStr) => {
    return binaryStr.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
  };
  
  // Example usage
  const postContent = "Hello, World!";
  const encodedPost = toBinary(postContent);
  const decodedPost = fromBinary(encodedPost);
  
  console.log(encodedPost);