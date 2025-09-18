
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { tools } from './tools';
import { execSync } from 'child_process';

async function main() {
  const { toolName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'toolName',
      message: 'Select a tool to run:',
      choices: tools.map(t => ({ name: `${t.name}: ${t.description}`, value: t.name }))
    }
  ]);

  const tool = tools.find(t => t.name === toolName);
  if (!tool) {
    console.error('Tool not found.');
    return;
  }

  // Prompt for tool parameters
  const params: any = {};
  for (const [key, prop] of Object.entries(tool.input_schema.properties)) {
    if (prop.type === 'boolean') {
      params[key] = false;
      continue;
    }
    if (prop.enum) {
      params[key] = (await inquirer.prompt({ type: 'list', name: key, message: prop.description, choices: prop.enum }))[key];
    } else {
      params[key] = (await inquirer.prompt({ type: 'input', name: key, message: prop.description }))[key];
    }
  }

  // Tool handlers
  switch (tool.name) {
    case 'pretty-add-dependency': {
      try {
        execSync(`npm install ${params.package}`, { stdio: 'inherit' });
        console.log(`Dependency ${params.package} added.`);
      } catch (e) {
        console.error('Failed to add dependency:', e);
      }
      break;
    }
    case 'pretty-remove-dependency': {
      try {
        execSync(`npm uninstall ${params.package}`, { stdio: 'inherit' });
        console.log(`Dependency ${params.package} removed.`);
      } catch (e) {
        console.error('Failed to remove dependency:', e);
      }
      break;
    }
    case 'pretty-write': {
      fs.writeFileSync(params.file_path, params.content, 'utf-8');
      console.log(`File ${params.file_path} written.`);
      break;
    }
    case 'pretty-view': {
      const content = fs.readFileSync(params.file_path, 'utf-8');
      if (params.lines) {
        const [start, end] = params.lines.split('-').map(Number);
        const lines = content.split('\n').slice(start - 1, end).join('\n');
        console.log(lines);
      } else {
        console.log(content.split('\n').slice(0, 500).join('\n'));
      }
      break;
    }
    case 'pretty-line-replace': {
      let content = fs.readFileSync(params.file_path, 'utf-8');
      if (params.search) {
        content = content.replace(new RegExp(params.search, 'g'), params.replace);
      } else if (params.first_replaced_line && params.last_replaced_line) {
        const lines = content.split('\n');
        lines.splice(params.first_replaced_line - 1, params.last_replaced_line - params.first_replaced_line + 1, params.replace);
        content = lines.join('\n');
      }
      fs.writeFileSync(params.file_path, content, 'utf-8');
      console.log(`File ${params.file_path} updated.`);
      break;
    }
    case 'pretty-search-files': {
      const dir = params.include_pattern || '.';
      const regex = new RegExp(params.query, params.case_sensitive ? '' : 'i');
      function searchDir(d: string) {
        const results: string[] = [];
        for (const file of fs.readdirSync(d)) {
          const full = path.join(d, file);
          if (fs.lstatSync(full).isDirectory()) {
            results.push(...searchDir(full));
          } else if (regex.test(file)) {
            results.push(full);
          }
        }
        return results;
      }
      const found = searchDir(dir);
      console.log('Found files:', found);
      break;
    }
    case 'pretty-rename': {
      fs.renameSync(params.original_file_path, params.new_file_path);
      console.log(`Renamed ${params.original_file_path} to ${params.new_file_path}`);
      break;
    }
    case 'pretty-delete': {
      fs.unlinkSync(params.file_path);
      console.log(`Deleted ${params.file_path}`);
      break;
    }
    case 'pretty-check-file': {
      if (fs.existsSync(params.file_path)) {
        const content = fs.readFileSync(params.file_path, 'utf-8');
        console.log('File exists. Content:\n', content);
      } else {
        console.log('File does not exist.');
      }
      break;
    }
    case 'pretty-list-directory': {
      const files = fs.readdirSync(params.path);
      console.log('Files:', files);
      break;
    }
    case 'pretty-run-command': {
      try {
        execSync(params.command, { stdio: 'inherit', cwd: params.cwd || process.cwd() });
      } catch (e) {
        console.error('Command failed:', e);
      }
      break;
    }
    default:
      console.log('Tool not implemented yet.');
  }
}

main();
