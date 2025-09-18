"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function main() {
    // Step 1: Get folder path
    const { folderPath } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'folderPath',
            message: 'Enter the path to the folder:',
            validate: (input) => fs_1.default.existsSync(input) && fs_1.default.lstatSync(input).isDirectory() ? true : 'Folder does not exist.'
        }
    ]);
    // Step 2: List files
    const files = fs_1.default.readdirSync(folderPath).filter(f => fs_1.default.lstatSync(path_1.default.join(folderPath, f)).isFile());
    if (files.length === 0) {
        console.log('No files found in the folder.');
        return;
    }
    const { fileName } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'fileName',
            message: 'Select a file to edit:',
            choices: files
        }
    ]);
    const filePath = path_1.default.join(folderPath, fileName);
    let content = fs_1.default.readFileSync(filePath, 'utf-8');
    // Step 3: Get search and replace
    const { searchText, replaceText } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'searchText',
            message: 'Enter the word or sentence to replace:'
        },
        {
            type: 'input',
            name: 'replaceText',
            message: 'Enter the replacement text:'
        }
    ]);
    // Step 4: Replace and save
    const regex = new RegExp(searchText, 'g');
    const newContent = content.replace(regex, replaceText);
    fs_1.default.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`All occurrences of "${searchText}" replaced with "${replaceText}" in ${fileName}.`);
}
main();
