// Configure dotenv to load environment variables from a .env file
require('dotenv').config();
import fs from "fs";
import Jimp = require("jimp");
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

/**
 * Downloads, filters, and saves the filtered image locally
 * @param {string} inputURL the url of the image to filter
 * @returns {Promise<string>} the absolute path to the filtered image
 */
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const photo = await Jimp.read(inputURL);
      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname + outpath, (img) => {
          resolve(__dirname + outpath);
        });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Deletes the local files that are listed in filesArray. Usefull to clean up after tasks.
 * @param {string[]} files an array of absolute paths to files
 * @returns {Promise<void>} 
 */
export async function deleteLocalFiles(files: Array<string>): Promise<void> {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}

/**
 * Checks if a supplied token is valid
 * @param {string} token the token to check
 * @returns {boolean} true if the token is valid, false otherwise
 */
export async function checkValidToken(token: string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const decoded: string | jwt.JwtPayload = jwt.verify(token, JWT_SECRET);
      resolve(true);
    } catch (error) {
      resolve(false);
    }
  });
}

/**
 * Generates a JWT token for a user
 * @param username the username to generate a token for
 * @returns {string} the generated token
 */
export async function generateToken(username: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const token: string = jwt.sign({ username }, JWT_SECRET);
      resolve(token);
    } catch (error) {
      reject(error);
    }
  });
}
