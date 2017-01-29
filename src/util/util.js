module.exports = {
    randomFloat (min, max) {
        return Math.random() * (max - min) - max;
    },
    randomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}