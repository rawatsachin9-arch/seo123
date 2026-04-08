function generateVariations(airline, keyword) {
  return [
    `${airline} ${keyword}`,
    `How to ${keyword} ${airline}`,
    `${airline} ${keyword} help`,
    `${keyword} support ${airline}`,
    `${airline} ${keyword} phone number`
  ];
}

module.exports = generateVariations;
