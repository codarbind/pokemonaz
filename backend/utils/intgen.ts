/**
 * Generates a random integer between min and max (inclusive).
 * @param min - The minimum integer value (inclusive).
 * @param max - The maximum integer value (inclusive).
 * @returns A random integer between min and max.
 */
export function getRandomInt(min: number, max: number): number {
    // Validate inputs
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new Error("Both min and max must be integers.");
    }
    if (min > max) {
        throw new Error("Min cannot be greater than max.");
    }

    // Generate random integer
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


