import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

async function main() {
  // Step 1: Get folder path
  const { folderPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'folderPath',
      message: 'Enter the path to the folder:',
      validate: (input: string) => fs.existsSync(input) && fs.lstatSync(input).isDirectory() ? true : 'Folder does not exist.'
    }
  ]);

  // Step 2: List files
  const files = fs.readdirSync(folderPath).filter(f => fs.lstatSync(path.join(folderPath, f)).isFile());
  if (files.length === 0) {
    console.log('No files found in the folder.');
    return;
  }

  const { fileName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'fileName',
      message: 'Select a file to edit:',
      choices: files
    }
  ]);

  const filePath = path.join(folderPath, fileName);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Step 3: Get search and replace
  const { searchText, replaceText } = await inquirer.prompt([
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
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`All occurrences of "${searchText}" replaced with "${replaceText}" in ${fileName}.`);
}

main();
